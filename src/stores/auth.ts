import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'operador' | 'supervisor'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const usuario = ref<Usuario | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => usuario.value?.rol === 'admin')
  const isOperador = computed(() => ['admin', 'operador'].includes(usuario.value?.rol ?? ''))

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.ok) {
      token.value = data.token
      usuario.value = data.usuario
      localStorage.setItem('token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }
    return data
  }

  const logout = () => {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const cargarUsuario = async () => {
    if (!token.value) return
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      const { data } = await api.get('/auth/me')
      if (data.ok) usuario.value = data.data
    } catch {
      logout()
    }
  }

  return {
    token,
    usuario,
    isAuthenticated,
    isAdmin,
    isOperador,
    login,
    logout,
    cargarUsuario,
  }
})
