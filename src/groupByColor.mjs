export default function groupByColor(paths) {
  const groups = {};
  paths.forEach((path) => {
    const color = path.strokeColor.toString();
    let group = groups[color];
    if (!group) {
      group = new paper.Group();
      groups[color] = group;
    }
    group.addChild(path);
  });

  return Object.values(groups);
}
