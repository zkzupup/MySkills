/**
 * Excalidraw → PNG Batch Export Tool
 *
 * Uses Puppeteer headless Chromium + Excalidraw native exportToBlob API.
 * Preserves hand-drawn style (roughjs) and Excalidraw fonts.
 *
 * Usage:
 *   node export_excalidraw_png.js [dir1] [dir2] ...
 *   Scans the current directory if no arguments are provided.
 *
 * Examples:
 *   node export_excalidraw_png.js
 *   node export_excalidraw_png.js ./diagrams ./docs/images
 *
 * Behavior:
 *   - Scans specified directories for .excalidraw files
 *   - Skips files that already have a .png (incremental export)
 *   - Use --force to re-export all files
 *
 * Dependencies: npm install puppeteer
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ==================== Config ====================
const SCALE = 2;            // Export scale factor (2 = 2x HD)
const EXPORT_PADDING = 20;  // Diagram padding (px)
const BG_COLOR = '#ffffff'; // Background color (white)
// ================================================

/**
 * Scan a directory for .excalidraw files that need exporting.
 * @param {string} dir - Directory path
 * @param {boolean} force - Whether to force re-export
 * @returns {Array<{dir, name}>}
 */
function scanDirectory(dir, force) {
  if (!fs.existsSync(dir)) {
    console.warn(`  Skipped: directory not found ${dir}`);
    return [];
  }

  const files = fs.readdirSync(dir);
  const excalidrawFiles = files.filter(f => f.endsWith('.excalidraw'));

  if (excalidrawFiles.length === 0) return [];

  return excalidrawFiles
    .filter(f => force || !files.includes(f.replace('.excalidraw', '.png')))
    .map(f => ({ dir: path.resolve(dir), name: f.replace('.excalidraw', '') }));
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dirs = args.filter(a => a !== '--force');

  // Default to current directory
  if (dirs.length === 0) dirs.push('.');

  // Collect all files to export
  console.log('Scanning directories...\n');
  const targets = [];
  for (const dir of dirs) {
    const found = scanDirectory(dir, force);
    targets.push(...found);
  }

  if (targets.length === 0) {
    console.log('No files to export. (Files with existing PNGs are skipped; use --force to re-export all)');
    return;
  }

  console.log(`Found ${targets.length} file(s) to export:\n`);
  for (const t of targets) {
    console.log(`  ${path.relative(process.cwd(), path.join(t.dir, t.name))}.excalidraw`);
  }
  console.log('');

  // ============ 1. Launch headless Chromium ============
  console.log('Launching headless Chromium...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 3000, height: 2200, deviceScaleFactor: SCALE });

  // ============ 2. Load Excalidraw library from esm.sh CDN ============
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body>
<script type="module">
  import { exportToBlob } from "https://esm.sh/@excalidraw/excalidraw?bundle-deps";
  window.__exportToBlob = exportToBlob;
  window.__excalidrawReady = true;
</script>
</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  console.log('Waiting for Excalidraw library to load (first load ~3-5s from CDN)...');
  await page.waitForFunction('window.__excalidrawReady === true', { timeout: 60000 });
  console.log('Excalidraw library ready\n');

  // ============ 3. Export each file ============
  let ok = 0, fail = 0;
  for (const { dir, name } of targets) {
    const inputPath = path.join(dir, `${name}.excalidraw`);
    const outputPath = path.join(dir, `${name}.png`);

    try {
      const excalidrawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

      const base64 = await page.evaluate(async (data, scale, padding, bgColor) => {
        const elements = data.elements.filter(e => !e.isDeleted);

        const blob = await window.__exportToBlob({
          elements,
          appState: {
            exportBackground: true,
            viewBackgroundColor: bgColor,
            exportScale: scale,
            exportPadding: padding,
          },
          files: data.files || null,
          mimeType: 'image/png',
        });

        // Blob → Base64 to pass back to Node.js
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }, excalidrawData, SCALE, EXPORT_PADDING, BG_COLOR);

      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(outputPath, buffer);
      const sizeKB = (buffer.length / 1024).toFixed(0);
      console.log(`  OK   ${name}.png (${sizeKB} KB)`);
      ok++;
    } catch (err) {
      console.error(`  FAIL ${name}: ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  console.log(`\nDone! ${ok} succeeded${fail > 0 ? `, ${fail} failed` : ''}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
