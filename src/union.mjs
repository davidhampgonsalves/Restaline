import { log } from "./utils.mjs";

const PHASE = "Unioning";

export function union(paths, options) {
  log(PHASE, "Unioning paths");

  const unitedPaths = [];
  const skipIndexes = [];
  paths.forEach((path, i) => {
    if (!path.fillColor) {
      unitedPaths.push(path);
      return; // only union filled paths
    }
    if (skipIndexes.includes(i)) return; // already united

    const pathsLength = paths.length;
    for (var j = i + 1; j < pathsLength; j++) {
      if (skipIndexes.includes(j)) continue;

      const path2 = paths[j];
      if (path.fillColor.equals(path2.fillColor)) {
        if (!path.intersects(path2)) continue;
        path = path.unite(path2, { insert: false });
        skipIndexes.push(j);
      } else {
        const intersections = path.getIntersections(
          path2,
          (inter) => inter.isCrossing() && inter.path.equals(path2)
        );
        if (intersections.length > 0) {
          unitedPaths.push(path);
          return;
        }
      }
    }

    unitedPaths.push(path);
  });

  return unitedPaths;
}
