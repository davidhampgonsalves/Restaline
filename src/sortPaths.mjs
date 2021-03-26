export default function sortPaths(paths) {
  paths.forEach((path) => {
    if (isHigherThan(path.firstSegment, path.lastSegment)) path.reverse();
  });

  return paths.sort((p1, p2) =>
    isHigherThan(p1.firstSegment, p2.firstSegment) ? false : true
  );
}

function isHigherThan(s1, s2) {
  return s1.point.y < s2.point.y;
}
