// Create placeholder icons for the PWA
// This is a simple script to generate basic icons for testing

// Define icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a canvas element
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Generate icons for each size
sizes.forEach(size => {
  // Set canvas size
  canvas.width = size;
  canvas.height = size;
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Draw background
  ctx.fillStyle = '#4285f4';
  ctx.fillRect(0, 0, size, size);
  
  // Draw a simple bookmark icon
  ctx.fillStyle = '#ffffff';
  const padding = size * 0.2;
  const width = size - (padding * 2);
  const height = size - (padding * 2);
  
  // Draw bookmark shape
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding + width, padding);
  ctx.lineTo(padding + width, padding + height);
  ctx.lineTo(padding + (width/2), padding + (height*0.75));
  ctx.lineTo(padding, padding + height);
  ctx.closePath();
  ctx.fill();
  
  // Add text
  if (size >= 96) {
    ctx.fillStyle = '#4285f4';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', padding + (width/2), padding + (height/2));
  }
  
  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/png');
  
  // Create download link
  const link = document.createElement('a');
  link.download = `icon-${size}x${size}.png`;
  link.href = dataUrl;
  link.textContent = `Download ${size}x${size} icon`;
  document.body.appendChild(link);
  document.body.appendChild(document.createElement('br'));
  
  // Auto-download
  link.click();
});

// Create favicon
canvas.width = 32;
canvas.height = 32;
ctx.clearRect(0, 0, 32, 32);
ctx.fillStyle = '#4285f4';
ctx.fillRect(0, 0, 32, 32);
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.moveTo(6, 6);
ctx.lineTo(26, 6);
ctx.lineTo(26, 26);
ctx.lineTo(16, 20);
ctx.lineTo(6, 26);
ctx.closePath();
ctx.fill();

const faviconUrl = canvas.toDataURL('image/png');
const faviconLink = document.createElement('a');
faviconLink.download = 'favicon.png';
faviconLink.href = faviconUrl;
faviconLink.textContent = 'Download favicon';
document.body.appendChild(faviconLink);
document.body.appendChild(document.createElement('br'));
faviconLink.click();

// Clean up
document.body.removeChild(canvas);
