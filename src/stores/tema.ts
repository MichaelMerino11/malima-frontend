import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme } from 'vuetify'

export const useTemaStore = defineStore('tema', () => {
  const oscuro = ref(localStorage.getItem('tema') === 'dark')

  const toggleTema = () => {
    oscuro.value = !oscuro.value
    localStorage.setItem('tema', oscuro.value ? 'dark' : 'light')
  }

  return { oscuro, toggleTema }
})
