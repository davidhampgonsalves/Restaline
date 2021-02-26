function generateFillPaths(paths) {
  const graph = pathsToGraph(paths);

  const start = segToID(paths[0].firstSegment);
  const points = findLongestHamiltonianPath(start, graph);

  drawPath(points);

  paths.forEach((path) => path.remove());
}

export function pathsToGraph(paths) {
  const graph = {};
  paths.forEach((path) => {
    if (!path.closed) {
      console.error("path isn't closed, can not fill");
      return;
    }

    path.curves.forEach((curve) => {
      const id1 = segToID(curve.segment1);
      const id2 = segToID(curve.segment2);

      const neighbours1 = graph[id1] || {};
      neighbours1[id2] = curve.length;
      graph[id1] = neighbours1;

      const neighbours2 = graph[id2] || {};
      neighbours2[id1] = curve.length;
      graph[id2] = neighbours2;
    });
  });

  return graph;
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

// this is recursive single run zig zag
// export function findLongestHamiltonianPath(
//   id,
//   graph,
//   visited = [],
//   nodeCount = Object.keys(graph).length,
//   nodeThreshold = nodeCount * 0.9
// ) {
//   console.log(
//     "finding longest ham, current path length is " +
//       visited.length +
//       " / " +
//       nodeThreshold
//   );

//   // todo: do not push first node since we want to allow it to be returned to
//   visited.push(id);

//   // order by neighbour length to encourage zip-zags
//   const neighbours = graph[id];
//   const neighboursByLength = Object.keys(neighbours)
//     .sort((id1, id2) => neighbours[id1] < neighbours[id2])
//     .filter((neighbour) => !visited.includes(neighbour))
//     .slice(0, 1);

//   let longestPath, longestLength;
//   for (let i = neighboursByLength.length - 1; i >= 0; i--) {
//     const id = neighboursByLength[i];
//     const path = findLongestHamiltonianPath(id, graph, visited.slice(0));
//     if (path.length > nodeThreshold) return path;

//     const len = pathLength(path, graph, visited.length - 1);
//     if (!longestPath || len > longestLength) {
//       longestPath = path;
//       longestLength = len;
//     }
//   }

//   return longestPath || visited;
// }

// This is doing a full scan but its too slow
// export function findLongestHamiltonianPath(
//   id,
//   graph,
//   visited = [],
//   nodeCount = Object.keys(graph).length,
//   nodeThreshold = nodeCount * 0.9
// ) {
//   console.log(
//     "finding longest ham, current path length is " +
//       visited.length +
//       " / " +
//       nodeThreshold
//   );

//   // todo: do not push first node since we want to allow it to be returned to
//   visited.push(id);

//   // order by neighbour length to encourage zip-zags
//   const neighbours = graph[id];
//   const neighboursByLength = Object.keys(neighbours)
//     .sort((id1, id2) => neighbours[id1] > neighbours[id2])
//     .filter((neighbour) => !visited.includes(neighbour));

//   let longestPath, longestLength;
//   for (let i = neighboursByLength.length - 1; i >= 0; i--) {
//     const id = neighboursByLength[i];
//     const path = findLongestHamiltonianPath(id, graph, visited.slice(0));
//     if (path.length > nodeThreshold) return path;

//     const len = pathLength(path, graph, visited.length - 1);
//     if (!longestPath || len > longestLength) {
//       longestPath = path;
//       longestLength = len;
//     }
//   }

//   return longestPath || visited;
// }

// function pathLength(points, graph, offset = 0) {
//   let length = 0;
//   for (let i = points.length - 1; i >= offset && i > 0; i--) {
//     length += graph[points[i - 1]][points[i]];
//   }
//   return length;
// }

// todo: tests
export function removeGraphPoints(points, graph) {
  points.forEach((pt) => delete graph[pt]);
  Object.keys(graph).forEach((nodeID) =>
    points.forEach(
      (neighbourToRemove) => delete graph[nodeID][neighbourToRemove]
    )
  );
}

export function getStartNodeID(ids) {
  let start;
  let startX, startY;
  ids.forEach((id) => {
    const [x, y] = idToXY(id);
    if (!start || startY > y || (startY === y && startX > x)) {
      start = id;
      startX = x;
      startY = y;
    }
  });
  return start;
}

export function drawPath(points, paths) {
  const curves = {};
  paths.forEach((p) => {
    p.curves.forEach(
      (c) => (curves[segToID(c.segment1) + "-" + segToID(c.segment2)] = c)
    );
  });
  const path = new paper.Path();
  path.closed = false;

  for (let i = 1; i < points.length; i++) {
    const pt1 = points[i - 1],
      pt2 = points[i];
    const id1 = idToXY(pt1),
      id2 = idToXY(pt2);

    let curve = curves[id1 + "-" + id2];
    if (!curve) {
      curve = curves[id2 + "-" + id1];
      curve = curve.reversed();
    }
    let segments = [curve.segment1, curve.segment2];

    segments = segments.map((s) => s.clone());
    segments[0].handleIn = null;
    segments[1].handleOut = null;

    path.add(...segments);
  }

  // export function drawPath(points, paths) {
  //   const curves = {};
  //   paths.forEach((p) => {
  //     p.curves.forEach(
  //       (c) => (curves[segToID(c.segment1) + "-" + segToID(c.segment2)] = c)
  //     );
  //   });
  //   const path = new paper.Path();
  //   path.closed = false;

  //   for (let i = 1; i < points.length; i++) {
  //     const pt1 = points[i - 1],
  //       pt2 = points[i];
  //     const id1 = idToXY(pt1),
  //       id2 = idToXY(pt2);

  //     let curve = curves[id1 + "-" + id2];
  //     let segments;
  //     if (!curve) {
  //       curve = curves[id2 + "-" + id1];
  //       segments = [curve.segment2, curve.segment1];
  //     } else segments = [curve.segment1, curve.segment2];
  //     segments = segments.map((s) => s.clone());
  //     segments[0].handleIn = null;
  //     segments[1].handleOut = null;

  //     path.add(...segments);
  //   }

  path.strokeColor = new paper.Color(
    Math.random(),
    Math.random(),
    Math.random()
  );
}

export function idToXY(id) {
  return id.split(",").map((i) => parseInt(i));
}

export function segToID(seg) {
  return roundPt(seg.point.x) + "," + roundPt(seg.point.y);
}

const ROUND = 1;
function roundPt(pt) {
  return Math.round(pt * ROUND) / ROUND;
}
