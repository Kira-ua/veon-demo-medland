// One-off preparation of the client's product photos for the hero shelf.
// Source: ../content/images/source (500x500 WebP on #F8F8F8). Output: src/assets/shelf/*.png (lossless master;
// Astro <Picture> then emits AVIF/WebP with srcset). Steps: near-white background -> pure white (so
// mix-blend-mode: multiply dissolves it into the paper), crop the supplier watermark on the ventilator photo,
// trim to the object so every product stands on the same baseline.
// Run: node scripts/prepare-images.mjs
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../../content/images/source");
const out = path.resolve(here, "../src/assets/shelf");
const items = [
  ["defibrylator-s6", null],
  ["shvl-foras-t19", { left: 120, top: 0, width: 380, height: 500 }], // drops the "Maestro Medical" mark, bottom-left
  ["narkoz-biomed-ax700", null],
  ["bilirubinometr-bm100a", null],
  ["ekg-heaco-300g", null],
  ["monitor-pm6100", null],
];

for (const [name, crop] of items) {
  let img = sharp(path.join(src, `${name}.webp`)).removeAlpha();
  if (crop) img = img.extract(crop);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    const lo = Math.min(data[i], data[i + 1], data[i + 2]);
    const hi = Math.max(data[i], data[i + 1], data[i + 2]);
    if (lo >= 232 && hi - lo < 10) {
      const t = Math.min(1, (lo - 232) / (247 - 232));
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (255 - data[i + c]) * t);
    }
  }
  const file = path.join(out, `${name}.png`);
  const res = await sharp(data, { raw: info }).trim({ background: "#ffffff", threshold: 6 }).png().toFile(file);
  console.log(name, res.width, res.height);
}
