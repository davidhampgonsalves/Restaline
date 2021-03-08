import { occult } from "./occult.mjs";
import { union } from "./union.mjs";
import { inset } from "./inset.mjs";
import { log, toOrderedPaths, closeVisuallyClosedPaths } from "./utils.mjs";

export async function occultAndFill(item, options = {}) {
  paper.project.clear();
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  const promises = [];
  let paths = toOrderedPaths(item, options);
  if (options.autoClosePaths) closeVisuallyClosedPaths(paths);
  if (options.occult) paths = await occult(paths, options);
  if (options.union) paths = union(paths, options);
  paths
    .filter((p) => p.closed) // do not fill unclosed paths
    .forEach((path) => {
      if (options.inset) path = inset(path, options);

      const workerPromise = new Promise((resolve, reject) => {
        const worker = new Worker(`/src/workers/fillPaths.js`);
        worker.addEventListener("message", (event) => resolve(event.data));
        worker.addEventListener("error", reject);
        worker.postMessage({ pathJSON: path.exportJSON(), options });
      });
      promises.push(workerPromise);
    });

  let fillsJSON;
  try {
    await Promise.all(promises).then((paths) => {
      fillsJSON = paths;
    });
  } catch (e) {
    console.error(e);
  }
  const fillPaths = fillsJSON
    .flat()
    .map((json) => paper.project.importJSON(json));

  // todo: move into occult
  if (options.fillType)
    // if fills were generated then remove fillColor
    paths.forEach((p) => {
      p.strokeColor = p.strokeColor || p.fillColor;
      p.fillColor = null;
    });

  paper.project.activeLayer.addChildren(paths);
  paper.project.activeLayer.addChildren(fillPaths);

  log("FILLING", "DONE");
}
