const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Icon sizes
const sizes = [16, 48, 128];

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'src/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate icons for each size
sizes.forEach(size => {
  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#4285f4';
  ctx.fillRect(0, 0, size, size);
  
  // Draw clock-like shape
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  
  // Draw clock hands
  ctx.beginPath();
  ctx.moveTo(size / 2, size / 2);
  ctx.lineTo(size / 2, size * 0.2);
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = size * 0.08;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(size / 2, size / 2);
  ctx.lineTo(size * 0.7, size * 0.6);
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = size * 0.08;
  ctx.stroke();
  
  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, `icon${size}.png`), buffer);
  
  console.log(`Generated icon${size}.png`);
});

console.log('All icons generated successfully!');