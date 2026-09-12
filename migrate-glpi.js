import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// Función para asegurar que el estado coincida con tu Enum de Prisma
const mapStatus = (csvStatus) => {
  const status = csvStatus?.toUpperCase() || 'CERRADO';
  if (status.includes('CERRADO') || status.includes('RESUELTO')) return 'CERRADO';
  if (status.includes('ABIERTO') || status.includes('NUEVO')) return 'ABIERTO';
  if (status.includes('PROGRESO')) return 'EN_PROGRESO';
  return 'CERRADO'; // Por defecto
};

async function runMigration() {
  console.log("🚀 Iniciando migración desde el archivo CSV...");
  const ticketsToInsert = [];

  fs.createReadStream('glpi_tickets_export.csv')
    .pipe(csv())
    .on('data', (row) => {
      // Filtro de seguridad: Ignorar filas vacías o corruptas (como la penúltima línea de tu CSV)
      if (!row.title || !row.creatorId) return;

      ticketsToInsert.push({
        title: row.title,
        description: row.description || 'Sin descripción',
        status: mapStatus(row.status),
        caseType: 'INCIDENTE',
        source: row.source || 'PORTAL',
        
        // Mapeo directo de tus UUIDs
        creatorId: row.creatorId,
        categoryId: row.categoryId || null,
        assignedTechId: row.assignedTechId || null,
        
        // Transformación de la fecha (Prisma requiere formato Date)
        createdAt: new Date(row['Fecha de apertura']),
        updatedAt: new Date(row['Fecha de apertura']), 
      });
    })
    .on('end', async () => {
      console.log(`📦 Se leyeron ${ticketsToInsert.length} tickets válidos. Insertando en PostgreSQL...`);
      
      try {
        // Insertar masivamente en la base de datos
        const result = await prisma.supportTicket.createMany({
          data: ticketsToInsert,
          skipDuplicates: true, // Evita duplicados si lo corres por accidente dos veces
        });
        
        console.log(`✅ ¡Migración exitosa! Se importaron ${result.count} tickets históricos.`);
        console.log(`📊 Ve a tu Dashboard en React para ver los gráficos actualizados.`);
      } catch (error) {
        console.error("❌ Error durante la inserción en la base de datos:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

runMigration();