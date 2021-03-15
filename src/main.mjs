import occult from "./occult.mjs";
import union from "./union.mjs";
import fill from "./fill.mjs";
import sortPaths from "./sortPaths.mjs";
import groupByColor from "./groupByColor.mjs";
import { log, toOrderedPaths, closeVisuallyClosedPaths } from "./utils.mjs";

export async function occultAndFill(item, size, options = {}) {
  const sizePair = [size.width, size.height];
  let paths = toOrderedPaths(item, options);
  if (options.autoClosePaths) closeVisuallyClosedPaths(paths);
  if (options.occult) paths = await occult(paths, sizePair, options);
  if (options.union) paths = union(paths, options); // union after occult so that paths are flat and we maximize unions

  if (options.fillType) {
    const fillPaths = await fill(paths, sizePair, options);
    log("FILLING", "DONE");
    paths = paths.concat(fillPaths);
  }

  paths = paths.filter((p) => !p.isEmpty(true));
  paths = sortPaths(paths);
  if (options.colorGroups) paths = groupByColor(paths);

  return paths;
}
