import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Write public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3E2010"/>
      <stop offset="100%" stop-color="#1A0C06"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="cream" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#FDE68A"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="220" stroke="#F59E0B" stroke-width="6" fill="none" opacity="0.3"/>
  <!-- Cupcake / Cake Base -->
  <path d="M160 280 L180 410 C182 422 192 430 204 430 L308 430 C320 430 330 422 332 410 L352 280 Z" fill="#D97706"/>
  <!-- Cupcake Ridges -->
  <path d="M208 280 L218 426 M256 280 L256 428 M304 280 L294 426" stroke="#92400E" stroke-width="5" stroke-linecap="round"/>
  <!-- Frosting / Bakery Swirl -->
  <path d="M140 270 C140 250 160 230 190 235 C195 200 230 170 260 175 C290 170 325 195 328 230 C355 230 375 250 372 272 C370 295 345 305 320 300 C290 310 220 310 190 300 C160 305 138 290 140 270 Z" fill="url(#cream)"/>
  <path d="M200 215 C215 160 270 140 300 170 C310 180 315 195 315 205" fill="none" stroke="#F59E0B" stroke-width="7" stroke-linecap="round"/>
  <!-- Cherry / Sparkle on top -->
  <circle cx="256" cy="135" r="28" fill="#DC2626"/>
  <ellipse cx="248" cy="126" rx="8" ry="5" fill="#FCA5A5"/>
  <path d="M260 115 C275 85 305 85 315 90" fill="none" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
  <!-- Sparkles -->
  <path d="M120 180 Q130 180 130 170 Q130 180 140 180 Q130 180 130 190 Q130 180 120 180 Z" fill="#F59E0B"/>
  <path d="M380 160 Q390 160 390 150 Q390 160 400 160 Q390 160 390 170 Q390 160 380 160 Z" fill="#F59E0B"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent.trim());
console.log('Saved public/icon.svg');

// 2. Simple PNG generation function without external binary dependencies
function createSolidColorPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(2, 9); // color type 2: Truecolor (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC calculation
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // Scanlines with filter byte 0
  const scanlineWidth = 1 + width * 3;
  const rawData = Buffer.alloc(scanlineWidth * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw a subtle warm gradient / circular bakery badge pattern
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.44;

      if (dist < radius) {
        // Inner badge
        if (dist > radius - (width * 0.04)) {
          // Gold border
          rawData[pxOffset] = 245;     // R
          rawData[pxOffset + 1] = 158; // G
          rawData[pxOffset + 2] = 11;  // B
        } else {
          // Warm amber / pastry color
          const factor = Math.max(0, 1 - dist / radius);
          rawData[pxOffset] = Math.min(255, Math.floor(r + factor * 40));
          rawData[pxOffset + 1] = Math.min(255, Math.floor(g + factor * 25));
          rawData[pxOffset + 2] = Math.min(255, Math.floor(b + factor * 10));
        }
      } else {
        // Outer dark chocolate
        rawData[pxOffset] = 62;
        rawData[pxOffset + 1] = 32;
        rawData[pxOffset + 2] = 16;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table & calculation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate PNG files
const pwa192 = createSolidColorPng(192, 192, 120, 53, 15);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

const pwa512 = createSolidColorPng(512, 512, 120, 53, 15);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

const pwaMaskable = createSolidColorPng(512, 512, 90, 40, 12);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

const appleTouch = createSolidColorPng(180, 180, 120, 53, 15);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

const favicon = createSolidColorPng(32, 32, 120, 53, 15);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated all PWA icons in /public:');
console.log(' - pwa-192x192.png');
console.log(' - pwa-512x512.png');
console.log(' - pwa-maskable-512x512.png');
console.log(' - apple-touch-icon.png');
console.log(' - favicon.ico');
