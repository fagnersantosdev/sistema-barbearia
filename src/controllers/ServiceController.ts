import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'

export class ServiceController {
  // Criar Serviço (Com trava de duplicidade)
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, description, price, duration } = request.body as any

    // 1. Verifica se já existe um serviço com este nome (ignorando maiúsculas/minúsculas)
    const serviceExists = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive', 
        },
      },
    })

    // Se achou, barra a criação e retorna o erro 409 (Conflict)
    if (serviceExists) {
      return reply.status(409).send({ 
        error: 'Já existe um serviço cadastrado com este nome.' 
      })
    }

    // 2. Se o nome estiver livre, salva no banco
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        duration,
      },
    })

    return reply.status(201).send(service)
  }

  // Listar Serviços (Traz apenas os ativos para exibir no app do cliente)
  async list(request: FastifyRequest, reply: FastifyReply) {
    const services = await prisma.service.findMany({
      where: {
        isActive: true, // Filtro crucial!
      },
      orderBy: {
        name: 'asc', // Retorna em ordem alfabética para ficar bonito na tela
      }
    })

    return reply.status(200).send(services)
  }

  // Atualizar Serviço (ex: Mudança de preço)
  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { name, description, price, duration } = request.body as any

    const service = await prisma.service.update({
      where: { id },
      data: { name, description, price, duration },
    })

    return reply.status(200).send(service)
  }

  // Inativar Serviço (Soft Delete)
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any

    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    })

    return reply.status(204).send()
  }
}