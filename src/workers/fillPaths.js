importScripts(
  "/node_modules/paper/dist/paper-core.js",
  "/src/fills/snake.js",
  "/src/workers/utils.js"
);

paper.install(this);

onmessage = function ({ data: { pathJSON, size, options } }) {
  paper.setup(size);
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
