import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 DigiWarriors Release Packaging Assistant');
console.log('----------------------------------------------------');

const requiredFiles = [
  'DigiWarriors.exe',
  'Start_Digi_Warriors.bat',
  'package.json',
  'dist',
  'server',
  'public',
  'README.md',
  'LICENSE'
];

let allPresent = true;
requiredFiles.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    console.log(`✓ [READY] ${file}`);
  } else {
    console.log(`✗ [MISSING] ${file}`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('\n🚀 All binary release assets are present and ready for GitHub v1.0.0 Release!');
} else {
  console.log('\n⚠️ Some release files are missing. Please ensure all builds have completed.');
}
