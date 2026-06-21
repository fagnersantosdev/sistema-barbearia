import { FastifyInstance } from 'fastify'
import { CustomerController } from '../controllers/CustomerController.js'

const customerController = new CustomerController()

export async function customerRoutes(app: FastifyInstance) {
  app.post('/customers', customerController.create)
  app.post('/customers/login', customerController.login)
  app.get('/customers', customerController.list)
  app.put('/customers/:id', customerController.update)
  app.delete('/customers/:id', customerController.delete)
}