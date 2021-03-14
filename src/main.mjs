import occult from "./occult.mjs";
import union from "./union.mjs";
import fill from "./fill.mjs";
import groupByColor from "./groupByColor.mjs";
import { log, toOrderedPaths, closeVisuallyClosedPaths } from "./utils.mjs";

export async function occultAndFill(item, options = {}) {
  let paths = toOrderedPaths(item, options);
  if (options.autoClosePaths) closeVisuallyClosedPaths(paths);
  if (options.occult) paths = await occult(paths, options);
  if (options.union) paths = union(paths, options); // union after occult so that paths are flat and we maximize unions

  if (options.fillType) {
    const fillPaths = await fill(paths, options);
    log("FILLING", "DONE");
    paths = paths.concat(fillPaths);
  }

  if (options.colorGroups) paths = groupByColor(paths);

  paper.project.clear();
  paper.project.activeLayer.addChildren(paths);
  console.log(paper.view.viewSize);
}
