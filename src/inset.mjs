export function inset(path, options) {
  let insetPath;
  // insetPath the fill path
  const offset = options.spacing * (path.className === "Path" ? -1 : 1);
  insetPath = PaperOffset.offset(path, offset, { insert: false });
  const pathArea = Math.abs(path.area);
  // PaperOffset sometimes flips the insetPath direction (usually on CompoundPaths) so sanity check / reverse
  // area is sometimes neg b/c of self intersections, not certain that just using absolute values is correct
  // but it's working for now.
  if (Math.abs(insetPath.area) > pathArea) {
    insetPath.remove();
    insetPath = PaperOffset.offset(path, -offset, { insert: false });
    if (Math.abs(insetPath.area) > pathArea) {
      // we can't win, looks like insetPathting isn't possible
      insetPath.remove();
      insetPath = path.clone();
    }
  }

  return insetPath;
}
