#!/usr/bin/env node
/* Regenerate PWA icons as an ensō mark (accent ring on sumi ink), rasterized
   from the real EnsoKit brush geometry via sharp. Run: node build-icons.js */
const fs = require("fs");
const path = require("path");
const sharp = require("../ensokit/node_modules/sharp");
const { ensoPoints, toPathD } = require("../ensokit/src/brush.js");

const INK = "#16161a";
const ACCENT = "#1f44e0";
const markD = toPathD(ensoPoints("uxfs-mark", { R: 38, w: 13, cx: 50, cy: 50, gap: 0.55, rot: -1.3 }));

// scale = fraction of the icon the ensō occupies (smaller for maskable safe zone)
function iconSVG(size, scale, opaque) {
  const s = size * scale, off = (size - s) / 2;
  const bg = opaque
    ? `<rect width="${size}" height="${size}" fill="${INK}"/>`
    : `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${INK}"/>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    bg +
    `<g transform="translate(${off},${off}) scale(${s / 100})">` +
    `<path d="${markD}" fill="${ACCENT}"/>` +
    `<circle cx="50" cy="50" r="3.4" fill="${ACCENT}"/>` +
    `</g></svg>`
  );
}

const OUT = path.join(__dirname, "icons");
const jobs = [
  ["icon-192.png", 192, 0.66, false],
  ["icon-512.png", 512, 0.66, false],
  ["icon-maskable-512.png", 512, 0.54, true],   // art within central safe zone, full-bleed ink
  ["apple-touch-icon.png", 180, 0.66, true],    // opaque, iOS composites no transparency
];

Promise.all(jobs.map(([name, size, scale, opaque]) =>
  sharp(iconSVG(size, scale, opaque)).png().toFile(path.join(OUT, name))
    .then(() => console.log("wrote", name))
)).then(() => console.log("icons done")).catch(e => { console.error(e); process.exit(1); });
