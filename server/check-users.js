const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    console.log('Tüm kullanıcılar ve rolleri:');
    console.table(users);
    
    // PENDING statüsündeki ilanları da kontrol edelim
    const pendingAds = await prisma.ad.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log('\nOnay bekleyen ilanlar:');
    console.table(pendingAds);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
