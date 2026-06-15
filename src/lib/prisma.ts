import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Pega a URL do seu arquivo .env
const connectionString = process.env.DATABASE_URL

// Cria o pool de conexão nativo do PostgreSQL
const pool = new Pool({ connectionString })

// Passa o pool para o adaptador do Prisma
const adapter = new PrismaPg(pool)

// Inicia o Prisma usando o adaptador
export const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error'], // Mantemos o log para ver o SQL no terminal
})