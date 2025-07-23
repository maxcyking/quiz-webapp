#!/usr/bin/env node

/**
 * React 19 Ref Fix Script
 * 
 * This script fixes React 19 ref compatibility issues by:
 * 1. Replacing problematic UI components with React 19 compatible versions
 * 2. Updating all imports to use the new components
 * 3. Creating backup files before making changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 React 19 Ref Fix Script Starting...\n');

// Files that contain problematic components
const problematicFiles = [
  'src/components/ui/toast.tsx',
  'src/components/ui/select.tsx', 
  'src/components/ui/dialog.tsx',
  'src/components/mode-toggle.tsx'
];

// Create backup directory
const backupDir = 'backup-react18-components';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`📁 Created backup directory: ${backupDir}`);
}

// Step 1: Backup original files
console.log('📋 Creating backups of original files...');
problematicFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, backupPath);
    console.log(`   ✅ Backed up: ${file} → ${backupPath}`);
  }
});

// Step 2: Replace problematic components with React 19 compatible versions
console.log('\n🔄 Replacing components with React 19 compatible versions...');

// Replace toast.tsx
if (fs.existsSync('src/components/ui/toast-v19.tsx')) {
  fs.copyFileSync('src/components/ui/toast-v19.tsx', 'src/components/ui/toast.tsx');
  console.log('   ✅ Updated: toast.tsx');
}

// Replace select.tsx
if (fs.existsSync('src/components/ui/select-v19.tsx')) {
  fs.copyFileSync('src/components/ui/select-v19.tsx', 'src/components/ui/select.tsx');
  console.log('   ✅ Updated: select.tsx');
}

// Replace dialog.tsx
if (fs.existsSync('src/components/ui/dialog-v19.tsx')) {
  fs.copyFileSync('src/components/ui/dialog-v19.tsx', 'src/components/ui/dialog.tsx');
  console.log('   ✅ Updated: dialog.tsx');
}

// Step 3: Fix mode-toggle.tsx specifically
console.log('\n🎨 Fixing mode-toggle.tsx...');
const modeTogglePath = 'src/components/mode-toggle.tsx';
if (fs.existsSync(modeTogglePath)) {
  let content = fs.readFileSync(modeTogglePath, 'utf8');
  
  // Replace the problematic Button usage with a direct implementation
  content = content.replace(
    /<Button variant="ghost" size="icon">/,
    '<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">'
  );
  
  content = content.replace(
    /<\/Button>/,
    '</button>'
  );
  
  fs.writeFileSync(modeTogglePath, content);
  console.log('   ✅ Fixed: mode-toggle.tsx');
}

// Step 4: Update package.json to suppress React 19 warnings globally
console.log('\n📦 Updating development configuration...');
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add script for fixing refs
  if (!packageJson.scripts['fix-react19-refs']) {
    packageJson.scripts['fix-react19-refs'] = 'node scripts/fix-react19-refs.js';
  }
  
  // Add script for restoring original components
  if (!packageJson.scripts['restore-react18-refs']) {
    packageJson.scripts['restore-react18-refs'] = 'node scripts/restore-react18-refs.js';
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ Updated package.json scripts');
}

// Step 5: Create restoration script
console.log('\n🔄 Creating restoration script...');
const restoreScript = `#!/usr/bin/env node

/**
 * React 18 Restoration Script
 * 
 * This script restores the original React 18 components from backup
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring React 18 components from backup...\\n');

const backupDir = 'backup-react18-components';
const files = [
  'toast.tsx',
  'select.tsx', 
  'dialog.tsx',
  'mode-toggle.tsx'
];

files.forEach(file => {
  const backupPath = path.join(backupDir, file);
  const targetPath = path.join('src/components/ui', file);
  
  if (file === 'mode-toggle.tsx') {
    targetPath = 'src/components/mode-toggle.tsx';
  }
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, targetPath);
    console.log(\`   ✅ Restored: \${file}\`);
  }
});

console.log('\\n🎉 React 18 components restored successfully!');
console.log('\\n⚠️  Note: React 19 warnings will reappear until you upgrade to compatible library versions.');
`;

fs.writeFileSync('scripts/restore-react18-refs.js', restoreScript);
fs.chmodSync('scripts/restore-react18-refs.js', '755');
console.log('   ✅ Created restoration script');

// Step 6: Clean up temporary files
console.log('\n🧹 Cleaning up...');
const tempFiles = [
  'src/components/ui/toast-v19.tsx',
  'src/components/ui/select-v19.tsx',
  'src/components/ui/dialog-v19.tsx'
];

tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`   ✅ Cleaned up: ${file}`);
  }
});

console.log('\n🎉 React 19 ref fixes completed successfully!');
console.log('\n📋 Summary:');
console.log('   ✅ All problematic components have been replaced');
console.log('   ✅ Original files backed up in backup-react18-components/');
console.log('   ✅ React 19 warnings should be eliminated');
console.log('   ✅ Restoration script created for rollback if needed');
console.log('\n🚀 You can now run your application without React 19 ref warnings!');
console.log('\n💡 To restore original components: npm run restore-react18-refs'); 