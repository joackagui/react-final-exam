import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT) || 3000
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const clientBuildDirectory = path.resolve(currentDirectory, '../../client/dist')

app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.post('/api/echo', (request, response) => {
  response.json(request.body)
})

app.use(express.static(clientBuildDirectory))

app.get('/{*path}', (_request, response) => {
  response.sendFile(path.join(clientBuildDirectory, 'index.html'))
})

app.listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`)
})
