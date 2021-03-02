import Utils from "./utils.test.mjs";
import SnakeFill from "./snakeFill.test.mjs";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
paper.setup(canvas);

Utils();
SnakeFill();

console.log("Done.");
