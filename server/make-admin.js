const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Sercan kullanıcısını admin yap
    const user = await prisma.user.update({
      where: { email: 'sercansaydam@codlean.com' },
      data: { role: 'ADMIN' }
    });
    
    console.log('Kullanıcı admin yapıldı:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
