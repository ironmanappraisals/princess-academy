// Bundles the whole game into one self-contained HTML file (styles, scripts and icon inlined):
//   node build-single.js            -> writes princess-academy.html next to this file
// serve.js also builds it on the fly at /princess-academy.html, so the download link is always current.
// Fonts still come from Google Fonts when online; offline it falls back to the device's rounded fonts.
const fs = require('fs');
const path = require('path');
const root = __dirname;

function build() {
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const read = p => fs.readFileSync(path.join(root, p), 'utf8');
  const icon = p => 'data:image/png;base64,' + fs.readFileSync(path.join(root, p)).toString('base64');
  html = html.replace(/<link rel="manifest"[^>]*>\s*/, '');
  html = html.replace(/<link rel="(apple-touch-icon|icon)" href="([^"]+)">/g, (m, rel, href) => `<link rel="${rel}" href="${icon(href)}">`);
  html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (m, href) => `<style>\n${read(href)}\n</style>`);
  let first = true;
  html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (m, src) => {
    const code = read(src).replace(/<\/script/gi, '<\\/script');
    const flag = first ? '<script>window.PA_SINGLE_FILE = true;</script>\n' : '';
    first = false;
    return `${flag}<script>/* ${src} */\n${code}\n</script>`;
  });
  return html;
}

module.exports = build;
if (require.main === module) {
  const out = path.join(root, 'princess-academy.html');
  fs.writeFileSync(out, build());
  console.log('Wrote ' + out + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
}
