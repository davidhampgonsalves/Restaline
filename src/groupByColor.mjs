export default function groupByColor(paths) {
  const groups = {};
  paths.forEach((path) => {
    const color = (path.strokeColor || path.fillColor).toCSS(true);
    let group = groups[color];
    if (!group) {
      group = new paper.Group();
      group.name = color;
      groups[color] = group;
    }
    group.addChild(path);
  });

  return Object.values(groups);
}
