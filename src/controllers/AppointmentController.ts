import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'

export class AppointmentController {
  // Criar Agendamento
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { date, customerId, professionalId, serviceId } = request.body as any

    // Aqui o Prisma faz o "insert" na tabela de agendamentos
    const appointment = await prisma.appointment.create({
      data: {
        // O JavaScript recebe a data como texto (string), então convertemos para o formato nativo de Data
        date: new Date(date), 
        customerId,
        professionalId,
        serviceId,
      },
    })

    return reply.status(201).send(appointment)
  }

  // Listar Agendamentos (Com os dados cruzados!)
  async list(request: FastifyRequest, reply: FastifyReply) {
    const appointments = await prisma.appointment.findMany({
      // O include busca os dados nas outras tabelas!
      include: {
        customer: {
          select: { name: true, phone: true }
        },
        professional: {
          select: { name: true }
        },
        service: {
          select: { name: true, price: true, duration: true }
        }
      },
      orderBy: {
        date: 'asc' // Ordena dos mais próximos para os mais distantes
      }
    })

    return reply.status(200).send(appointments)
  }

  // Deletar / Cancelar Agendamento
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any

    await prisma.appointment.delete({
      where: { id },
    })

    return reply.status(204).send()
  }
}