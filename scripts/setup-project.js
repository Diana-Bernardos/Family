import { readdirSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const projectRoot = '/vercel/share/v0-project';
const frontendDir = join(projectRoot, 'frontend');

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.log(`Source does not exist: ${src}`);
    return;
  }
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

// Step 1: Copy frontend/src -> src (at project root)
console.log('\n--- Step 1: Copying frontend/src -> src ---');
const srcDir = join(frontendDir, 'src');
const destSrc = join(projectRoot, 'src');
console.log(`Checking if ${srcDir} exists: ${existsSync(srcDir)}`);
if (existsSync(srcDir)) {
  copyDir(srcDir, destSrc);
  console.log('Done copying src');
} else {
  console.log('ERROR: frontend/src does not exist!');
}

// Step 2: Copy frontend/public -> public (at project root)
console.log('\n--- Step 2: Copying frontend/public -> public ---');
const publicDir = join(frontendDir, 'public');
const destPublic = join(projectRoot, 'public');
console.log(`Checking if ${publicDir} exists: ${existsSync(publicDir)}`);
if (existsSync(publicDir)) {
  copyDir(publicDir, destPublic);
  console.log('Done copying public');
} else {
  console.log('ERROR: frontend/public does not exist!');
}

// Step 3: Remove stale lockfiles if they exist
console.log('\n--- Step 3: Cleaning lockfiles ---');
const lockfiles = [
  join(projectRoot, 'package-lock.json'),
  join(frontendDir, 'package-lock.json'),
  join(projectRoot, 'backend', 'package-lock.json'),
];
for (const lf of lockfiles) {
  if (existsSync(lf)) {
    rmSync(lf);
    console.log(`Removed: ${lf}`);
  }
}

// Step 4: Remove node_modules if exists (to ensure clean install)
console.log('\n--- Step 4: Cleaning node_modules ---');
const nodeModules = join(projectRoot, 'node_modules');
if (existsSync(nodeModules)) {
  rmSync(nodeModules, { recursive: true, force: true });
  console.log('Removed node_modules');
}

// Step 5: Run npm install to generate fresh lockfile
console.log('\n--- Step 5: Running npm install ---');
try {
  execSync('npm install --no-audit --no-fund', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  console.log('npm install completed successfully');
} catch (e) {
  console.error('npm install failed:', e.message);
}

// Step 6: Verify
console.log('\n--- Step 6: Verification ---');
console.log(`src/index.js exists: ${existsSync(join(projectRoot, 'src', 'index.js'))}`);
console.log(`public/index.html exists: ${existsSync(join(projectRoot, 'public', 'index.html'))}`);
console.log(`package-lock.json exists: ${existsSync(join(projectRoot, 'package-lock.json'))}`);
console.log(`node_modules exists: ${existsSync(nodeModules)}`);
