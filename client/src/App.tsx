import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  status: string
}

function App() {
  const [health, setHealth] = useState('Conectando con el servidor…')

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/health')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as HealthResponse
        setHealth(`Servidor: ${data.status}`)
      } catch {
        setHealth('No se pudo conectar con el servidor.')
      }
    }

    void checkHealth()
  }, [])

  return (
    <main className="app-shell">
      <section className="status-card" aria-labelledby="app-title">
        <p className="eyebrow">React + Express · Base funcional</p>
        <h1 id="app-title">React Final Exam</h1>
        <p>Juego naval top-down para dos jugadores en el mismo dispositivo.</p>
        <p className="health-status" role="status">{health}</p>
      </section>
    </main>
  )
}

export default App
