import { FastifyInstance } from 'fastify'
import { ServiceController } from '../controllers/ServiceController.js'

const serviceController = new ServiceController()

export async function serviceRoutes(app: FastifyInstance) {
  app.post('/services', serviceController.create)
  app.get('/services', serviceController.list)
  app.put('/services/:id', serviceController.update)
  app.delete('/services/:id', serviceController.delete)
}