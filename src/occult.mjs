import { log } from "./utils.mjs";

const PHASE = "Occulting";

export function occult(item, options) {
  log(PHASE, "squashing and ordering paths");
  let paths = toOrderedPaths(item, options);
  log(PHASE, "closed paths", paths.length);

  // todo: webworker
  paths = subtractClosedPaths(paths);
  log(PHASE, "open paths", paths.length);
  paths = subtractOpenPaths(paths);
  // end web worker

  log(PHASE, "DONE");
  return paths;
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

// todo: avoid map final empty check
function subtractClosedPaths(paths) {
  return paths
    .map((path, i) => {
      log(PHASE, "closed paths", paths.length, i + 1);
      if (i + 1 >= paths.length) return path;
      if (!path.closed) return path;

      let isEmpty = false;
      paths.slice(i + 1).forEach((path2) => {
        if (isEmpty) return; // if path has become empty then stop
        if (!path2.closed) return;

        const tmp = path.subtract(path2);
        path.remove();
        path = tmp;
        if (path.isEmpty(true)) isEmpty = true;
      });

      if (window.DEBUG) path.strokeColor = "black";
      return path;
    })
    .filter((path) => !path.isEmpty());
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

function isPartOfPath(curve, path) {
  const pt = curve.getLocationAt(curve.length / 2).point;
  return path.getOffsetOf(pt) != null;
}
