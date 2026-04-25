import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = join(__dirname, '..', 'public', 'image');
const THUMB_DIR = join(__dirname, '..', 'public', 'image-thumb');

const WEBP_QUALITY = 80;
const THUMB_WIDTH = 200;
const THUMB_QUALITY = 70;

async function getAllImageFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllImageFiles(fullPath));
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertToWebp(inputPath) {
  const webpPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  try {
    await sharp(inputPath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
    const originalSize = (await stat(inputPath)).size;
    const webpSize = (await stat(webpPath)).size;
    const reduction = ((1 - webpSize / originalSize) * 100).toFixed(1);
    console.log(`✅ ${inputPath.replace(IMAGE_DIR, '')} → WebP: ${(originalSize/1024).toFixed(0)}KB → ${(webpSize/1024).toFixed(0)}KB (-${reduction}%)`);
    return webpPath;
  } catch (e) {
    console.error(`❌ Failed: ${inputPath} - ${e.message}`);
    return null;
  }
}

async function createThumbnail(inputPath) {
  const relativePath = inputPath.replace(IMAGE_DIR, '');
  const thumbPath = join(THUMB_DIR, relativePath.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
  await mkdir(dirname(thumbPath), { recursive: true });
  try {
    await sharp(inputPath)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(thumbPath);
    const thumbSize = (await stat(thumbPath)).size;
    console.log(`🖼️  Thumb: ${relativePath} → ${(thumbSize/1024).toFixed(0)}KB`);
    return thumbPath;
  } catch (e) {
    console.error(`❌ Thumb failed: ${inputPath} - ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Scanning images in:', IMAGE_DIR);
  const files = await getAllImageFiles(IMAGE_DIR);
  console.log(`📁 Found ${files.length} images\n`);

  let totalOriginal = 0;
  let totalWebp = 0;

  for (const file of files) {
    const originalSize = (await stat(file)).size;
    totalOriginal += originalSize;

    await convertToWebp(file);
    await createThumbnail(file);

    const webpPath = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    try {
      totalWebp += (await stat(webpPath)).size;
    } catch {}
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Original: ${(totalOriginal/1024/1024).toFixed(1)} MB`);
  console.log(`   WebP:     ${(totalWebp/1024/1024).toFixed(1)} MB`);
  console.log(`   Saved:    ${((1 - totalWebp/totalOriginal)*100).toFixed(1)}%`);
}

main().catch(console.error);
