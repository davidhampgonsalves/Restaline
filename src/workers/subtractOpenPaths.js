importScripts("/node_modules/paper/dist/paper-core.js");

paper.install(this);

onmessage = function ({ data: { pathJSON, pathsToSubtractJSON, size } }) {
  paper.setup(size);
  const originalPath = paper.project.importJSON(pathJSON);
  let path = originalPath;
  const pathsToSubtract = pathsToSubtractJSON.map((json) =>
    paper.project.importJSON(json)
  );

  const pathCount = pathsToSubtract.length;
  for (let i = 0; i < pathCount; i++) {
    const path2 = pathsToSubtract[i];

    // TODO: should we check that the paths overlap before we subtract?
    if (!path2.closed || !path2.hasFill()) continue;
    path = path.subtract(path2, { insert: false });
    if (path.isEmpty(true)) return postMessage(null); // the path was totally subtracted away (exit)
  }

  const occulted = [];
  (path.children || [path]).forEach((p) => {
    let occultedPath = new paper.Path();
    p.curves.forEach((c) => {
      if (!isPartOfPath(c, originalPath)) return;

      // if the last segment in our current line doesn't equal the next curves start then its for a new path
      if (occultedPath.lastSegment != c.segment1) {
        //occultedPath.insertAbove(originalPath);
        if (!occultedPath.isEmpty()) occulted.push(occultedPath);
        occultedPath = new paper.Path();
      }
      if (occultedPath.segments.length === 0) occultedPath.add(c.segment1);
      occultedPath.add(c.segment2);
    });
    originalPath.replaceWith(occultedPath);
    if (!occultedPath.isEmpty()) occulted.push(occultedPath);
  });

  if (occulted.length === 0) return postMessage(null);

  let occultedPath;
  if (occulted.length === 1) occultedPath = occulted[0];
  else
    occultedPath = new paper.CompoundPath({
      children: occulted,
    });
  occultedPath.strokeColor = originalPath.strokeColor;
  postMessage(occultedPath.exportJSON());
};

function isPartOfPath(curve, path) {
  const pt = curve.getLocationAt(curve.length / 2).point;
  return path.getOffsetOf(pt) != null;
}
