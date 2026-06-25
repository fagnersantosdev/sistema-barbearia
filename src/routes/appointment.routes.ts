import { FastifyInstance } from 'fastify'
import { AppointmentController } from '../controllers/AppointmentController.js'

const appointmentController = new AppointmentController()

export async function appointmentRoutes(app: FastifyInstance) {
  app.post('/appointments', appointmentController.create)
  app.get('/appointments', appointmentController.list)
  app.delete('/appointments/:id', appointmentController.delete)
}