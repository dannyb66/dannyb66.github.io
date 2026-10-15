const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(root, 'site-config.js'), 'utf8');
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const applicationScript = inlineScripts.find(script => script.includes('const downloadCvLink'));
const visibilityScript = applicationScript.slice(0, applicationScript.indexOf('const toggleBtn'));
const cvAnchor = html.match(/<a\b[^>]*class="download-cv"[^>]*>/)[0];

function runVisibility(siteConfig, hidden = true) {
  const link = { hidden };
  const context = {
    window: siteConfig === undefined ? {} : { siteConfig },
    document: { querySelector: selector => {
      assert.equal(selector, '.download-cv');
      return link;
    } }
  };
  vm.runInNewContext(visibilityScript, context);
  return link.hidden;
}

test('committed config disables the CV link with a boolean', () => {
  const context = { window: {} };
  vm.runInNewContext(config, context);
  assert.equal(context.window.siteConfig.downloadCv, false);
  assert.equal(Object.isFrozen(context.window.siteConfig), true);
  assert.equal(runVisibility(context.window.siteConfig), true);
});

test('only literal true restores the CV link', () => {
  assert.equal(runVisibility({ downloadCv: true }), false);
  for (const value of [false, undefined, null, 'true', 'false', 1, 0]) {
    assert.equal(runVisibility({ downloadCv: value }), true);
  }
});

test('missing or null config fails closed, including after previously showing the link', () => {
  for (const value of [undefined, null, {}]) {
    assert.equal(runVisibility(value, false), true);
  }
  assert.equal(runVisibility({ downloadCv: false }, false), true);
});

test('initial markup and CSS hide the link without leaving a layout or keyboard-focus target', () => {
  assert.match(cvAnchor, /\shidden(?:\s|>)/);
  assert.match(html, /\.download-cv\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
  assert.ok(html.indexOf('<script src="site-config.js"></script>') < html.indexOf('const downloadCvLink'));
});

test('existing PDF download and accessibility semantics are preserved', () => {
  assert.match(cvAnchor, /href="assets\/Danny-Basavaraju-CV\.pdf"/);
  assert.match(cvAnchor, /download="Danny-Basavaraju-CV\.pdf"/);
  assert.match(cvAnchor, /type="application\/pdf"/);
  assert.match(cvAnchor, /aria-label="Download CV/);
  const pdf = fs.readFileSync(path.join(root, 'assets/Danny-Basavaraju-CV.pdf'));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
});

test('all executable scripts have valid JavaScript syntax', () => {
  new vm.Script(config);
  for (const script of inlineScripts) new vm.Script(script);
});
