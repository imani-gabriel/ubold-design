const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'public/dist/bundle.js');

if (!fs.existsSync(bundlePath)) {
  console.error('Error: Bundle file not found. Please run "npm run build" first.');
  process.exit(1);
}

const bundleSize = fs.statSync(bundlePath).size;
const bundleSizeKB = (bundleSize / 1024).toFixed(2);

console.log(`Bundle size: ${bundleSizeKB} KB`);

if (bundleSize > 500 * 1024) { // 500KB
  console.warn('Warning: Bundle size is larger than recommended (500KB)');
}

// Check for common issues
const bundleContent = fs.readFileSync(bundlePath, 'utf8');
if (bundleContent.includes('eval(')) {
  console.warn('Warning: Bundle contains eval() calls');
}
if (bundleContent.includes('sourceMappingURL')) {
  console.log('Source maps are included');
}

console.log('Bundle check completed'); 