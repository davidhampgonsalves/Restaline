import { occult } from "./occult.mjs";
import SnakeFill from "./snakeFill.mjs";
import { log } from "./utils.mjs";

export async function occultAndFill(item, options = {}) {
  paper.project.clear();
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  const { spacing } = options;

  const occultedPaths = await occult(item, options);
  const pathsToFill = occultedPaths.filter((p) => p.closed); // do not fill unclosed paths

  log("Filling", "START", pathsToFill.length);
  pathsToFill.forEach((p, i) => {
    log("Filling", "path", pathsToFill.length, i);
    let inset;
    if (options.inset) {
      // inset the fill path
      const offset = spacing * (p.className === "Path" ? -1 : 1);
      inset = PaperOffset.offset(p, offset, { join: "round" });
      // PaperOffset sometimes flips the inset direction (usually on CompoundPaths) so sanity check / reverse
      if (areDimensionsLarger(inset, p)) {
        inset.remove();
        inset = PaperOffset.offset(p, -offset, { join: "round" });
        if (areDimensionsLarger(inset, p)) {
          // we can't win, looks like insetting isn't possible
          inset.remove();
          inset = p.clone();
          console.warn("could not inset path");
        }
      }
    }

    const path = inset || p;
    switch (options.fillType) {
      case "snake":
        SnakeFill.fillPath(path, options);
        break;
    }

    if (inset) inset.remove();
    // use fill color for stroke if stroke is missing
    if (!p.strokeColor) p.strokeColor = p.fillColor;
    // remove fillColor from input since generated fills serve that purpose now
    p.fillColor = null;
  });

  paper.project.activeLayer.addChildren(occultedPaths);

  // occultedPaths
  //   // .filter((p) => !p.closed)
  //   .forEach((p) => {
  //     p.strokeColor = "black";
  //     paper.project.activeLayer.addChild(p);
  //   });
  log("Filling", "DONE");
}

// test if either height or width are greater
function areDimensionsLarger(p1, p2) {
  const s1 = p1.bounds.size,
    s2 = p2.bounds.size;
  return s1.width > s2.width || s1.height > s2.height;
}
