import { FastifyInstance } from 'fastify'
import { ProfessionalController } from '../controllers/ProfessionalController.js'

// Instanciamos o Controller uma única vez
const professionalController = new ProfessionalController()

export async function professionalRoutes(app: FastifyInstance) {
  // Passamos a referência de cada método para a sua respectiva rota
  app.post('/professionals', professionalController.create)
  app.get('/professionals', professionalController.list)
  app.put('/professionals/:id', professionalController.update)
  app.delete('/professionals/:id', professionalController.delete)
  
  app.post('/login', professionalController.login)
}