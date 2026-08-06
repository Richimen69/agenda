import prisma from './src/config/prisma.js'; // <-- Importas tu cliente con el adapter listo

async function truncarTabla() {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "Lead" CASCADE;`;
    console.log('✅ Tabla "Lead" truncada con éxito');
  } catch (error) {
    console.error('❌ Error al truncar la tabla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

truncarTabla();