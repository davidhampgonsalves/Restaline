import { log } from "./utils.mjs";

const PHASE = "Occulting";

export function occult(item) {
  log(PHASE, "squashing and ordering paths");
  let paths = toOrderedPaths(item);
  log(PHASE, "closed paths", paths.length);
  paths = subtractClosedPaths(paths);
  log(PHASE, "open paths", paths.length);
  paths = subtractOpenPaths(paths);
  log(PHASE, "DONE");
  return paths;
}

function toOrderedPaths(item, paths = []) {
  if (item.className === "Shape") {
    const tmp = item.toPath();
    item.remove();
    item = tmp;
    console.log("SHAPE! will this mess up layer order?");
  }

  if (item.className === "Group" || item.className === "Layer") {
    item.children.forEach((item) => {
      toOrderedPaths(item).forEach((op) => paths.push(op));
    });
  } else if (item.className === "Path" || item.className === "CompoundPath") {
    paths.push(item);
  } else console.log("skipped item type: ", item.className);

  return paths.sort((a, b) => a.isAbove(b));
}

function isPartOfPath(curve, path) {
  const testPoints = [
    curve.point1,
    curve.point2,
    curve.getLocationAt(curve.length / 2).point,
  ];
  return testPoints.every((pt) => path.getOffsetOf(pt) != null);
}

function subtractClosedPaths(paths) {
  return paths
    .map((path, i) => {
      log(PHASE, "closed paths", paths.length, i + 1);
      if (i + 1 >= paths.length) return path;
      if (!path.closed) return path;

      paths.slice(i + 1).forEach((path2) => {
        if (!path2.closed) return;

        const tmp = path.subtract(path2);
        path.remove();
        path = tmp;
      });

      if (window.DEBUG) path.strokeColor = "black";
      return path;
    })
    .filter((path) => !path.isEmpty());
}

function subtractOpenPaths(paths) {
  const subtracted = [];
  const totalPaths = paths.length;

  paths.forEach((path, i) => {
    log(PHASE, "open paths", totalPaths, i + 1);
    if (path.closed || i >= paths.length - 1) {
      subtracted.push(path);
      return;
    }

    paths.slice(i + 1).forEach((path2) => {
      if (!path2.closed) return;

      let tmp = path.subtract(path2, { insert: false });
      tmp = tmp.className === "CompoundPath" ? tmp.children : [tmp];
      tmp.forEach((t, i) => {
        let newPath;
        t.curves.forEach((c) => {
          if (isPartOfPath(c, path)) {
            if (!newPath) newPath = new paper.Path();
            newPath.add(c.segment1, c.segment2);
          }
        });
        if (newPath) {
          newPath.strokeColor = path.strokeColor;
          subtracted.push(newPath);
        }
      });
      path.remove();
    });
  });

  return subtracted.filter((path) => !path.isEmpty());
}
