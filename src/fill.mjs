import { inset } from "./inset.mjs";
import { log } from "./utils.mjs";

export default async function fill(paths, size, options) {
  log("Filling");
  const promises = [];
  paths
    .filter((p) => p.closed && p.hasFill()) // do not fill unclosed or unfilled paths
    .forEach((path) => {
      if (options.inset) path = inset(path, options); // inset lib needs DOM so do this in browser thread

      const workerPromise = new Promise((resolve, reject) => {
        const worker = new Worker(`/src/workers/fillPaths.js`);
        worker.addEventListener("message", (event) => resolve(event.data));
        worker.addEventListener("error", reject);
        worker.postMessage({ pathJSON: path.exportJSON(), options, size });
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

  log("FILLING", "DONE");
  return fillPaths;
}
