importScripts("/node_modules/paper/dist/paper-core.js");

paper.install(this);
paper.setup([640, 480]);

onmessage = function ({ data: { pathJSON, pathsToSubtractJSON } }) {
  let path = paper.project.importJSON(pathJSON);
  const pathsToSubtract = pathsToSubtractJSON.map((json) =>
    paper.project.importJSON(json)
  );

  const pathCount = pathsToSubtract.length;
  for (let i = 0; i < pathCount - 1; i++) {
    const path2 = pathsToSubtract[i];
    if (!path2.closed) continue;
    const tmp = path.subtract(path2);
    path.remove();
    path = tmp;
    if (path.isEmpty(true)) {
      postMessage(null);
      return;
    }
  }

  postMessage(path.exportJSON());
};
