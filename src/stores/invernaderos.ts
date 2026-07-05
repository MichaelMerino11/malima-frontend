import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export interface Motor {
  id: number
  nombre: string
  variador_id: string
  estado: 'abriendo' | 'cerrando' | 'detenido' | 'error'
}

export interface Invernadero {
  id: number
  zona_id: number
  nombre: string
  numero: number
  estado: 'abierto' | 'cerrado' | 'en_movimiento'
  modo: 'local' | 'remoto' | 'automatico'
  activo: boolean
  estado_motor?: string
}

export interface Zona {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
  invernaderos?: Invernadero[]
}

export const useInvernaderosStore = defineStore('invernaderos', () => {
  const zonas = ref<Zona[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  const cargarEstadoZona = async (zona_id: number) => {
    try {
      cargando.value = true
      const { data } = await api.get(`/tinker/ultimo-estado/${zona_id}`)
      if (data.ok) {
        const zona = zonas.value.find((z) => z.id === zona_id)
        if (zona) {
          zona.invernaderos = data.data.invernaderos
        }
      }
    } catch (e) {
      error.value = 'Error cargando estado de zona'
    } finally {
      cargando.value = false
    }
  }

  const enviarComando = async (invernadero_id: number, accion: 'abrir' | 'cerrar' | 'detener') => {
    try {
      const { data } = await api.post(`/control/invernadero/${invernadero_id}`, {
        accion,
        modo_origen: 'remoto',
      })
      return data
    } catch (e) {
      error.value = 'Error enviando comando'
      return { ok: false }
    }
  }

  const enviarComandoZona = async (zona_id: number, accion: 'abrir' | 'cerrar' | 'detener') => {
    try {
      const { data } = await api.post(`/control/zona/${zona_id}`, {
        accion,
        modo_origen: 'remoto',
      })
      return data
    } catch (e) {
      error.value = 'Error enviando comando a zona'
      return { ok: false }
    }
  }

  const cambiarModo = async (invernadero_id: number, modo: 'local' | 'remoto' | 'automatico') => {
    try {
      const { data } = await api.patch(`/control/invernadero/${invernadero_id}/modo`, { modo })
      return data
    } catch (e) {
      error.value = 'Error cambiando modo'
      return { ok: false }
    }
  }

  return {
    zonas,
    cargando,
    error,
    cargarEstadoZona,
    enviarComando,
    enviarComandoZona,
    cambiarModo,
  }
})
