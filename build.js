const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend...');
execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

const srcDist = path.join(__dirname, 'frontend', 'dist');
const targetDist = path.join(__dirname, 'dist');

if (fs.existsSync(srcDist)) {
  fs.mkdirSync(targetDist, { recursive: true });
  fs.cpSync(srcDist, targetDist, { recursive: true });
  console.log('Successfully copied frontend/dist to ./dist');
}
