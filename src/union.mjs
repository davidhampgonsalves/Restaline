import { log } from "./utils.mjs";

const PHASE = "Unioning";

export default function union(paths, options) {
  log(PHASE);

  const unitedPaths = [];
  const skipIndexes = [];
  paths.forEach((path, i) => {
    if (!path.hasFill()) {
      // only union filled paths
      unitedPaths.push(path);
      skipIndexes.push(i);
      return;
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
        j = i + 1; // since we probably enlarged the path recheck other paths we may have skipped on previous passes
      }
    }

    unitedPaths.push(path);
  });

  log(PHASE, "DONE");
  return unitedPaths;
}
