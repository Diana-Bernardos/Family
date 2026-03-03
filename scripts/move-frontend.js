import { readdirSync, mkdirSync, copyFileSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const projectRoot = '/vercel/share/v0-project';
const frontendDir = join(projectRoot, 'frontend');

function copyDir(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true });
  mkdirSync(dest, { recursive: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Copy frontend/src -> src
const srcDir = join(frontendDir, 'src');
const destSrc = join(projectRoot, 'src');
if (existsSync(srcDir)) {
  copyDir(srcDir, destSrc);
  console.log('Copied frontend/src -> src');
}

// Copy frontend/public -> public
const publicDir = join(frontendDir, 'public');
const destPublic = join(projectRoot, 'public');
if (existsSync(publicDir)) {
  copyDir(publicDir, destPublic);
  console.log('Copied frontend/public -> public');
}

console.log('Done!');
