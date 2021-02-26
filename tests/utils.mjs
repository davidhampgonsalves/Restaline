export function assertEq(a, b) {
  let assertion, msg;
  if (Array.isArray(a)) {
    assertion = JSON.stringify(a) === JSON.stringify(b);
    msg = `${JSON.stringify(a)} != ${JSON.stringify(b)}`;
  } else {
    assertion = a === b;
    msg = `${a} != ${b}`;
  }

  console.assert(assertion, msg);
}

export function buildPaths(pathsData) {
  return pathsData.map((pathData) => new paper.Path(pathData));
}
