import { onMounted, onUnmounted, ref } from 'vue'

export function useInactividad(
  onCerrarSesion: () => void,
  tiempoInactividad = 3 * 60 * 1000, // 3 minutos
  tiempoAviso = 30 * 1000, // aviso 30s antes
) {
  const mostrarAviso = ref(false)
  const segundosRestantes = ref(30)

  let timerPrincipal: ReturnType<typeof setTimeout> | undefined
  let timerAviso: ReturnType<typeof setTimeout> | undefined
  let timerCuenta: ReturnType<typeof setInterval> | undefined

  const limpiarTimers = () => {
    clearTimeout(timerPrincipal)
    clearTimeout(timerAviso)
    clearInterval(timerCuenta)
  }

  const cerrar = () => {
    limpiarTimers()
    mostrarAviso.value = false
    onCerrarSesion()
  }

  const iniciarCuenta = () => {
    segundosRestantes.value = 30
    clearInterval(timerCuenta)
    timerCuenta = setInterval(() => {
      segundosRestantes.value--
      if (segundosRestantes.value <= 0) {
        clearInterval(timerCuenta)
      }
    }, 1000)
  }

  const reiniciar = () => {
    limpiarTimers()
    mostrarAviso.value = false

    timerAviso = setTimeout(() => {
      mostrarAviso.value = true
      iniciarCuenta()
    }, tiempoInactividad - tiempoAviso)

    timerPrincipal = setTimeout(() => {
      cerrar()
    }, tiempoInactividad)
  }

  const continuar = () => {
    reiniciar()
  }

  const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

  onMounted(() => {
    reiniciar()
    eventos.forEach((evento) => window.addEventListener(evento, reiniciar, { passive: true }))
  })

  onUnmounted(() => {
    limpiarTimers()
    eventos.forEach((evento) => window.removeEventListener(evento, reiniciar))
  })

  return { mostrarAviso, segundosRestantes, continuar }
}