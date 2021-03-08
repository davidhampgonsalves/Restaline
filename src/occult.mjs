import { log } from "./utils.mjs";

const PHASE = "Occulting";

export async function occult(paths, options) {
  log(PHASE, "squashing and ordering paths");
  const pathsJSON = paths.map((p) => p.exportJSON());

  const occultedPaths = await spawnSubtractionWorkers(paths, pathsJSON);

  log(PHASE, "DONE");
  return occultedPaths;
}

async function spawnSubtractionWorkers(paths, pathsJSON) {
  const promises = [];
  paths.forEach((path, i) => {
    const workerPromise = new Promise((resolve, reject) => {
      const worker = new Worker(
        `/src/workers/subtract${path.closed ? "Closed" : "Open"}Paths.js`
      );
      worker.addEventListener("message", (event) => resolve(event.data));
      worker.addEventListener("error", reject);

      const pathsToSubtractJSON = pathsJSON.slice(i + 1);
      worker.postMessage({ pathJSON: pathsJSON[i], pathsToSubtractJSON });
    });
    promises.push(workerPromise);
  });

  try {
    const rc = await Promise.all(promises).then(
      (paths) =>
        paths
          .filter((p) => p !== null)
          .map((json) => paper.project.importJSON(json)) // filter any paths that were empty as a result of subtraction
    );
    return rc;
  } catch (e) {
    console.error(e);
  }
}
