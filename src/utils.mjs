export const CANVAS_SIZE = [1000, 1000];

export function log(phase, desc, total = -1, index = -1) {
  let msg = desc ? `${phase}: ${desc}` : phase;
  if (total >= 0) {
    if (index >= 0) msg += `(${index} / ${total})`;
    else msg += `(${total} remaining)`;
  }
  console.log(msg);
}

export function toOrderedPaths(item, options, paths = [], depth = 0) {
  if (item.className === "Group" || item.className === "Layer") {
    item.children.forEach((item) => {
      toOrderedPaths(item, options, paths, depth + 1);
    });
  } else if (item.className === "Path" || item.className === "CompoundPath") {
    paths.push(item);
  } else console.log("skipped item type: ", item.className);

  if (depth > 0) return paths;
  return paths.sort((a, b) => a.isAbove(b));
}

const VISUALLY_CLOSED_CUTOFF = 1;
export function closeVisuallyClosedPaths(paths, isRecursing = false) {
  if (!isRecursing) log("Auto Closing Paths");
  paths.forEach((path) => {
    if (path.className === "CompoundPath")
      return closeVisuallyClosedPaths(path.children, true);

    const distance = path.firstSegment.point.getDistance(
      path.lastSegment.point
    );
    if (distance < VISUALLY_CLOSED_CUTOFF) path.closed = true;
  });
  if (!isRecursing) log("Auto Closing Paths", "DONE.");
}
