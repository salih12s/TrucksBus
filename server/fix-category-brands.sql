-- Check for invalid CategoryBrand records
SELECT cb.category_id, cb.brand_id, c.name as category_name, b.name as brand_name
FROM category_brands cb
LEFT JOIN brands b ON cb.brand_id = b.id
LEFT JOIN categories c ON cb.category_id = c.id
WHERE b.id IS NULL;

-- Delete invalid CategoryBrand records (brand doesn't exist)
DELETE FROM category_brands
WHERE brand_id NOT IN (SELECT id FROM brands);
