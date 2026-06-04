/**
 * Conversion des images en WebP pour améliorer les performances
 * - Hero BMP (7MB) → WebP desktop + mobile
 * - Images MAM JPEG → WebP qualité 82
 * - Miniatures → WebP qualité 78
 * - Logo PNG → WebP qualité 90
 */

const { Jimp } = require('jimp');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BASE = __dirname;

function size(file) {
  try { return (fs.statSync(file).size / 1024).toFixed(1) + ' KB'; } catch { return '?'; }
}

async function convertHero() {
  console.log('\n--- Hero image (BMP → WebP) ---');
  const src = path.join(BASE, 'images/greyerbaby-baby-390555_1920.jpg');
  console.log(`Source: ${size(src)}`);

  const img = await Jimp.read(src);
  const jpegBuf = await img.getBuffer('image/jpeg');

  // Desktop : 1920px max, qualité 82
  const destDesktop = path.join(BASE, 'images/hero-desktop.webp');
  await sharp(jpegBuf)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destDesktop);
  console.log(`hero-desktop.webp : ${size(destDesktop)}`);

  // Mobile : 800px, qualité 72
  const destMobile = path.join(BASE, 'images/hero-mobile.webp');
  await sharp(jpegBuf)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(destMobile);
  console.log(`hero-mobile.webp  : ${size(destMobile)}`);

  // Fallback JPEG desktop (anciens navigateurs)
  const destJpeg = path.join(BASE, 'images/hero-desktop.jpg');
  await sharp(jpegBuf)
    .resize(1920, null, { withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true })
    .toFile(destJpeg);
  console.log(`hero-desktop.jpg  : ${size(destJpeg)} (fallback)`);

  // Fallback JPEG mobile
  const destJpegMobile = path.join(BASE, 'images/hero-mobile.jpg');
  await sharp(jpegBuf)
    .resize(800, null, { withoutEnlargement: true })
    .jpeg({ quality: 72, progressive: true })
    .toFile(destJpegMobile);
  console.log(`hero-mobile.jpg   : ${size(destJpegMobile)} (fallback)`);
}

async function convertDir(dir, quality, label) {
  console.log(`\n--- ${label} (qualité ${quality}) ---`);
  const dirPath = path.join(BASE, dir);
  const files = fs.readdirSync(dirPath).filter(f => /\.(jpeg|jpg)$/i.test(f));
  let totalBefore = 0, totalAfter = 0;

  for (const file of files) {
    const src = path.join(dirPath, file);
    const dest = path.join(dirPath, file.replace(/\.(jpeg|jpg)$/i, '.webp'));
    const before = fs.statSync(src).size;
    await sharp(src).webp({ quality }).toFile(dest);
    const after = fs.statSync(dest).size;
    totalBefore += before;
    totalAfter += after;
    const pct = Math.round((1 - after / before) * 100);
    console.log(`  ${file.padEnd(20)} ${(before/1024).toFixed(0).padStart(5)} KB → ${(after/1024).toFixed(0).padStart(4)} KB  (-${pct}%)`);
  }

  console.log(`  Total: ${(totalBefore/1024).toFixed(0)} KB → ${(totalAfter/1024).toFixed(0)} KB`);
}

async function convertLogo() {
  console.log('\n--- Logo PNG → WebP ---');
  const src = path.join(BASE, 'images/logo.png');
  const dest = path.join(BASE, 'images/logo.webp');
  const before = fs.statSync(src).size;
  await sharp(src).webp({ quality: 90 }).toFile(dest);
  const after = fs.statSync(dest).size;
  const pct = Math.round((1 - after / before) * 100);
  console.log(`  logo.png → logo.webp : ${(before/1024).toFixed(0)} KB → ${(after/1024).toFixed(0)} KB (-${pct}%)`);
}

async function main() {
  console.log('Démarrage de la conversion...');
  await convertHero();
  await convertDir('images/images_mam', 82, 'Images MAM');
  await convertDir('images/images_mam_thumb', 78, 'Miniatures galerie');
  await convertLogo();
  console.log('\nConversion terminée !');
}

main().catch(err => { console.error(err); process.exit(1); });
