import {
  pathsToGraph,
  removeGraphPoints,
  drawPath,
  getStartNodeID,
  log,
} from "./utils.mjs";

const PHASE = "Filling";

export function fillPath(path, options = {}) {
  let bounds = path.bounds;
  const fill = new paper.Group();
  const { spacing } = options;

  for (let i = 0; i * spacing < bounds.height; i++) {
    const tmp = new paper.Path.Rectangle(
      new paper.Point(bounds.x, bounds.y + spacing * i),
      new paper.Point(bounds.x + bounds.width, bounds.y + spacing * i + spacing)
    );
    const inter = path.intersect(tmp);

    inter.remove();
    tmp.remove();

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

export function generateFillPath(id, graph) {
  const visited = [id];

  while (true) {
    const neighbours = graph[id];
    const nextNeighbour = Object.keys(neighbours)
      .filter((neighbour) => !visited.includes(neighbour))
      .reduce((furthest, id) => {
        if (!furthest || neighbours[furthest] < neighbours[id]) return id;
        else return furthest;
      }, null);
    if (!nextNeighbour) break;

    visited.push(nextNeighbour);
    id = nextNeighbour;
  }

  return visited;
}

export default { fillPath };
