const fs = require('fs');
const path = require('path');

const formsDir = path.join(__dirname, 'client', 'src', 'components', 'forms');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix double comma ,, -> ,
    if (content.includes(',,')) {
      content = content.replace(/,,/g, ',');
      modified = true;
      console.log(`Fixed ,, in ${filePath}`);
    }
    
    // Fix ,} from "@mui/material" -> } from "@mui/material" (with newline)
    if (content.includes(',} from "@mui/material"')) {
      content = content.replace(/,\} from "@mui\/material"/g, ',\n} from "@mui/material"');
      modified = true;
      console.log(`Fixed closing brace in ${filePath}`);
    }
    
    // Fix leading comma in imports: ", ToggleButtonGroup" at start of line
    if (content.includes('\n, ToggleButtonGroup')) {
      content = content.replace(/\n, ToggleButtonGroup/g, '\n  ToggleButtonGroup');
      modified = true;
      console.log(`Fixed leading comma in ${filePath}`);
    }
    
    // Fix malformed price/currency append: "TRY");); -> "TRY");
    if (content.includes('"TRY"););')) {
      content = content.replace(/"TRY"\);\);/g, '"TRY");');
      modified = true;
      console.log(`Fixed extra ); in ${filePath}`);
    }
    
    // Fix missing closing paren: .replace(/\./g, "")\n -> .replace(/\./g, ""));\n
    // This is tricky - look for price append without closing paren
    const badPricePattern = /\.replace\(\/\\\.\//g, ""\)\s*\n/;
    if (badPricePattern.test(content)) {
      content = content.replace(/\.replace\(\/\\\.\//g, ""\)\s*\n/g, '.replace(/\\./g, ""));\n');
      modified = true;
      console.log(`Fixed price append paren in ${filePath}`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  let fixedCount = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDir(filePath);
    } else if (file.endsWith('.tsx')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('Searching for and fixing import issues in forms directory...');
const count = walkDir(formsDir);
console.log(`\nDone! Fixed ${count} files.`);
