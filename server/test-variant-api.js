const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVariantAPI() {
  try {
    console.log('🔍 Damperli brand ve model variant API test...');
    
    // Test parameters
    const categorySlug = 'dorse';
    const brandSlug = 'damperli';
    const modelSlug = 'damperli';

    // Find the brand
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      console.log('❌ Brand bulunamadı:', brandSlug);
      return;
    }

    console.log('✅ Brand bulundu:', brand.name, '(ID:', brand.id + ')');

    // Find the model
    const model = await prisma.model.findFirst({
      where: {
        slug: modelSlug,
        brandId: brand.id,
      },
    });

    if (!model) {
      console.log('❌ Model bulunamadı:', modelSlug);
      return;
    }

    console.log('✅ Model bulundu:', model.name, '(ID:', model.id + ')');

    // Find variants
    const variants = await prisma.variant.findMany({
      where: { modelId: model.id },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`\n🎯 ${variants.length} variant bulundu:\n`);

    variants.forEach((variant, index) => {
      console.log(`${index + 1}. ${variant.name} (slug: ${variant.slug})`);
    });

    // Test the exact API endpoint call
    console.log('\n📡 API endpoint URL would be:');
    console.log(`/categories/${categorySlug}/brands/${brandSlug}/models/${modelSlug}/variants`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantAPI();
