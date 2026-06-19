import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'

export class ProfessionalController {
  // Criar Profissional
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password } = request.body as any

    const hashedPassword = await bcrypt.hash(password, 10)

    const professional = await prisma.professional.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return reply.status(201).send(professional)
  }

  // Listar Profissionais
  async list(request: FastifyRequest, reply: FastifyReply) {
    const professionals = await prisma.professional.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return reply.status(200).send(professionals)
  }

  // Atualizar Profissional
  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { name, email, role } = request.body as any

    const professional = await prisma.professional.update({
      where: { id },
      data: { name, email, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return reply.status(200).send(professional)
  }

  // Inativar Profissional (Soft Delete)
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any

    await prisma.professional.update({
      where: { id },
      data: { isActive: false },
    })

    return reply.status(204).send()
  }

  // Login da Equipe
  async login(request: FastifyRequest, reply: FastifyReply) {
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

    // Acessando o JWT instanciado no servidor principal
    const token = request.server.jwt.sign(
      { name: professional.name, role: professional.role },
      { sub: professional.id, expiresIn: '7d' }
    )

    const { password: _, ...professionalData } = professional

    return reply.status(200).send({
      message: 'Login realizado com sucesso!',
      token,
      professional: professionalData,
    })
  }
}