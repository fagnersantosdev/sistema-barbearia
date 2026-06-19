import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'

export class CustomerController {
  // Criar Cliente
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, phone, email, password } = request.body as any

    let hashedPassword = null

    // Se o cliente forneceu uma senha (cadastro via plataforma)
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null, // Se for vazio, salva como null no banco
        password: hashedPassword,
      },
    })

    // Remove a senha do retorno por segurança
    const { password: _, ...customerData } = customer

    return reply.status(201).send(customerData)
  }

  // Login do Cliente
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as any

    if (!email || !password) {
      return reply.status(400).send({ error: 'E-mail e senha são obrigatórios.' })
    }

    // Busca o cliente pelo e-mail único
    const customer = await prisma.customer.findUnique({
      where: { email },
    })

    // Se não encontrar ou se o cliente não tiver senha cadastrada (cliente de balcão)
    if (!customer || !customer.password) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' })
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password)

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' })
    }

    // Gera o token JWT com o ID do cliente no 'sub'
    const token = request.server.jwt.sign(
      { name: customer.name, role: 'CUSTOMER' },
      { sub: customer.id, expiresIn: '7d' }
    )

    const { password: _, ...customerData } = customer

    return reply.status(200).send({
      message: 'Login realizado com sucesso!',
      token,
      customer: customerData,
    })
  }

  // Listar Clientes
  async list(request: FastifyRequest, reply: FastifyReply) {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        // Novamente, omitimos o password por segurança
      },
    })

    return reply.status(200).send(customers)
  }

  // Atualizar Cliente
  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { name, phone, email } = request.body as any

    const customer = await prisma.customer.update({
      where: { id },
      data: { name, phone, email },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        updatedAt: true,
      },
    })

    return reply.status(200).send(customer)
  }

  // Deletar Cliente
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any

    await prisma.customer.delete({
      where: { id },
    })

    return reply.status(204).send()
  }
}