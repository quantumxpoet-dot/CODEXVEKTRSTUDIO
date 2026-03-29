const fs = require('fs');
const iconFile = fs.readFileSync('src/lib/icons.tsx', 'utf8');
const exported = [...iconFile.matchAll(/export const ([A-Za-z0-9_]+)/g)].map(m => m[1]);
const files = fs.readdirSync('src/pages').map(f => 'src/pages/' + f).concat(['src/components/Layout.tsx', 'src/App.tsx']);
let allImported = new Set();
for(let file of files) {
  if(!file.endsWith('.tsx')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/lib\/icons['"]/);
  if(match) {
    const imports = match[1].split(',').map(s => s.trim().split(' as ')[0]).filter(Boolean);
    imports.forEach(i => allImported.add(i));
  }
}
const missing = [...allImported].filter(i => !exported.includes(i));
console.log('MISSING:', missing);
