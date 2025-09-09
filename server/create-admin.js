const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'admin@test.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Mevcut kullanıcıyı sil
    await prisma.user.deleteMany({
      where: { email }
    });
    
    // Yeni admin kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN',
        isActive: true,
        isVerified: true
      }
    });
    
    console.log('Admin kullanıcı oluşturuldu:', {
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

createAdminUser();
