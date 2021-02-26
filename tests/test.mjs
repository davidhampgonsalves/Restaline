import { run } from "./hamiltonian.test.mjs";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
paper.setup(canvas);

run();

console.log("Done.");
