#!/usr/bin/env python3
import re

with open('client/src/pages/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Count before
before = len(re.findall(r'navigate\(\s*`/categories/dorse', content))
print(f"Found {before} dorse navigate calls before replacement")

# Simple string replacement - find and replace the exact pattern
# We'll do this line by line to avoid complex multiline regex

lines = content.split('\n')
new_lines = []
i = 0
replaced_count = 0

while i < len(lines):
    line = lines[i]
    
    # Check if this line starts the pattern we want to replace
    if 'onClick={() =>' in line and i + 1 < len(lines) and 'navigate(' in lines[i+1]:
        # Check if next few lines match dorse pattern
        if i + 2 < len(lines) and '/categories/dorse' in lines[i+2]:
            # This is a dorse navigate pattern, replace it
            # Find the closing }
            j = i
            while j < len(lines) and not ('}' in lines[j] and 'onClick' not in lines[j]):
                j += 1
            
            if j < len(lines):
                # Replace the entire onClick block
                indent = len(line) - len(line.lstrip())
                new_lines.append(' ' * indent + 'onClick={(e) => handleDorseBrandClick(brand, e)}')
                replaced_count += 1
                i = j + 1
                continue
    
    new_lines.append(line)
    i += 1

new_content = '\n'.join(new_lines)

# Count after
after = len(re.findall(r'navigate\(\s*`/categories/dorse', new_content))
print(f"Found {after} dorse navigate calls after replacement")
print(f"Replaced {replaced_count} onClick handlers")

with open('client/src/pages/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Done!")
