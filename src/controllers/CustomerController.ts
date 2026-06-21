import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'

export class CustomerController {
 // Criar Cliente (Com inteligência de Pré-cadastro)
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, phone, email, cpf, password } = request.body as any

    // 1. Verifica se já existe alguém com este telefone
    const existingCustomer = await prisma.customer.findFirst({
      where: { phone },
    })

    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    // 2. O cliente já existe no banco (pode ser da plataforma ou do balcão)
    if (existingCustomer) {
      // Se ele já tem senha, significa que já criou conta na plataforma
      if (existingCustomer.password) {
        return reply.status(409).send({ 
          error: 'Este número de telefone já possui uma conta ativa. Por favor, faça login.' 
        })
      }

      // Se NÃO tem senha, é o nosso cliente do balcão! 
      // Vamos ATUALIZAR o registro dele em vez de criar um novo.
      const updatedCustomer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name, // Atualiza o nome com a grafia correta que ele digitou no app
          cpf: cpf || null,
          email: email || null,
          password: hashedPassword,
        },
      })

      const { password: _, ...customerData } = updatedCustomer
      return reply.status(200).send({
        message: 'Cadastro finalizado com sucesso! Seu histórico foi mantido.',
        customer: customerData,
      })
    }

    // 3. Cliente 100% novo (Não achou o telefone no banco)
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone,
        cpf: cpf || null,
        email: email || null,
        password: hashedPassword,
      },
    })

    const { password: _, ...customerData } = newCustomer
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