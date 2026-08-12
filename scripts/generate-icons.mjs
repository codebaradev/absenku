import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "public/icons";

const REGULAR = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#005e3f"/>
  <path d="M256 88c-68 0-123 55-123 123 0 92 123 213 123 213s123-121 123-213c0-68-55-123-123-123z" fill="#ffffff"/>
  <circle cx="256" cy="211" r="48" fill="#005e3f"/>
</svg>`;

const MASKABLE = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#005e3f"/>
  <g transform="translate(64 64) scale(0.75)">
    <path d="M256 88c-68 0-123 55-123 123 0 92 123 213 123 213s123-121 123-213c0-68-55-123-123-123z" fill="#ffffff"/>
    <circle cx="256" cy="211" r="48" fill="#005e3f"/>
  </g>
</svg>`;

await mkdir(OUT, { recursive: true });

await sharp(Buffer.from(REGULAR)).resize(192, 192).png().toFile(`${OUT}/icon-192.png`);
await sharp(Buffer.from(REGULAR)).resize(512, 512).png().toFile(`${OUT}/icon-512.png`);
await sharp(Buffer.from(REGULAR)).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`);
await sharp(Buffer.from(MASKABLE)).resize(512, 512).png().toFile(`${OUT}/icon-maskable-512.png`);

console.log("Icons generated in", OUT);