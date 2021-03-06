import { log } from "./utils.mjs";

const PHASE = "Occulting";

export async function occult(item, options) {
  log(PHASE, "squashing and ordering paths");
  const paths = toOrderedPaths(item, options);
  const pathsJSON = paths.map((p) => p.exportJSON());

  const occultedPaths = await spawnSubtractionWorkers(paths, pathsJSON);

  log(PHASE, "DONE");
  return occultedPaths;
}

async function spawnSubtractionWorkers(paths, pathsJSON) {
  const promises = [];
  paths.forEach((path, i) => {
    const pathsToSubtractJSON = pathsJSON.slice(i + 1);

    const workerPromise = new Promise((resolve, reject) => {
      const worker = new Worker(
        `/src/workers/subtract${path.closed ? "Closed" : "Open"}Paths.js`
      );
      worker.addEventListener("message", (event) => resolve(event.data));
      worker.addEventListener("error", reject);

      worker.postMessage({ pathJSON: pathsJSON[i], pathsToSubtractJSON });
    });
    promises.push(workerPromise);
  });

  try {
    const rc = await Promise.all(promises).then(
      (paths) =>
        paths
          .filter((p) => p !== null)
          .map((json) => paper.project.importJSON(json)) // filter any paths that were empty as a result of subtraction
    );
    return rc;
  } catch (e) {
    console.error(e);
  }
}

function toOrderedPaths(item, options, paths = []) {
  if (item.className === "Shape") {
    const tmp = item.toPath({ insert: true });
    item.remove();
    item = tmp;
  }

  if (item.className === "Group" || item.className === "Layer") {
    item.children.forEach((item) => {
      toOrderedPaths(item, options).forEach((op) => paths.push(op));
    });
  } else if (item.className === "Path" || item.className === "CompoundPath") {
    paths.push(item);
  } else console.log("skipped item type: ", item.className);

  if (options.autoClosePaths) closeVisuallyClosedPaths(paths);
  return paths.sort((a, b) => a.isAbove(b));
}

const VISUALLY_CLOSED_CUTOFF = 1;
function closeVisuallyClosedPaths(paths) {
  paths.forEach((path) => {
    if (path.className === "CompoundPath")
      return closeVisuallyClosedPaths(path.children);

    const distance = path.firstSegment.point.getDistance(
      path.lastSegment.point
    );
    if (distance < VISUALLY_CLOSED_CUTOFF) path.closed = true;
  });
}

function subtractOpenPaths(paths) {
  const subtracted = [];
  const totalPaths = paths.length;

  paths.forEach((originalPath, i) => {
    log(PHASE, "open paths", totalPaths, i + 1);
    if (originalPath.closed || i >= paths.length - 1) {
      subtracted.push(originalPath);
      return;
    }

    let path = originalPath;
    let isEmpty = false;
    paths.slice(i + 1).forEach((path2) => {
      if (!path2.closed) return;
      if (isEmpty) return; // if path has become empty then stop
      path = path.subtract(path2, { insert: false });
      if (path.isEmpty(true)) isEmpty = true;
    });

    (path.children || [path]).forEach((p) => {
      let occultedPath = new paper.Path();
      p.curves.forEach((c) => {
        if (isPartOfPath(c, originalPath)) {
          if (occultedPath.segments.lastSegment != c.segment1) {
            occultedPath.strokeColor = originalPath.strokeColor;
            occultedPath.insertAbove(originalPath);
            occultedPath = new paper.Path();
          }
          if (occultedPath.segments.length === 0) occultedPath.add(c.segment1);
          occultedPath.add(c.segment2);
        }
      });
      occultedPath.strokeColor = originalPath.strokeColor;
      originalPath.replaceWith(occultedPath);
      subtracted.push(occultedPath);
    });
  });

  return subtracted.filter((path) => !path.isEmpty());
}
