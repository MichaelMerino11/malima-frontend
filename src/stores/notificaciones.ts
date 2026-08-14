import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notificacion {
  id: number
  tipo: 'warning' | 'error' | 'success' | 'info'
  titulo: string
  mensaje: string
  fecha: Date
  leida: boolean
}

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const notificaciones = ref<Notificacion[]>([])
  let contador = 0

  const agregar = (notif: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => {
    notificaciones.value.unshift({
      ...notif,
      id: ++contador,
      fecha: new Date(),
      leida: false,
    })

    // Máximo 20 notificaciones
    if (notificaciones.value.length > 20) {
      notificaciones.value.pop()
    }
  }

  const marcarLeida = (id: number) => {
    const n = notificaciones.value.find((n) => n.id === id)
    if (n) n.leida = true
  }

  const marcarTodasLeidas = () => {
    notificaciones.value.forEach((n) => (n.leida = true))
  }

  const eliminar = (id: number) => {
    notificaciones.value = notificaciones.value.filter((n) => n.id !== id)
  }

  const noLeidas = ref(0)

  const sinLeer = () => notificaciones.value.filter((n) => !n.leida).length

  return {
    notificaciones,
    noLeidas,
    agregar,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
    sinLeer,
  }
})
