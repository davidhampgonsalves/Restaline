import { occult } from "./occult.mjs";
import { log } from "./utils.mjs";

export async function occultAndFill(item, options = {}) {
  paper.project.clear();
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  const promises = [];
  const occultedPaths = await occult(item, options);
  occultedPaths
    .filter((p) => p.closed) // do not fill unclosed paths
    .forEach((path) => {
      if (options.inset) {
        let inset;
        // inset the fill path
        const offset = options.spacing * (path.className === "Path" ? -1 : 1);
        inset = PaperOffset.offset(path, offset, { join: "round" });
        const pathArea = path.area;
        // PaperOffset sometimes flips the inset direction (usually on CompoundPaths) so sanity check / reverse
        if (inset.area > pathArea) {
          inset.remove();
          inset = PaperOffset.offset(path, -offset, { join: "round" });
          if (inset.area > pathArea) {
            // we can't win, looks like insetting isn't possible
            inset.remove();
            inset = path.clone();
          }
        }
        path = inset;
      }

      const workerPromise = new Promise((resolve, reject) => {
        const worker = new Worker(`/src/workers/fillPaths.js`);
        worker.addEventListener("message", (event) => resolve(event.data));
        worker.addEventListener("error", reject);
        worker.postMessage({ pathJSON: path.exportJSON(), options });
      });
      promises.push(workerPromise);
    });

  let fillJSON;
  try {
    await Promise.all(promises).then((paths) => {
      fillJSON = paths;
    });
  } catch (e) {
    console.error(e);
  }
  const fillPaths = fillJSON
    .flat()
    .map((json) => paper.project.importJSON(json));

  // todo: move into occult
  if (options.fillType)
    // if fills were generated then remove basic shape fills
    occultedPaths.forEach((p) => {
      p.strokeColor = p.strokeColor || p.fillColor;
      p.fillColor = null;
    });

  paper.project.activeLayer.addChildren(occultedPaths);
  paper.project.activeLayer.addChildren(fillPaths);

  log("FILLING", "DONE");
}
