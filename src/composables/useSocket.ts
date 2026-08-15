import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null

export const useSocket = () => {
  const conectado = ref(false)

  const conectar = () => {
    if (socket?.connected) return

    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      conectado.value = true
      console.log('🔌 WebSocket conectado')
    })

    socket.on('disconnect', () => {
      conectado.value = false
      console.log('❌ WebSocket desconectado')
    })
  }

  const unirseAZona = (zona_id: number) => {
    socket?.emit('join-zona', zona_id)
  }

  const escuchar = (evento: string, callback: (data: any) => void) => {
    socket?.on(evento, callback)
  }

  const dejarDeEscuchar = (evento: string) => {
    socket?.off(evento)
  }

  const desconectar = () => {
    socket?.disconnect()
    socket = null
  }

  return { conectado, conectar, unirseAZona, escuchar, dejarDeEscuchar, desconectar }
}
