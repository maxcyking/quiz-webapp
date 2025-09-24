#!/usr/bin/env node

/**
 * React 18 Restoration Script
 * 
 * This script restores the original React 18 components from backup
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring React 18 components from backup...\n');

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
    console.log(`   ✅ Restored: ${file}`);
  }
});

console.log('\n🎉 React 18 components restored successfully!');
console.log('\n⚠️  Note: React 19 warnings will reappear until you upgrade to compatible library versions.');
