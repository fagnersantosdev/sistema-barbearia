// src/server.ts
import fastify from 'fastify'
import { prisma } from './lib/prisma'

const app = fastify()

// Nossa primeira rota de teste: Listar clientes
app.get('/customers', async (request, reply) => {
  const customers = await prisma.customer.findMany()
  return customers
})

// Iniciando o servidor na porta 3333
app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Servidor da barbearia rodando em http://localhost:3333')
})