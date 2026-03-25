import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const models = await prisma.model.findMany({
    include: { brand: true, category: true, variants: true },
    orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }]
  });

  // Group by brandSlug + categorySlug
  const grouped: Record<string, any> = {};
  for (const m of models) {
    const key = `${m.brand.slug}__${m.category.slug}`;
    if (!grouped[key]) {
      grouped[key] = {
        brandSlug: m.brand.slug,
        categorySlug: m.category.slug,
        models: []
      };
    }
    grouped[key].models.push({
      name: m.name,
      slug: m.slug,
      variants: m.variants.map((v: any) => ({ name: v.name, slug: v.slug }))
    });
  }

  const result = Object.values(grouped);
  fs.writeFileSync('models-export.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Exported ${models.length} models, ${result.length} brand-category groups`);
  
  // Count variants
  let variantCount = 0;
  for (const m of models) {
    variantCount += m.variants.length;
  }
  console.log(`Total variants: ${variantCount}`);
  
  await prisma.$disconnect();
}
main();
