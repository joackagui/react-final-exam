# Reglas y experiencia jugable

## Participantes y objetivo

Juegan dos personas locales en el mismo teclado. El jugador 1 controla al **Pirata** y el jugador 2 al **Fantasma**. Gana quien reduce la vida rival a cero.

| Barco    | Vida | Velocidad base | Daño | Controles                        |
| -------- | ---: | -------------: | ---: | -------------------------------- |
| Pirata   |   80 |           1.35 |   20 | `A`/`D` giran, `C` dispara       |
| Fantasma |  100 |           1.05 |   25 | `←`/`→` giran, `Espacio` dispara |

Antes de iniciar se configuran dos identificadores distintos. El contrato actual fija Pirata para jugador 1 y Fantasma para jugador 2.

## Observación, decisiones y respuesta

Se ven barcos, rocas, proyectiles, barras de vida y el mapa completo. Cuando cambia el viento aparece una flecha durante tres segundos; un barco dañado cambia de color brevemente.

El barco siempre avanza hacia su orientación; no se mueve libremente como Minecraft. Al presionar una tecla de giro se aplica un pequeño impulso de 12 grados; mientras se mantiene presionada, el cliente repite esos impulsos cada 180 ms. El servidor rota progresivamente a 45 grados por segundo y cada impulso parte de la orientación actual, por lo que al soltar la tecla no queda una cola de giros acumulados. La decisión es anticipar el giro, evitar rocas y aprovechar la trayectoria y el viento para disparar.

## Mapa y movimiento

El mapa mide 30 × 18. Cada partida genera 8 a 15 rocas, excluyendo un radio de cuatro celdas alrededor de `(1,16)` y `(28,1)`, los inicios de Pirata y Fantasma.

Cada 30 segundos el servidor elige una de ocho direcciones de viento. A favor aumenta hasta 10 % la velocidad, en contra la reduce hasta 10 % y perpendicularmente conserva casi la velocidad base. El viento también puede aumentar o reducir hasta 10 % la velocidad de giro, según la orientación objetivo. Los proyectiles reciben una deriva muy leve del viento.

Al chocar con una roca el barco conserva posición, pierde 10 de vida y rebota invirtiendo orientación y objetivo; así no queda recibiendo daño en cada tick. Un borde produce rebote sin daño.

## Interacción y final

Al disparar se generan tres proyectiles desde el barco. Desaparecen al salir del mapa o tocar roca; al impactar el rival aplican 20 de daño si los lanzó Pirata o 25 si los lanzó Fantasma. Barcos y proyectiles se mueven; rocas son fijas.

Los estados principales son `en_curso` y `finalizada` (el tipo también contempla `esperando`, aunque la creación inicia en curso). Al llegar una vida a cero, Express fija el ganador, elimina proyectiles y rechaza acciones con HTTP 409. React muestra el resultado y **Reiniciar** vuelve al selector.
