// src/prisma.js
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;

// 1. Creamos un Pool de conexiones a Postgres
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Creamos el adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos Prisma con el adaptador
const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'] 
});

export default prisma;