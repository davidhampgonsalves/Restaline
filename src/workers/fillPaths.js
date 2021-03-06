importScripts(
  "/node_modules/paper/dist/paper-core.js",
  "/src/fills/snake.js",
  "/src/workers/utils.js"
);

paper.install(this);
paper.setup([640, 480]);

onmessage = function ({ data: { pathJSON, options } }) {
  const path = paper.project.importJSON(pathJSON);

  let fillPaths;
  if (options.fillType === "snake") fillPaths = snakeFill(path, options);

  postMessage(
    fillPaths.map((p) => {
      p.strokeColor = path.fillColor;
      p.fillColor = null;
      return p.exportJSON();
    })
  );
};
