import { generateFillPath } from "../src/snakeFill.mjs";
import { assertEq, buildPaths } from "./utils.mjs";

export default function run() {
  testGenerateFillPath();
}

export function testGenerateFillPath() {
  const graph = {
    "0,0": { "1,1": 1 },
    "1,1": { "0,0": 1 },
  };
  let path = generateFillPath("1,1", graph);
  assertEq(path, ["1,1", "0,0"]);

  path = generateFillPath("0,0", graph);
  assertEq(path, ["0,0", "1,1"]);

  const threePtGraph = {
    "0,0": { "1,0": 1, "0,1": 1 },
    "1,0": { "0,0": 1, "0,1": 1 },
    "0,1": { "0,0": 1, "1,0": 1 },
  };
  path = generateFillPath("0,0", threePtGraph);
  assertEq(path, ["0,0", "1,0", "0,1"]);
}
