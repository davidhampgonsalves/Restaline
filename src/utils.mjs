export function log(phase, desc, total = -1, index = -1) {
  let msg = `${phase}: ${desc}`;
  if (total >= 0) {
    if (index >= 0) msg += `(${index} / ${total})`;
    else msg += `(${total} remaining)`;
  }
  console.log(msg);
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

// todo: tests
export function removeGraphPoints(points, graph) {
  points.forEach((pt) => delete graph[pt]);
  Object.keys(graph).forEach((nodeID) =>
    points.forEach(
      (neighbourToRemove) => delete graph[nodeID][neighbourToRemove]
    )
  );
}

// todo: tests
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

// todo: tests
export function drawPath(points, paths, color = "black") {
  const curves = {};
  paths.forEach((p) => {
    p.curves.forEach(
      (c) => (curves[segToID(c.segment1) + "-" + segToID(c.segment2)] = c)
    );
  });
  const path = new paper.Path();
  path.strokeColor = color;
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
