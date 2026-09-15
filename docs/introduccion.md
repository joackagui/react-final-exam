# Introducción

## Batalla de los Mares

**Batalla de los Mares** es un juego naval top-down local para dos personas. Enfrenta al Pirata, rápido pero con 80 de vida y 20 de daño, contra el Fantasma, más resistente con 100 de vida y 25 de daño.

El proyecto demuestra el flujo completo React + Express: una tecla genera una petición HTTP, el servidor valida y modifica la partida, y React presenta el estado devuelto. Posiciones, daños, colisiones, proyectiles, viento y victoria se resuelven en el backend, no solo en el navegador.

La experiencia propone una batalla corta de habilidad espacial. Cada persona debe anticipar la inercia del barco, girar con tiempo, buscar una línea de tiro y evitar rocas. El viento cambia el ritmo de la navegación y desvía levemente los disparos cada 30 segundos.

La interfaz tiene tres momentos: configuración de identificadores y estadísticas, combate a pantalla completa y resultado con reinicio. Los assets entregados para barcos, rocas y mar se usan directamente desde `Assets/`.
