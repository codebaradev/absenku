import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BUILD_ID = ".next/BUILD_ID";
if (!existsSync(BUILD_ID)) {
  console.warn("[write-build-id] .next/BUILD_ID tidak ditemukan, dilewati.");
  process.exit(0);
}

const id = readFileSync(BUILD_ID, "utf8").trim();
writeFileSync("public/build-id.txt", id + "\n");
console.log(`[write-build-id] versi ditulis: ${id}`);
