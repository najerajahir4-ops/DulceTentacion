const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'pCjJbv6ByAS5BhjBcWLimUFc';
const imagesDir = path.join(__dirname, '..', 'public', 'images');

const filesToProcess = [
  'new_crepe.png',
  'new_frappe.png',
  'new_waffle.png',
  'new_icecream.png'
];

async function removeBackground(filename) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(imagesDir, filename);
    const outputPath = path.join(imagesDir, filename.replace('.png', '-bgless.png'));

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${filename} (not found)`);
      return resolve();
    }

    const formData = require('child_process').execSync(
      `curl -s -X POST https://api.remove.bg/v1.0/removebg -H "X-Api-Key: ${API_KEY}" -F "image_file=@${inputPath}" -F "size=auto" --output "${outputPath}"`
    );
    console.log(`Processed ${filename} -> ${filename.replace('.png', '-bgless.png')}`);
    resolve();
  });
}

async function main() {
  for (const file of filesToProcess) {
    try {
      await removeBackground(file);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  console.log("Done processing all images.");
}

main();
