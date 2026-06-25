import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { professionalRoutes } from './routes/professional.routes.js'
import { customerRoutes } from './routes/customer.routes.js' // 1. Importar as rotas
import { serviceRoutes } from './routes/service.routes.js'
import { appointmentRoutes } from './routes/appointment.routes.js' // 1. Importar as rotas

const app = fastify()

// Configuração do JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'chave_padrao_desenvolvimento',
})

// Registro de Rotas
// Adicionamos um "prefixo" opcional, mas vamos manter na raiz para não quebrar os testes
app.register(professionalRoutes)
app.register(customerRoutes)
app.register(serviceRoutes)
app.register(appointmentRoutes)
// Inicialização do Servidor
app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Servidor da barbearia rodando em http://localhost:3333')
})