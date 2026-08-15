<template>
  <v-app>
    <!-- HEADER MÓVIL -->
    <v-app-bar v-if="mobile" flat color="surface" border="b" elevation="1">
      <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen" />
      <v-app-bar-title>
        <img src="/logo_malima.png" height="28" style="vertical-align: middle; margin-top: 4px" />
      </v-app-bar-title>
      <template #append>
        <v-btn icon @click="toggleTema">
          <v-icon>{{ temaStore.oscuro ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
        <v-btn icon @click="panelNotif = !panelNotif">
          <v-badge
            :content="notifStore.sinLeer()"
            :model-value="notifStore.sinLeer() > 0"
            color="error"
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawerOpen"
      :rail="!mobile && !hovered"
      :temporary="mobile"
      :permanent="!mobile"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <div class="d-flex align-center justify-space-between px-3 py-3">
        <img
          v-if="hovered || mobile"
          src="/logo_malima.png"
          height="40"
          style="object-fit: contain"
        />
        <img v-else src="/logo_malima_icono.png" height="32" style="object-fit: contain" />
        <div v-if="(hovered || mobile) && !mobile" class="d-flex gap-1">
          <v-btn icon size="small" variant="text" @click="toggleTema">
            <v-icon size="20">{{
              temaStore.oscuro ? 'mdi-weather-sunny' : 'mdi-weather-night'
            }}</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" @click="panelNotif = !panelNotif">
            <v-badge
              :content="notifStore.sinLeer()"
              :model-value="notifStore.sinLeer() > 0"
              color="error"
            >
              <v-icon size="20">mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </div>
      </div>

      <v-divider />

      <v-list nav>
        <v-list-item
          prepend-icon="mdi-home"
          title="Inicio"
          to="/home"
          @click="mobile && (drawerOpen = false)"
        />
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/dashboard"
          @click="mobile && (drawerOpen = false)"
        />
        <v-list-item
          prepend-icon="mdi-weather-partly-cloudy"
          title="Meteorología"
          to="/meteorologia"
          @click="mobile && (drawerOpen = false)"
        />
        <v-list-item
          prepend-icon="mdi-history"
          title="Historial"
          to="/eventos"
          @click="mobile && (drawerOpen = false)"
        />
        <v-list-item
          v-if="authStore.isAdmin"
          prepend-icon="mdi-cog"
          title="Configuración"
          to="/configuracion"
          @click="mobile && (drawerOpen = false)"
        />
        <v-list-item
          v-if="authStore.isAdmin"
          prepend-icon="mdi-account-group"
          title="Usuarios"
          to="/usuarios"
          @click="mobile && (drawerOpen = false)"
        />
      </v-list>

      <template #append>
        <v-divider />
        <v-list-item
          prepend-icon="mdi-account-circle"
          title="Mi perfil"
          to="/perfil"
          @click="mobile && (drawerOpen = false)"
        />
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar sesión"
          :subtitle="hovered && !mobile ? authStore.usuario?.nombre : undefined"
          class="py-3"
          @click="logout"
        />
      </template>
    </v-navigation-drawer>

    <!-- PANEL DE NOTIFICACIONES -->
    <v-navigation-drawer v-model="panelNotif" location="right" temporary width="360">
      <div class="d-flex align-center justify-space-between pa-4">
        <span class="text-body-1 font-weight-bold">Notificaciones</span>
        <div class="d-flex gap-1">
          <v-btn size="small" variant="text" @click="notifStore.marcarTodasLeidas()"
            >Marcar todas leídas</v-btn
          >
          <v-btn icon size="small" variant="text" @click="panelNotif = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <v-divider />

      <div v-if="notifStore.notificaciones.length === 0" class="pa-6 text-center">
        <v-icon size="48" color="grey-lighten-2">mdi-bell-off</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-2">Sin notificaciones</p>
      </div>

      <v-list v-else lines="two" class="pa-2">
        <v-list-item
          v-for="notif in notifStore.notificaciones"
          :key="notif.id"
          rounded="lg"
          :class="notif.leida ? '' : 'bg-surface-variant'"
          class="mb-1"
          @click="notifStore.marcarLeida(notif.id)"
        >
          <template #prepend>
            <v-icon :color="notif.tipo" size="20">
              {{
                notif.tipo === 'warning'
                  ? 'mdi-alert'
                  : notif.tipo === 'error'
                    ? 'mdi-close-circle'
                    : notif.tipo === 'success'
                      ? 'mdi-check-circle'
                      : 'mdi-information'
              }}
            </v-icon>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">{{
            notif.titulo
          }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ notif.mensaje }}</v-list-item-subtitle>
          <template #append>
            <div class="d-flex flex-column align-end gap-1">
              <span class="text-caption text-medium-emphasis">{{ formatHora(notif.fecha) }}</span>
              <v-btn icon size="x-small" variant="text" @click.stop="notifStore.eliminar(notif.id)">
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>

    <LoadingApp :visible="loadingStore.visible" :mensaje="loadingStore.mensaje" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { useAuthStore } from './stores/auth'
import { useNotificacionesStore } from './stores/notificaciones'
import { useTemaStore } from './stores/tema'
import LoadingApp from './components/shared/LoadingApp.vue'
import { useLoadingStore } from './stores/loading'
import { useSocket } from './composables/useSocket'
import api from './api/axios'

const loadingStore = useLoadingStore()
const authStore = useAuthStore()
const notifStore = useNotificacionesStore()
const temaStore = useTemaStore()
const theme = useTheme()
const router = useRouter()
const { mobile } = useDisplay()
const { conectar } = useSocket()

const hovered = ref(false)
const drawerOpen = ref(!mobile.value)
const panelNotif = ref(false)

let intervaloNotif: ReturnType<typeof setInterval>

const formatHora = (fecha: Date) => {
  return fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const toggleTema = () => {
  temaStore.toggleTema()
  theme.global.name.value = temaStore.oscuro ? 'dark' : 'light'
}

const verificarAlertas = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const { data } = await api.get('/zonas')
    if (data.ok) {
      for (const zona of data.data) {
        const meteo = await api.get(`/tinker/ultimo-estado/${zona.id}`)
        if (meteo.data.ok && meteo.data.data.meteorologia) {
          const m = meteo.data.data.meteorologia
          if ((m.probabilidad_lluvia ?? 0) > 60) {
            notifStore.agregar({
              tipo: 'warning',
              titulo: `⚠️ Alerta de lluvia — ${zona.nombre}`,
              mensaje: `Probabilidad de lluvia: ${m.probabilidad_lluvia}%. Considere cerrar los invernaderos.`,
            })
          }
          if (m.velocidad_viento > 40) {
            notifStore.agregar({
              tipo: 'warning',
              titulo: `💨 Viento fuerte — ${zona.nombre}`,
              mensaje: `Velocidad del viento: ${m.velocidad_viento} km/h. Se recomienda cerrar los invernaderos.`,
            })
          }
        }
      }
    }
  } catch {}
}

watch(mobile, (isMobile) => {
  drawerOpen.value = !isMobile
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  theme.global.name.value = temaStore.oscuro ? 'dark' : 'light'
  await authStore.cargarUsuario()
  await verificarAlertas()
  intervaloNotif = setInterval(verificarAlertas, 60000)
  conectar()
})

onUnmounted(() => {
  clearInterval(intervaloNotif)
})
</script>
