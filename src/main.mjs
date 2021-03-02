import { occult } from "./occult.mjs";
import SnakeFill from "./snakeFill.mjs";

export function occultAndFill(item, options = {}) {
  item.children[0].remove(); // remove parent rectangle that paper.js creates

  const { spacing } = options;
  const offset = spacing * -1;

  occult(item)
    .filter((p) => p.closed) // do not fill unclosed paths
    .forEach((p) => {
      let inset = PaperOffset.offset(p, offset, { join: "round" });

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
}
