import { occult } from "./occult.mjs";
import SnakeFill from "./snakeFill.mjs";
import { log } from "./utils.mjs";

export function occultAndFill(item, options = {}) {
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  const { spacing } = options;
  const offset = spacing * -1;

  const pathsToFill = occult(item).filter((p) => p.closed); // do not fill unclosed paths

  log("Filling", "START", pathsToFill.length);
  pathsToFill.forEach((p, i) => {
    log("Filling", "path", pathsToFill.length, i);
    //const inset = PaperOffset.offset(p, offset, { join: "round" });
    let inset = p;

    switch (options.fillType) {
      case "snake":
        SnakeFill.fillPath(inset, options);
        break;
    }

    inset.remove();
    // use fill color for stroke if stroke is missing
    if (!p.strokeColor) p.strokeColor = p.fillColor;
    // remove fillColor from input since generated fills serve that purpose now
    p.fillColor = null;
  });

  log("Filling", "DONE");
}
