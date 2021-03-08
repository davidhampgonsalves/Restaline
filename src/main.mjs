import { occult } from "./occult.mjs";
import { union } from "./union.mjs";
import { fill } from "./fill.mjs";
import { log, toOrderedPaths, closeVisuallyClosedPaths } from "./utils.mjs";

export async function occultAndFill(item, options = {}) {
  paper.project.clear();
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  let paths = toOrderedPaths(item, options);
  if (options.autoClosePaths) closeVisuallyClosedPaths(paths);
  if (options.occult) paths = await occult(paths, options);
  if (options.union) paths = union(paths, options);
  paper.project.activeLayer.addChildren(paths);

  if (options.fillType) {
    const fillPaths = await fill(paths, options);
    paper.project.activeLayer.addChildren(fillPaths);
    log("FILLING", "DONE");
  }
}
