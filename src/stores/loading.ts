import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const visible = ref(false)
  const mensaje = ref('Cargando...')

  const mostrar = (msg = 'Cargando...') => {
    mensaje.value = msg
    visible.value = true
  }

  const ocultar = () => {
    visible.value = false
  }

  return { visible, mensaje, mostrar, ocultar }
})