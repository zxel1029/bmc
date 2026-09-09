// Builds tadm-vps.zip = dist/ + server/ (source only) for VPS deployment.
// Usage: npm run build && node scripts/pack.mjs
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "tadm-vps.zip");
const SKIP = new Set(["node_modules", "data", ".env", ".git"]);

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++)
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

const files = [];
function walk(dir, base) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(full, rel);
    else files.push({ name: rel, data: fs.readFileSync(full) });
  }
}
walk(path.join(ROOT, "dist"), "dist");
walk(path.join(ROOT, "server"), "server");

const chunks = [];
const central = [];
let offset = 0;
for (const f of files) {
  const nameBuf = Buffer.from(f.name, "utf8");
  const comp = zlib.deflateRawSync(f.data);
  const crc = crc32(f.data);
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0);
  lh.writeUInt16LE(20, 4);
  lh.writeUInt16LE(0x800, 6);
  lh.writeUInt16LE(8, 8);
  lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(comp.length, 18);
  lh.writeUInt32LE(f.data.length, 22);
  lh.writeUInt16LE(nameBuf.length, 26);
  chunks.push(lh, nameBuf, comp);
  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0);
  ch.writeUInt16LE(20, 4);
  ch.writeUInt16LE(20, 6);
  ch.writeUInt16LE(0x800, 8);
  ch.writeUInt16LE(8, 10);
  ch.writeUInt32LE(crc, 16);
  ch.writeUInt32LE(comp.length, 20);
  ch.writeUInt32LE(f.data.length, 24);
  ch.writeUInt16LE(nameBuf.length, 28);
  ch.writeUInt32LE(offset, 42);
  central.push(ch, nameBuf);
  offset += lh.length + nameBuf.length + comp.length;
}
const centralBuf = Buffer.concat(central);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(files.length, 8);
eocd.writeUInt16LE(files.length, 10);
eocd.writeUInt32LE(centralBuf.length, 12);
eocd.writeUInt32LE(offset, 16);
fs.writeFileSync(OUT, Buffer.concat([...chunks, centralBuf, eocd]));
console.log(`${OUT} — ${files.length} files, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
