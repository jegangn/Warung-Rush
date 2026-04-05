const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.15;

  // Rounded square background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  ctx.fillStyle = '#2d1810';
  ctx.fill();

  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = size * 0.02;
  ctx.stroke();

  // Truck emoji — canvas npm doesn't render emoji well, so draw a simple truck shape
  const cx = size / 2;
  const cy = size * 0.36;
  const ts = size * 0.12;

  // Truck body
  ctx.fillStyle = '#e8842a';
  ctx.fillRect(cx - ts * 1.2, cy - ts * 0.6, ts * 1.8, ts * 1.2);
  // Truck cab
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(cx + ts * 0.6, cy - ts * 0.3, ts * 0.8, ts * 0.9);
  // Truck cab window
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(cx + ts * 0.7, cy - ts * 0.15, ts * 0.55, ts * 0.4);
  // Wheels
  ctx.fillStyle = '#1a0e0a';
  ctx.beginPath();
  ctx.arc(cx - ts * 0.5, cy + ts * 0.7, ts * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + ts * 0.9, cy + ts * 0.7, ts * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // "WR" text
  const textSize = size * 0.18;
  ctx.font = `bold ${textSize}px Arial, sans-serif`;
  ctx.fillStyle = '#f5c542';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WR', size / 2, size * 0.72);

  return canvas;
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

const icons = [
  { size: 512, filename: 'icon-512.png' },
  { size: 192, filename: 'icon-192.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
];

icons.forEach(({ size, filename }) => {
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, filename), buffer);
  console.log(`Created icons/${filename} (${size}x${size})`);
});

console.log('Done! All icons generated.');
