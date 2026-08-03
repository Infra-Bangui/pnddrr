import fs from "fs";
import path from "path";

const js = fs.readFileSync("scripts/pnddrr-raw.js", "utf8");
const re = /\/\* =+ .+ =+ \*\/|\/\* ---------- .+ ---------- \*\//g;
let m;
const found = [];
while ((m = re.exec(js))) {
  found.push({ i: m.index, t: m[0].replace(/\s+/g, " ").slice(0, 100) });
}
found.forEach((f) => console.log(String(f.i).padStart(6), f.t));

// Also find function go( and init patterns at end
const bootHints = ["function boot", "window.onload", "DOMContentLoaded", "loadPersisted()", "buildNav()"];
for (const h of bootHints) {
  const i = js.indexOf(h);
  console.log("hint", h, i);
}
