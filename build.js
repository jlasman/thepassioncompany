#!/usr/bin/env node
/**
 * TPC Static Site Builder
 * Assembles HTML pages from src/pages/ + src/partials/
 * Output: root directory (GitHub Pages serves from root)
 *
 * Usage: node build.js
 *
 * Page source format (src/pages/*.html):
 *   First line must be a JSON config comment: <!-- CONFIG {...} -->
 *   Remainder is the full page HTML with placeholders:
 *     {{header}}     → src/partials/header.html (with nav active states + CTA injected)
 *     {{footer}}     → src/partials/footer.html
 *     {{scripts}}    → src/partials/scripts.html
 *     {{shared_css}} → src/styles/shared.css (inlined into <style> block)
 *
 * Config fields:
 *   output    — output filename (default: same as source filename)
 *   active    — nav item key: "the-work" | "iself" | "about" | "contact" | ""
 *   nav_cta   — override CTA button HTML (default: Explore iSELF → /iself.html)
 *   logo_dark — dark mode logo SVG filename (default: "The_Passion_Company-03.svg")
 */

const fs = require('fs');
const path = require('path');

const PARTIALS_DIR = path.join(__dirname, 'src/partials');
const PAGES_DIR    = path.join(__dirname, 'src/pages');
const STYLES_DIR   = path.join(__dirname, 'src/styles');
const OUTPUT_DIR   = __dirname; // root — GitHub Pages serves from here

// Default nav CTA (used on all pages except iself)
const DEFAULT_NAV_CTA  = `<a href="/iself.html" class="btn btn--primary btn--sm">Explore <span class="brand-iself">iSELF</span></a>`;
const DEFAULT_LOGO_DARK = 'The_Passion_Company-03.svg';

// Load partials once
const HEADER_TEMPLATE = fs.readFileSync(path.join(PARTIALS_DIR, 'header.html'), 'utf8');
const FOOTER          = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');
const SCRIPTS         = fs.readFileSync(path.join(PARTIALS_DIR, 'scripts.html'), 'utf8');
const SHARED_CSS      = fs.readFileSync(path.join(STYLES_DIR, 'shared.css'), 'utf8');

function buildHeader(config) {
  const activeKey  = config.active || '';
  const navCta     = config.nav_cta || DEFAULT_NAV_CTA;
  const logoDark   = config.logo_dark || DEFAULT_LOGO_DARK;

  let header = HEADER_TEMPLATE;

  // Inject active nav class
  ['the-work', 'iself', 'about', 'contact'].forEach(key => {
    header = header.replace(`{{active_${key}}}`, key === activeKey ? 'is-active' : '');
  });

  // Inject nav CTA and logo
  header = header.replace('{{nav_cta}}', navCta);
  header = header.replace('{{logo_dark}}', logoDark);

  return header;
}

function buildPage(srcFile) {
  const src = fs.readFileSync(srcFile, 'utf8');

  // Parse frontmatter: first line <!-- CONFIG {...} -->
  const configMatch = src.match(/^<!--\s*CONFIG\s*(\{[\s\S]*?\})\s*-->/);
  if (!configMatch) {
    console.error(`  ✗ Missing CONFIG in ${srcFile}`);
    return;
  }

  let config;
  try {
    config = JSON.parse(configMatch[1]);
  } catch (e) {
    console.error(`  ✗ Invalid CONFIG JSON in ${srcFile}: ${e.message}`);
    return;
  }

  const outputFile = config.output || path.basename(srcFile);
  const outputPath = path.join(OUTPUT_DIR, outputFile);

  // Remove config comment from source
  let html = src.replace(/^<!--\s*CONFIG[\s\S]*?-->\n?/, '');

  // Inject partials and shared CSS
  html = html.replace('{{header}}', buildHeader(config));
  html = html.replace('{{footer}}', FOOTER);
  html = html.replace('{{scripts}}', SCRIPTS);
  html = html.replace('{{shared_css}}', SHARED_CSS);

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`  ✓ Built ${outputFile} (${Math.round(html.length / 1024)}KB)`);
}

// Build all pages
console.log('\n🔨 Building TPC site...\n');
const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));

pages.forEach(file => {
  try {
    buildPage(path.join(PAGES_DIR, file));
  } catch (e) {
    console.error(`  ✗ Error building ${file}: ${e.message}`);
  }
});

console.log(`\n✅ Done — ${pages.length} page(s) built.\n`);
