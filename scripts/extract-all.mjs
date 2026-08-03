import fs from "fs";

const h = fs.readFileSync("c:/Users/mopen/Downloads/ddr-rca.html", "utf8");
const parts = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];
console.log("scripts", parts.length);
parts.forEach((p, i) => {
  console.log(i, p[1].length, p[1].slice(0, 70).replace(/\n/g, " "));
});
const all = parts.map((p) => p[1]).join("\n");
fs.writeFileSync("scripts/pnddrr-raw.js", all);
console.log("total", all.length);

// Count section headers with =================
const re = /\/\* =+ [^=]+ =+ \*\//g;
let m;
while ((m = re.exec(all))) {
  console.log(m.index, m[0]);
}
