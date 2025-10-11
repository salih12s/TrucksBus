#!/usr/bin/env python3
import re

with open('client/src/pages/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# This time we'll use a more careful multiline regex
# Pattern: onClick={() => navigate( `/categories/dorse...${brand...}/create-ad` )}

pattern = r'onClick=\{\(\) =>\s+navigate\(\s+`/categories/dorse/[^`]+`\s+\)\s+\}'

matches = re.findall(pattern, content, re.DOTALL)
print(f"Found {len(matches)} matches")

if matches:
    print("First match preview:")
    print(matches[0][:150] if len(matches[0]) > 150 else matches[0])

# Replace
new_content = re.sub(pattern, 'onClick={(e) => handleDorseBrandClick(brand, e)}', content, flags=re.DOTALL)

# Write back
with open('client/src/pages/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
after = len(re.findall(pattern, new_content, re.DOTALL))
print(f"Remaining after replacement: {after}")
print("✅ Done!")
