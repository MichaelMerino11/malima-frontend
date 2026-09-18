import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

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

  const cargar = async () => {
    try {
      const { data } = await api.get('/notificaciones')
      if (data.ok) {
        notificaciones.value = data.data.map((n: any) => ({
          ...n,
          fecha: new Date(n.created_at),
        }))
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    }
  }

  const agregar = async (notif: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => {
    try {
      const { data } = await api.post('/notificaciones', {
        tipo: notif.tipo,
        titulo: notif.titulo,
        mensaje: notif.mensaje,
      })
      if (data.ok) {
        notificaciones.value.unshift({
          ...data.data,
          fecha: new Date(data.data.created_at),
        })
        const campana = document.querySelector('.mdi-bell')
        if (campana) {
          campana.classList.add('bounce')
          setTimeout(() => campana.classList.remove('bounce'), 500)
        }
      }
    } catch (error) {
      console.error('Error agregando notificación:', error)
    }
  }

  const marcarLeida = async (id: number) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`)
      const n = notificaciones.value.find((n) => n.id === id)
      if (n) n.leida = true
    } catch (error) {
      console.error('Error marcando notificación:', error)
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      await api.patch('/notificaciones/leer-todas')
      notificaciones.value.forEach((n) => (n.leida = true))
    } catch (error) {
      console.error('Error marcando todas las notificaciones:', error)
    }
  }

  const eliminar = async (id: number) => {
    try {
      await api.delete(`/notificaciones/${id}`)
      notificaciones.value = notificaciones.value.filter((n) => n.id !== id)
    } catch (error) {
      console.error('Error eliminando notificación:', error)
    }
  }

  const sinLeer = () => notificaciones.value.filter((n) => !n.leida).length

  return {
    notificaciones,
    cargar,
    agregar,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
    sinLeer,
  }
})