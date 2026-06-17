import fastify from 'fastify'
import bcrypt from 'bcrypt' // Importando a biblioteca de criptografia
import fastifyJwt from '@fastify/jwt' // 1. Importando o JWT
import { prisma } from './lib/prisma.js'

const app = fastify()

// Registrando o JWT no Fastify com a nossa chave do .env
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'chave_padrao_desenvolvimento',
})

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

// Rota para atualizar os dados de um profissional (PUT)
app.put('/professionals/:id', async (request, reply) => {
  // Pegamos o ID que vem na URL
  const { id } = request.params as any
  // Pegamos os novos dados que vêm no corpo da requisição
  const { name, email, role } = request.body as any

  // Atualizamos no banco
  const professional = await prisma.professional.update({
    where: { id },
    data: {
      name,
      email,
      role,
    },
    // Novamente, filtramos para não devolver a senha na resposta
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    }
  })

  return reply.status(200).send(professional)
})

// Rota para inativar um profissional (Soft Delete)
app.delete('/professionals/:id', async (request, reply) => {
  const { id } = request.params as any

  // Em vez de usar prisma.professional.delete, usamos o update para mudar o status
  await prisma.professional.update({
    where: { id },
    data: {
      isActive: false,
    },
  })

  // Status 204 significa "No Content" (Deu certo, mas não tenho texto para te devolver)
  return reply.status(204).send()
})

// Atualizando a Rota de Login
app.post('/login', async (request, reply) => {
  const { email, password } = request.body as any

  const professional = await prisma.professional.findUnique({
    where: { email },
  })

  if (!professional) {
    return reply.status(401).send({ error: 'Credenciais inválidas.' })
  }

  const isPasswordValid = await bcrypt.compare(password, professional.password)

  if (!isPasswordValid) {
    return reply.status(401).send({ error: 'Credenciais inválidas.' })
  }

  // 4. GERANDO O TOKEN JWT
  // O "sub" (subject) é sempre quem é o dono do token (o ID do usuário)
  // Também podemos colocar informações não-sensíveis no token, como o cargo (role)
  const token = app.jwt.sign(
    { 
      name: professional.name,
      role: professional.role 
    },
    { 
      sub: professional.id,
      expiresIn: '7d', // O token expira em 7 dias (o usuário precisará logar de novo)
    }
  )

  const { password: _, ...professionalData } = professional

  // 5. Devolvendo o token na resposta junto com os dados
  return reply.status(200).send({
    message: 'Login realizado com sucesso!',
    token, // <-- O crachá digital!
    professional: professionalData
  })
})

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Servidor da barbearia rodando em http://localhost:3333')
})