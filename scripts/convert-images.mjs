import sharp from 'sharp';
import { readdir, stat, mkdir, copyFile, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = join(__dirname, '..', 'public', 'image');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'image-opt');
const THUMB_DIR = join(__dirname, '..', 'public', 'image-thumb');

const WEBP_QUALITY = 60;
const MAX_WIDTH = 800;
const THUMB_WIDTH = 200;
const THUMB_QUALITY = 60;

async function getAllImageFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllImageFiles(fullPath));
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertToWebp(inputPath, outputPath) {
  await mkdir(dirname(outputPath), { recursive: true });
  try {
    await sharp(inputPath)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);
    const originalSize = (await stat(inputPath)).size;
    const webpSize = (await stat(outputPath)).size;
    const reduction = ((1 - webpSize / originalSize) * 100).toFixed(1);
    console.log(`✅ ${inputPath.replace(IMAGE_DIR, '')} → ${(originalSize/1024).toFixed(0)}KB → ${(webpSize/1024).toFixed(0)}KB (-${reduction}%)`);
    return true;
  } catch (e) {
    console.error(`❌ Failed: ${inputPath} - ${e.message}`);
    return false;
  }
}

async function createThumbnail(inputPath, thumbPath) {
  await mkdir(dirname(thumbPath), { recursive: true });
  try {
    await sharp(inputPath)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(thumbPath);
    const thumbSize = (await stat(thumbPath)).size;
    console.log(`🖼️  Thumb: ${inputPath.replace(IMAGE_DIR, '')} → ${(thumbSize/1024).toFixed(0)}KB`);
    return true;
  } catch (e) {
    console.error(`❌ Thumb failed: ${inputPath} - ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Scanning images in:', IMAGE_DIR);
  const files = await getAllImageFiles(IMAGE_DIR);
  console.log(`📁 Found ${files.length} images\n`);

  let totalOriginal = 0;
  let totalWebp = 0;

  for (const file of files) {
    const relativePath = file.replace(IMAGE_DIR, '');
    const webpName = relativePath.replace(/\.(png|jpg|jpeg|webp)$/i, '.webp');
    const outputPath = join(OUTPUT_DIR, webpName);
    const thumbPath = join(THUMB_DIR, webpName);

    const originalSize = (await stat(file)).size;
    totalOriginal += originalSize;

    const ok = await convertToWebp(file, outputPath);
    if (ok) {
      const webpSize = (await stat(outputPath)).size;
      totalWebp += webpSize;
      await createThumbnail(outputPath, thumbPath);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Original: ${(totalOriginal/1024/1024).toFixed(1)} MB`);
  console.log(`   WebP:     ${(totalWebp/1024/1024).toFixed(1)} MB`);
  console.log(`   Saved:    ${((1 - totalWebp/totalOriginal)*100).toFixed(1)}%`);
  console.log(`\n🔄 Now replacing original files...`);

  const optFiles = await getAllImageFiles(OUTPUT_DIR);
  for (const optFile of optFiles) {
    const relativePath = optFile.replace(OUTPUT_DIR, '');
    const targetPath = join(IMAGE_DIR, relativePath);
    await mkdir(dirname(targetPath), { recursive: true });
    try {
      await copyFile(optFile, targetPath);
    } catch (e) {
      console.error(`❌ Copy failed: ${relativePath} - ${e.message}`);
    }
  }

  console.log('✅ All optimized files copied to image directory');
  console.log('🧹 Cleaning up temp directory...');
  
  try {
    const { rm } = await import('node:fs/promises');
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    console.log('✅ Temp directory removed');
  } catch (e) {
    console.log('⚠️  Please manually remove public/image-opt/');
  }
}

main().catch(console.error);
