#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts large PNG reference images to optimized WebP format
 *
 * Usage: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '../public/style-references/line_art_watercolor'),
  targetWidth: 1200,  // Max width in pixels
  webpQuality: 85,    // WebP quality (0-100)
  keepOriginals: true, // Keep original PNGs as .png.bak
};

async function optimizeImage(inputPath, outputPath) {
  const startTime = Date.now();
  const inputStats = fs.statSync(inputPath);
  const inputSize = inputStats.size;

  console.log(`\n📸 Processing: ${path.basename(inputPath)}`);
  console.log(`   Original size: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`   Dimensions: ${metadata.width}x${metadata.height}px`);

    // Calculate resize dimensions (maintain aspect ratio)
    const shouldResize = metadata.width > CONFIG.targetWidth;
    const resizeWidth = shouldResize ? CONFIG.targetWidth : metadata.width;

    // Convert to WebP
    await sharp(inputPath)
      .resize(resizeWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: CONFIG.webpQuality })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSize = outputStats.size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
    const duration = Date.now() - startTime;

    console.log(`   ✅ Optimized: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   💰 Savings: ${savings}% (${((inputSize - outputSize) / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   ⏱️  Duration: ${duration}ms`);

    return {
      success: true,
      inputSize,
      outputSize,
      savings: parseFloat(savings),
      duration,
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  IMAGE OPTIMIZATION SCRIPT                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\nSource directory: ${CONFIG.sourceDir}`);
  console.log(`Target width: ${CONFIG.targetWidth}px`);
  console.log(`WebP quality: ${CONFIG.webpQuality}%`);
  console.log(`Keep originals: ${CONFIG.keepOriginals ? 'Yes (.png.bak)' : 'No'}`);

  // Find all PNG files
  const files = fs.readdirSync(CONFIG.sourceDir)
    .filter(file => file.endsWith('.png') && !file.endsWith('.bak'))
    .sort();

  if (files.length === 0) {
    console.log('\n❌ No PNG files found to optimize.');
    process.exit(1);
  }

  console.log(`\nFound ${files.length} PNG files to optimize\n`);
  console.log('─'.repeat(64));

  const results = [];
  let totalInputSize = 0;
  let totalOutputSize = 0;

  for (const file of files) {
    const inputPath = path.join(CONFIG.sourceDir, file);
    const outputPath = path.join(CONFIG.sourceDir, file.replace('.png', '.webp'));
    const backupPath = inputPath + '.bak';

    // Backup original if requested
    if (CONFIG.keepOriginals && !fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }

    const result = await optimizeImage(inputPath, outputPath);
    results.push({ file, ...result });

    if (result.success) {
      totalInputSize += result.inputSize;
      totalOutputSize += result.outputSize;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(64));
  console.log('OPTIMIZATION SUMMARY');
  console.log('═'.repeat(64));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\n✅ Successfully optimized: ${successCount} files`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} files`);
  }

  console.log(`\n📊 Total savings:`);
  console.log(`   Before: ${(totalInputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   After:  ${(totalOutputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Saved:  ${((totalInputSize - totalOutputSize) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Reduction: ${((1 - totalOutputSize / totalInputSize) * 100).toFixed(1)}%`);

  console.log('\n📝 Next steps:');
  console.log('   1. Update code to use .webp files instead of .png');
  console.log('   2. Test image loading in the app');
  console.log('   3. If satisfied, delete .png.bak backup files');
  console.log('   4. Commit the optimized .webp files');

  console.log('\n✨ Optimization complete!\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
