import re

# Read the file
with open('client/src/pages/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Simpler pattern - just look for the key parts
pattern = r'onClick=\{\(\) =>\s+navigate\(\s+`/categories/dorse/brands/.+?/create-ad`\s+\)\s+\}'

# Count matches
matches = re.findall(pattern, content, re.DOTALL)
print(f"Found {len(matches)} matches with simple pattern")

if matches:
    print("First match:")
    print(matches[0])
    print("\n---\n")

# Now try the full replacement
# Replacement
replacement = 'onClick={(e) => handleDorseBrandClick(brand, e)}'

# Replace
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write back
with open('client/src/pages/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Replacement complete!")
