importScripts("/node_modules/paper/dist/paper-core.js");

paper.install(this);

onmessage = function ({ data: { pathJSON, size, pathsToSubtractJSON } }) {
  paper.setup(size);
  let path = paper.project.importJSON(pathJSON);
  const pathsToSubtract = pathsToSubtractJSON.map((json) =>
    paper.project.importJSON(json)
  );

  const pathCount = pathsToSubtract.length;
  for (let i = 0; i < pathCount; i++) {
    const path2 = pathsToSubtract[i];
    // TODO: should we check that the paths overlap before we subtract?
    if (!path2.closed || !path2.hasFill()) continue;
    const tmp = path.subtract(path2);
    path.remove();
    path = tmp;
    if (path.isEmpty(true)) return postMessage(null);
  }

  postMessage(path.exportJSON());
};
