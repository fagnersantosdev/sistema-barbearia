import fastify from 'fastify'
import bcrypt from 'bcrypt' // Importando a biblioteca de criptografia
import { prisma } from './lib/prisma.js'

const app = fastify()

app.post('/professionals', async (request, reply) => {
  const { name, email, password } = request.body as any

  // 1. Criptografando a senha recebida
  // O número 10 é o "salt rounds" (o nível de embaralhamento). 10 é o padrão seguro e rápido.
  const hashedPassword = await bcrypt.hash(password, 10)

  // 2. Salvamos no banco usando a senha gerada pelo bcrypt
  const professional = await prisma.professional.create({
    data: {
      name,
      email,
      password: hashedPassword, // Agora passamos a string embaralhada
    },
  })

  // 3. Devolvemos o profissional criado
  return reply.status(201).send(professional)
})

// Rota para listar os profissionais (GET)
app.get('/professionals', async (request, reply) => {
  // Pedimos ao Prisma para buscar todos, mas selecionando apenas os campos seguros
  const professionals = await prisma.professional.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Note que "password" não está aqui. O Prisma simplesmente não vai trazer essa coluna!
    },
  })

  // Devolvemos a lista com status 200 (OK)
  return reply.status(200).send(professionals)
})

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Servidor da barbearia rodando em http://localhost:3333')
})