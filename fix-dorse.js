const fs = require('fs');

// Read file
let content = fs.readFileSync('client/src/pages/MainLayout.tsx', 'utf8');

// Pattern: match navigate calls for dorse brands
// We need to match multiline patterns
const pattern = /onClick=\{\(\) =>\s+navigate\(\s+`\/categories\/dorse\/brands\/[^/]+\/models\/[^/]+\/variants\/\$\{brand\s*\.toLowerCase\(\)\s*\.replace\([^)]+\)\s*\.replace\([^)]+\)\}\/create-ad`\s*\)\s*\}/gs;

const matches = content.match(pattern);
console.log(`Found ${matches ? matches.length : 0} matches`);

if (matches && matches.length > 0) {
  console.log('First match:');
  console.log(matches[0]);
}

// Replace
const newContent = content.replace(pattern, 'onClick={(e) => handleDorseBrandClick(brand, e)}');

// Write
fs.writeFileSync('client/src/pages/MainLayout.tsx', newContent, 'utf8');

console.log('✅ Done!');
