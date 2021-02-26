import {
  generateFillPath,
  pathsToGraph,
  removeGraphPoints,
  drawPath,
  getStartNodeID,
} from "./hamiltonian.mjs";

export function occult(item) {
  const paths = preparePaths(item).sort((a, b) => a.isAbove(b));
  return subtractPaths(paths);
}

export function fill(paths) {
  // todo filter paths with no fill or white fill?
  paths.forEach(fillPath);
}

function preparePaths(item, paths = []) {
  if (item.className === "Shape") {
    const tmp = item.toPath();
    item.remove();
    item = tmp;
    console.log("SHAPE! this will mess up layer order?");
  }

  if (item.className === "Group" || item.className === "Layer") {
    paths = paths.concat(
      item.children.map((item) => preparePaths(item)).flat()
    );
  } else if (item.className === "Path" || item.className === "CompoundPath") {
    if (item.closed) {
      paths.push(item);
    } else console.log("skipping unclosed path");
  } else console.log("skipped item type: ", item.className);

  return paths;
}

function fillPath(path) {
  let bounds = path.bounds;
  const color = new paper.Color(200, 200, 200); //randColor();

  const fill = new paper.Group();
  const spacing = 2;
  for (let i = 0; i * spacing < bounds.height; i++) {
    const tmp = new paper.Path.Rectangle(
      new paper.Point(bounds.x, bounds.y + spacing * i),
      new paper.Point(bounds.x + bounds.width, bounds.y + spacing * i + spacing)
    );
    const inter = path.intersect(tmp);
    inter.strokeColor = color;

    inter.remove();
    tmp.remove();
    path.remove();

    fill.addChild(inter);
  }

  const graph = pathsToGraph(fill.children);
  let nodeIDs = Object.keys(graph);
  while (nodeIDs.length > 0) {
    const startPoint = getStartNodeID(nodeIDs);
    const points = generateFillPath(startPoint, graph);
    drawPath(points, fill.children);
    removeGraphPoints(points, graph);
    nodeIDs = Object.keys(graph);
  }

  fill.remove();
}

function subtractPaths(paths) {
  const subtracted = paths
    .map((path, i) => {
      if (i + 1 >= paths.length) return path;

      paths.slice(i + 1).forEach((path2) => {
        const tmp = path.subtract(path2);
        path.remove();
        path = tmp;
      });

      path.strokeColor = "black";
      return path;
    })
    .filter((path) => !path.isEmpty());
  subtracted.forEach((p) => (p.fillColor = new paper.Color(0, 0.1)));
  return subtracted;
}
