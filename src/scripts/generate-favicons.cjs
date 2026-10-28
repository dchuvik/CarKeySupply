const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function generateFavicons() {
  const directory = path.resolve('public');
  const ogSource = path.join(directory, 'og-image.svg');
  const ogTarget = path.join(directory, 'og-image.png');
  if (!fs.existsSync(ogTarget) || fs.statSync(ogTarget).mtimeMs < fs.statSync(ogSource).mtimeMs) {
    await sharp(ogSource).png().toFile(ogTarget);
    console.log('Generated Car Key Supply sharing image.');
  }
  const icon = path.join(directory, 'icon.svg');
  const targets = ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'favicon.ico'];
  const modified = fs.statSync(icon).mtimeMs;
  if (targets.every((file) => fs.existsSync(path.join(directory, file)) && fs.statSync(path.join(directory, file)).mtimeMs >= modified)) {
    console.log('Favicon assets are current.');
    return;
  }
  const source = fs.readFileSync(icon);
  fs.writeFileSync(path.join(directory, 'favicon.svg'), source);
  await sharp(source).resize(32, 32).png().toFile(path.join(directory, 'favicon-32x32.png'));
  await sharp(source).resize(180, 180).png().toFile(path.join(directory, 'apple-touch-icon.png'));
  await sharp(source).resize(32, 32).png().toFile(path.join(directory, 'favicon.ico'));
  console.log('Generated Car Key Supply favicon assets.');
}

generateFavicons().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
