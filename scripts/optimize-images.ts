import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(import.meta.dirname, "..", "public", "images");

const PRODUCT_CATEGORIES = ["lamps", "fireplaces", "outdoor"] as const;
const HERO_DIR = "hero";

const THUMB_WIDTH = 500;
const THUMB_QUALITY = 80;
const FULL_WIDTH = 1024;
const FULL_QUALITY = 85;

const CONCURRENCY = 10;

interface ConversionTask {
  srcPath: string;
  destPath: string;
  width: number;
  quality: number;
  label: string;
}

function getPngFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();
}

function isOutputFresh(srcPath: string, destPath: string): boolean {
  if (!fs.existsSync(destPath)) return false;
  const srcStat = fs.statSync(srcPath);
  const destStat = fs.statSync(destPath);
  return destStat.mtimeMs >= srcStat.mtimeMs;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function webpName(pngFilename: string): string {
  return pngFilename.replace(/\.png$/i, ".webp");
}

function fileSize(filePath: string): number {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

async function processTask(task: ConversionTask): Promise<void> {
  ensureDir(path.dirname(task.destPath));
  await sharp(task.srcPath)
    .resize(task.width)
    .webp({ quality: task.quality })
    .toFile(task.destPath);
  console.log(`  ${task.label}`);
}

async function processInChunks(
  tasks: ConversionTask[],
  chunkSize: number
): Promise<void> {
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processTask));
  }
}

async function main(): Promise<void> {
  const allTasks: ConversionTask[] = [];
  let totalSrcSize = 0;
  const srcFiles: string[] = [];
  const thumbFiles: string[] = [];
  const fullWebpFiles: string[] = [];

  // --- Product categories: thumbs + full-size WebP ---
  for (const category of PRODUCT_CATEGORIES) {
    const categoryDir = path.join(PUBLIC_DIR, category);
    const thumbsDir = path.join(categoryDir, "thumbs");
    const webpDir = path.join(categoryDir, "webp");
    const pngFiles = getPngFiles(categoryDir);

    if (pngFiles.length === 0) {
      console.log(`No PNG files found in ${category}/`);
      continue;
    }

    console.log(`\n[${category}] Found ${pngFiles.length} PNG files`);

    for (const pngFile of pngFiles) {
      const srcPath = path.join(categoryDir, pngFile);
      const webpFilename = webpName(pngFile);

      srcFiles.push(srcPath);
      totalSrcSize += fileSize(srcPath);

      // Thumbnail task
      const thumbDest = path.join(thumbsDir, webpFilename);
      thumbFiles.push(thumbDest);
      if (!isOutputFresh(srcPath, thumbDest)) {
        allTasks.push({
          srcPath,
          destPath: thumbDest,
          width: THUMB_WIDTH,
          quality: THUMB_QUALITY,
          label: `${category}/thumbs/${webpFilename}`,
        });
      }

      // Full-size WebP task
      const fullDest = path.join(webpDir, webpFilename);
      fullWebpFiles.push(fullDest);
      if (!isOutputFresh(srcPath, fullDest)) {
        allTasks.push({
          srcPath,
          destPath: fullDest,
          width: FULL_WIDTH,
          quality: FULL_QUALITY,
          label: `${category}/webp/${webpFilename}`,
        });
      }
    }
  }

  // --- Hero: full-size WebP only (no thumbs) ---
  const heroDir = path.join(PUBLIC_DIR, HERO_DIR);
  const heroWebpDir = path.join(heroDir, "webp");
  const heroPngs = getPngFiles(heroDir);

  if (heroPngs.length > 0) {
    console.log(`\n[hero] Found ${heroPngs.length} PNG files`);

    for (const pngFile of heroPngs) {
      const srcPath = path.join(heroDir, pngFile);
      const webpFilename = webpName(pngFile);

      srcFiles.push(srcPath);
      totalSrcSize += fileSize(srcPath);

      const fullDest = path.join(heroWebpDir, webpFilename);
      fullWebpFiles.push(fullDest);
      if (!isOutputFresh(srcPath, fullDest)) {
        allTasks.push({
          srcPath,
          destPath: fullDest,
          width: FULL_WIDTH,
          quality: FULL_QUALITY,
          label: `hero/webp/${webpFilename}`,
        });
      }
    }
  }

  // --- Process all tasks ---
  if (allTasks.length === 0) {
    console.log("\nAll images are up to date. Nothing to process.");
  } else {
    console.log(`\nProcessing ${allTasks.length} conversions...\n`);
    await processInChunks(allTasks, CONCURRENCY);
  }

  // --- Summary table ---
  const totalThumbSize = thumbFiles.reduce((sum, f) => sum + fileSize(f), 0);
  const totalFullWebpSize = fullWebpFiles.reduce(
    (sum, f) => sum + fileSize(f),
    0
  );
  const totalOutputSize = totalThumbSize + totalFullWebpSize;
  const savingsPercent =
    totalSrcSize > 0
      ? (((totalSrcSize - totalOutputSize) / totalSrcSize) * 100).toFixed(1)
      : "0.0";

  console.log("\n" + "=".repeat(50));
  console.log("  Image Optimization Summary");
  console.log("=".repeat(50));
  console.log(`  Source PNGs:        ${formatBytes(totalSrcSize)}`);
  console.log(`  Thumbnails (WebP):  ${formatBytes(totalThumbSize)}`);
  console.log(`  Full-size (WebP):   ${formatBytes(totalFullWebpSize)}`);
  console.log(`  Total output:       ${formatBytes(totalOutputSize)}`);
  console.log(`  Savings:            ${savingsPercent}%`);
  console.log("=".repeat(50));
  console.log(
    `  Files: ${srcFiles.length} sources → ${allTasks.length} converted`
  );
  console.log("=".repeat(50));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error("\nError during image optimization:", err);
    process.exit(1);
  });
