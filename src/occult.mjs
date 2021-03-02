export function occult(item) {
  let paths = toOrderedPaths(item);
  paths = subtractClosedPaths(paths);
  paths = subtractOpenPaths(paths);
  return paths;
}

function toOrderedPaths(item, paths = []) {
  if (item.className === "Shape") {
    const tmp = item.toPath();
    item.remove();
    item = tmp;
    console.log("SHAPE! this will mess up layer order?");
  }

  if (item.className === "Group" || item.className === "Layer") {
    paths = paths.concat(
      item.children.map((item) => toOrderedPaths(item)).flat()
    );
  } else if (item.className === "Path") {
    paths.push(item);
  } else if (item.className === "CompoundPath") {
    paths.push(...item.children);
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

  paths.forEach((path, i) => {
    if (path.closed || i + 1 >= paths.length) {
      subtracted.push(path);
      return;
    }

    paths.slice(i + 1).forEach((path2) => {
      if (!path2.closed) return;

      let tmp = path.subtract(path2, { insert: false });
      tmp = tmp.className === "CompoundPath" ? tmp.children : [tmp];
      tmp.forEach((t) => {
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
