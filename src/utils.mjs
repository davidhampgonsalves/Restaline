export function log(phase, desc, total = -1, index = -1) {
  let msg = `${phase}: ${desc}`;
  if (total >= 0) {
    if (index >= 0) msg += `(${index} / ${total})`;
    else msg += `(${total} remaining)`;
  }
  console.log(msg);
}
