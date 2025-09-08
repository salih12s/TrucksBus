const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryDorse() {
  try {
    console.log('🔍 Dorse kategorisini arıyorum...');
    
    // Dorse kategorisini bul
    const dorseCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'dorse' },
          { name: { contains: 'Dorse', mode: 'insensitive' } },
          { slug: 'dorser' }
        ]
      }
    });

    if (!dorseCategory) {
      console.log('❌ Dorse kategorisi bulunamadı');
      return;
    }

    console.log('✅ Dorse kategorisi bulundu:');
    console.log(`📂 ID: ${dorseCategory.id}, Name: ${dorseCategory.name}, Slug: ${dorseCategory.slug}`);

    // Dorse kategorisinin altındaki brands'ları bul
    const brands = await prisma.brand.findMany({
      where: {
        categories: {
          some: {
            categoryId: dorseCategory.id
          }
        }
      },
      include: {
        models: {
          include: {
            variants: true
          }
        }
      }
    });

    console.log(`\n🏷️ Dorse kategorisinde ${brands.length} brand bulundu:\n`);

    brands.forEach((brand, brandIndex) => {
      console.log(`${brandIndex + 1}. 🔖 Brand: ${brand.name} (slug: ${brand.slug})`);
      
      if (brand.models.length > 0) {
        brand.models.forEach((model, modelIndex) => {
          console.log(`   ${modelIndex + 1}. 📱 Model: ${model.name} (slug: ${model.slug})`);
          
          if (model.variants.length > 0) {
            model.variants.forEach((variant, variantIndex) => {
              console.log(`      ${variantIndex + 1}. 🎯 Variant: ${variant.name} (slug: ${variant.slug})`);
            });
          } else {
            console.log(`      ⚠️ Bu model için variant bulunamadı`);
          }
        });
      } else {
        console.log(`   ⚠️ Bu brand için model bulunamadı`);
      }
      console.log(''); // Boş satır
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryDorse();
