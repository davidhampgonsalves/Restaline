import {
  generateFillPath,
  pathsToGraph,
  removeGraphPoints,
  drawPath,
  getStartNodeID,
} from "./hamiltonian.mjs";

export function occultAndFill(item) {
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  occult(item).forEach((p) => {
    fillPath(p);
    // use fill color for stroke if stroke is missing
    if (!p.strokeColor) p.strokeColor = p.fillColor;
    // remove fillColor from input since generated fills serve that purpose now
    p.fillColor = null;
  });
}
export function occult(item) {
  const paths = toOrderedPaths(item);
  return subtractPaths(paths);
}

function fillPath(path) {
  let bounds = path.bounds;
  // const color = new paper.Color(200, 200, 200); //randColor();

  const fill = new paper.Group();
  const spacing = 2;
  for (let i = 0; i * spacing < bounds.height; i++) {
    const tmp = new paper.Path.Rectangle(
      new paper.Point(bounds.x, bounds.y + spacing * i),
      new paper.Point(bounds.x + bounds.width, bounds.y + spacing * i + spacing)
    );
    const inter = path.intersect(tmp);
    // inter.strokeColor = color;

    inter.remove();
    tmp.remove();
    // path.remove();

    fill.addChild(inter);
  }

  const graph = pathsToGraph(fill.children);
  let nodeIDs = Object.keys(graph);
  while (nodeIDs.length > 0) {
    const startPoint = getStartNodeID(nodeIDs);
    const points = generateFillPath(startPoint, graph);
    drawPath(points, fill.children, path.fillColor);
    removeGraphPoints(points, graph);
    nodeIDs = Object.keys(graph);
  }

  fill.remove();
}

function toOrderedPaths(item, paths = []) {
  if (item.className === "Shape") {
    const tmp = item.toPath();
    item.remove();
    item = tmp;
    console.log("SHAPE! this will mess up layer order?");
  }

  if (item.className === "Group" || item.className === "Layer") {
    paths = paths.concat(
      item.children.map((item) => toOrderedPaths(item)).flat()
    );
  } else if (item.className === "Path" || item.className === "CompoundPath") {
    if (item.closed) {
      paths.push(item);
    } else console.log("skipping unclosed path");
  } else console.log("skipped item type: ", item.className);

  return paths.sort((a, b) => a.isAbove(b));
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

      if (window.DEBUG) path.strokeColor = "black";
      return path;
    })
    .filter((path) => !path.isEmpty());
  return subtracted;
}
