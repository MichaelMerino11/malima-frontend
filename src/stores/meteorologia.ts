import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export interface DatoMeteorologico {
  id: number
  zona_id: number
  temperatura: number
  humedad: number
  velocidad_viento: number
  radiacion_solar: number
  probabilidad_lluvia: number
  registrado_at: string
}

export const useMeteorologiaStore = defineStore('meteorologia', () => {
  const datos = ref<DatoMeteorologico | null>(null)
  const historial = ref<DatoMeteorologico[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  const cargarUltimoDato = async (zona_id: number) => {
    try {
      cargando.value = true
      const { data } = await api.get(`/tinker/ultimo-estado/${zona_id}`)
      if (data.ok && data.data.meteorologia) {
        datos.value = data.data.meteorologia
      }
    } catch (e) {
      error.value = 'Error cargando datos meteorológicos'
    } finally {
      cargando.value = false
    }
  }

  return {
    datos,
    historial,
    cargando,
    error,
    cargarUltimoDato,
  }
})
