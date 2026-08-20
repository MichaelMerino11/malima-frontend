<template>
  <v-app>
    <v-app-bar
      v-if="mobile && authStore.isAuthenticated"
      flat
      color="surface"
      border="b"
      height="64"
      class="app-header"
    >
      <v-app-bar-nav-icon class="ml-1" @click="drawerOpen = !drawerOpen" />

      <div class="mobile-brand">
        <img src="/logo_malima_icono.png" alt="Malima" class="brand-icon" />

        <div class="mobile-brand__text">
          <span class="brand-name">Grupo Malima</span>
          <span class="brand-system">Invernaderos</span>
        </div>
      </div>

      <v-spacer />

      <div class="header-actions pr-2">
        <v-tooltip :text="temaStore.oscuro ? 'Modo claro' : 'Modo oscuro'" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              class="header-action-btn"
              @click="toggleTema"
            >
              <v-icon size="21">
                {{ temaStore.oscuro ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Notificaciones" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              class="header-action-btn"
              @click="panelNotif = !panelNotif"
            >
              <v-badge
                :content="notifStore.sinLeer()"
                :model-value="notifStore.sinLeer() > 0"
                color="error"
                location="top end"
              >
                <v-icon size="21">mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
          </template>
        </v-tooltip>

        <v-menu
          location="bottom end"
          :open-on-hover="false"
          :close-on-content-click="true"
          offset="8"
        >
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" class="mobile-profile-btn">
              <v-avatar size="34" color="primary" class="profile-avatar">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Perfil" class="avatar-image" />

                <span v-else class="avatar-initials">
                  {{ iniciales }}
                </span>
              </v-avatar>
            </v-btn>
          </template>

          <v-card width="290" rounded="lg" elevation="8" class="profile-menu">
            <div class="profile-menu__header">
              <v-avatar size="46" color="primary">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Perfil" class="avatar-image" />

                <span v-else class="avatar-initials avatar-initials--large">
                  {{ iniciales }}
                </span>
              </v-avatar>

              <div class="profile-menu__identity">
                <strong>
                  {{ authStore.usuario?.nombre || 'Usuario' }}
                </strong>

                <span>
                  {{ authStore.usuario?.email || '' }}
                </span>
              </div>
            </div>

            <v-divider />

            <v-list density="comfortable" class="profile-menu__list">
              <v-list-item
                prepend-icon="mdi-account-outline"
                title="Mi perfil"
                rounded="lg"
                @click="irPerfil"
              />

              <v-list-item
                prepend-icon="mdi-logout"
                title="Cerrar sesión"
                rounded="lg"
                class="logout-item"
                @click="confirmarLogout = true"
              />
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-app-bar
      v-if="!mobile && authStore.isAuthenticated"
      flat
      color="surface"
      border="b"
      height="64"
      class="app-header"
    >
      <div class="desktop-brand">
        <div class="brand-logo-wrapper">
          <img src="/logo_malima_icono.png" alt="Malima" class="brand-icon" />
        </div>

        <div class="brand-info">
          <div class="brand-info__top">
            <span class="brand-name"> Grupo Malima </span>

            <span class="brand-divider" />

            <span class="brand-system"> Sistema de Invernaderos </span>
          </div>
        </div>
      </div>

      <v-spacer />

      <div class="header-actions desktop-actions">
        <v-tooltip
          :text="temaStore.oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              class="header-action-btn"
              @click="toggleTema"
            >
              <v-icon size="21">
                {{ temaStore.oscuro ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Notificaciones" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              class="header-action-btn"
              @click="panelNotif = !panelNotif"
            >
              <v-badge
                :content="notifStore.sinLeer()"
                :model-value="notifStore.sinLeer() > 0"
                color="error"
                location="top end"
              >
                <v-icon size="21"> mdi-bell-outline </v-icon>
              </v-badge>
            </v-btn>
          </template>
        </v-tooltip>

        <div class="header-separator" />

        <v-menu
          location="bottom end"
          :open-on-hover="true"
          :close-on-content-click="true"
          open-delay="100"
          close-delay="250"
          offset="8"
        >
          <template #activator="{ props }">
            <div v-bind="props" class="profile-trigger">
              <v-avatar size="36" color="primary" class="profile-avatar">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Perfil" class="avatar-image" />

                <span v-else class="avatar-initials">
                  {{ iniciales }}
                </span>
              </v-avatar>

              <div class="profile-trigger__text">
                <span class="profile-name">
                  {{ primerNombre }}
                </span>

                <span class="profile-role">
                  {{ authStore.isAdmin ? 'Administrador' : 'Usuario' }}
                </span>
              </div>

              <v-icon size="17" class="profile-chevron"> mdi-chevron-down </v-icon>
            </div>
          </template>

          <v-card width="300" rounded="lg" elevation="8" class="profile-menu">
            <div class="profile-menu__header">
              <v-avatar size="48" color="primary">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Perfil" class="avatar-image" />

                <span v-else class="avatar-initials avatar-initials--large">
                  {{ iniciales }}
                </span>
              </v-avatar>

              <div class="profile-menu__identity">
                <strong>
                  {{ authStore.usuario?.nombre || 'Usuario' }}
                </strong>

                <span>
                  {{ authStore.usuario?.email || '' }}
                </span>

                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="mt-2 profile-role-chip"
                >
                  {{ authStore.isAdmin ? 'Administrador' : 'Usuario' }}
                </v-chip>
              </div>
            </div>

            <v-divider />

            <v-list density="comfortable" class="profile-menu__list">
              <v-list-item
                prepend-icon="mdi-account-outline"
                title="Mi perfil"
                rounded="lg"
                @click="irPerfil"
              />

              <v-divider class="my-1" />

              <v-list-item
                prepend-icon="mdi-logout"
                title="Cerrar sesión"
                rounded="lg"
                class="logout-item"
                @click="confirmarLogout = true"
              />
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawerOpen"
      :rail="!mobile && !hovered"
      :temporary="mobile"
      :permanent="!mobile"
      class="app-sidebar"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <!-- <div class="sidebar-brand">
        <div v-if="hovered || mobile" class="sidebar-brand__expanded">
          <img src="/logo_malima.png" alt="Malima" class="sidebar-logo" />
        </div>

        <div v-else class="sidebar-brand__collapsed">
          <img src="/logo_malima_icono.png" alt="Malima" class="sidebar-logo-icon" />
        </div>
      </div>

      <v-divider /> -->

      <v-list nav class="sidebar-navigation">
        <v-list-item
          prepend-icon="mdi-home-outline"
          title="Inicio"
          to="/home"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          to="/dashboard"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          prepend-icon="mdi-cog-transfer-outline"
          title="Variadores"
          to="/variadores"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          prepend-icon="mdi-weather-partly-cloudy"
          title="Meteorología"
          to="/meteorologia"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          prepend-icon="mdi-history"
          title="Historial"
          to="/eventos"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          prepend-icon="mdi-alert-outline"
          title="Alarmas"
          to="/alarmas"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          v-if="authStore.isAdmin"
          prepend-icon="mdi-cog-outline"
          title="Configuración"
          to="/configuracion"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />

        <v-list-item
          v-if="authStore.isAdmin"
          prepend-icon="mdi-account-group-outline"
          title="Usuarios"
          to="/usuarios"
          rounded="lg"
          @click="cerrarDrawerMobile"
        />
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="panelNotif"
      location="right"
      temporary
      :width="mobile ? 340 : 380"
      class="notifications-panel"
    >
      <div class="notifications-header">
        <div>
          <h3>Notificaciones</h3>

          <span>
            {{ notifStore.sinLeer() }}
            {{ notifStore.sinLeer() === 1 ? 'sin leer' : 'sin leer' }}
          </span>
        </div>

        <div class="d-flex align-center ga-1">
          <v-tooltip text="Marcar todas como leídas" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="small"
                variant="text"
                :disabled="notifStore.sinLeer() === 0"
                @click="notifStore.marcarTodasLeidas()"
              >
                <v-icon size="19"> mdi-check-all </v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-btn icon size="small" variant="text" @click="panelNotif = false">
            <v-icon size="20"> mdi-close </v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider />

      <div v-if="notifStore.notificaciones.length === 0" class="notifications-empty">
        <div class="notifications-empty__icon">
          <v-icon size="38" color="primary"> mdi-bell-check-outline </v-icon>
        </div>

        <h4>Sin notificaciones</h4>

        <p>No tienes nuevas notificaciones por revisar.</p>
      </div>

      <v-list v-else lines="two" class="notifications-list">
        <v-list-item
          v-for="notif in notifStore.notificaciones"
          :key="notif.id"
          rounded="lg"
          class="notification-item"
          :class="{
            'notification-item--unread': !notif.leida,
          }"
          @click="notifStore.marcarLeida(notif.id)"
        >
          <template #prepend>
            <div class="notification-icon" :class="`notification-icon--${notif.tipo}`">
              <v-icon size="19">
                {{
                  notif.tipo === 'warning'
                    ? 'mdi-alert-outline'
                    : notif.tipo === 'error'
                      ? 'mdi-close-circle-outline'
                      : notif.tipo === 'success'
                        ? 'mdi-check-circle-outline'
                        : 'mdi-information-outline'
                }}
              </v-icon>
            </div>
          </template>

          <v-list-item-title class="notification-title">
            {{ notif.titulo }}
          </v-list-item-title>

          <v-list-item-subtitle class="notification-message">
            {{ notif.mensaje }}
          </v-list-item-subtitle>

          <template #append>
            <div class="notification-meta">
              <span>
                {{ formatHora(notif.fecha) }}
              </span>

              <v-btn icon size="x-small" variant="text" @click.stop="notifStore.eliminar(notif.id)">
                <v-icon size="14"> mdi-close </v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog v-model="confirmarLogout" max-width="390">
      <v-card rounded="xl" elevation="12" class="logout-dialog">
        <div class="logout-dialog__icon">
          <v-icon size="34" color="error"> mdi-logout </v-icon>
        </div>

        <v-card-title class="logout-dialog__title"> Cerrar sesión </v-card-title>

        <v-card-text class="logout-dialog__text">
          ¿Estás seguro de que deseas cerrar tu sesión?
        </v-card-text>

        <v-card-actions class="logout-dialog__actions">
          <v-btn variant="text" rounded="lg" @click="confirmarLogout = false"> Cancelar </v-btn>

          <v-btn
            color="error"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-logout"
            @click="logout"
          >
            Cerrar sesión
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-main>
      <router-view v-slot="{ Component, route }">
        <transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>

    <LoadingApp :visible="loadingStore.visible" :mensaje="loadingStore.mensaje" />
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'

import { useAuthStore } from './stores/auth'
import { useNotificacionesStore } from './stores/notificaciones'
import { useTemaStore } from './stores/tema'
import { useLoadingStore } from './stores/loading'
import { useSocket } from './composables/useSocket'

import LoadingApp from './components/shared/LoadingApp.vue'
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
const confirmarLogout = ref(false)
const avatarUrl = ref<string | null>(null)

let intervaloNotif: ReturnType<typeof setInterval> | undefined

const iniciales = computed(() => {
  const nombre = authStore.usuario?.nombre ?? ''

  if (!nombre.trim()) {
    return 'U'
  }

  return nombre
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const primerNombre = computed(() => {
  const nombre = authStore.usuario?.nombre?.trim()

  if (!nombre) {
    return 'Usuario'
  }

  return nombre.split(/\s+/)[0]
})

const formatHora = (fecha: Date | string) => {
  const fechaReal = fecha instanceof Date ? fecha : new Date(fecha)

  if (Number.isNaN(fechaReal.getTime())) {
    return ''
  }

  return fechaReal.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const toggleTema = () => {
  temaStore.toggleTema()

  theme.global.name.value = temaStore.oscuro ? 'dark' : 'light'
}

const irPerfil = () => {
  router.push('/perfil')
}

const cerrarDrawerMobile = () => {
  if (mobile.value) {
    drawerOpen.value = false
  }
}

const verificarAlertas = async () => {
  if (!authStore.isAuthenticated) {
    return
  }

  try {
    const { data } = await api.get('/zonas')

    if (!data.ok) {
      return
    }

    for (const zona of data.data) {
      const meteo = await api.get(`/tinker/ultimo-estado/${zona.id}`)

      if (!meteo.data.ok || !meteo.data.data.meteorologia) {
        continue
      }

      const m = meteo.data.data.meteorologia

      if ((m.probabilidad_lluvia ?? 0) > 60) {
        notifStore.agregar({
          tipo: 'warning',
          titulo: `Alerta de lluvia — ${zona.nombre}`,
          mensaje:
            `Probabilidad de lluvia: ${m.probabilidad_lluvia}%. ` +
            'Considere cerrar los galpones.',
        })
      }

      if (Number(m.velocidad_viento ?? 0) > 40) {
        notifStore.agregar({
          tipo: 'warning',
          titulo: `Viento fuerte — ${zona.nombre}`,
          mensaje:
            `Velocidad del viento: ${m.velocidad_viento} km/h. ` +
            'Se recomienda cerrar los galpones.',
        })
      }
    }
  } catch (error) {
    console.error('Error verificando alertas:', error)
  }
}

const cargarAvatar = async () => {
  try {
    const { data } = await api.get('/auth/me')

    if (data.ok && data.data.avatar_url) {
      avatarUrl.value = data.data.avatar_url
    }
  } catch (error) {
    console.error('Error cargando avatar:', error)
  }
}

const logout = () => {
  confirmarLogout.value = false
  panelNotif.value = false

  authStore.logout()

  router.push('/login')
}

watch(mobile, (isMobile) => {
  drawerOpen.value = !isMobile
})

onMounted(async () => {
  theme.global.name.value = temaStore.oscuro ? 'dark' : 'light'

  await authStore.cargarUsuario()

  await cargarAvatar()

  await verificarAlertas()

  intervaloNotif = setInterval(verificarAlertas, 60000)

  conectar()
})

onUnmounted(() => {
  if (intervaloNotif) {
    clearInterval(intervaloNotif)
  }
})
</script>

<style scoped>
.app-header {
  backdrop-filter: blur(12px);
}

.desktop-brand {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 18px;
}

.brand-logo-wrapper {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: rgba(var(--v-theme-primary), 0.08);
}

.brand-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.brand-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-info__top {
  display: flex;
  align-items: center;
  gap: 9px;
}

.brand-name {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-primary));
}

.brand-divider {
  width: 1px;
  height: 15px;
  background: rgba(var(--v-theme-on-surface), 0.18);
}

.brand-system {
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.brand-description {
  margin-top: 2px;
  font-size: 0.62rem;
  line-height: 1.2;
  color: rgba(var(--v-theme-on-surface), 0.42);
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-brand__text {
  display: flex;
  flex-direction: column;
}

.mobile-brand__text .brand-system {
  font-size: 0.6rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 3px;
}

.desktop-actions {
  padding-right: 18px;
}

.header-action-btn {
  border-radius: 10px;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.header-action-btn:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.07);
}

.header-separator {
  width: 1px;
  height: 30px;
  margin: 0 7px;
  background: rgba(var(--v-theme-on-surface), 0.12);
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 154px;
  padding: 5px 8px 5px 5px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.profile-trigger:hover {
  background: rgba(var(--v-theme-primary), 0.065);
}

.profile-avatar {
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px rgb(var(--v-theme-surface)),
    0 0 0 3px rgba(var(--v-theme-primary), 0.18);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-primary));
}

.avatar-initials--large {
  font-size: 0.82rem;
}

.profile-trigger__text {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.profile-name {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.25;
}

.profile-role {
  margin-top: 1px;
  font-size: 0.62rem;
  line-height: 1.2;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.profile-chevron {
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.profile-menu {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.profile-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
}

.profile-menu__identity {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
}

.profile-menu__identity strong {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.84rem;
  font-weight: 700;
}

.profile-menu__identity > span {
  width: 100%;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.profile-role-chip {
  font-weight: 600;
}

.profile-menu__list {
  padding: 7px;
}

.logout-item {
  color: rgb(var(--v-theme-error));
}

.mobile-profile-btn {
  margin-left: 2px;
}

.app-sidebar {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.sidebar-brand {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.sidebar-brand__expanded {
  width: 100%;
  display: flex;
  align-items: center;
}

.sidebar-brand__collapsed {
  width: 100%;
  display: flex;
  justify-content: center;
}

.sidebar-logo {
  max-width: 125px;
  height: 34px;
  object-fit: contain;
}

.sidebar-logo-icon {
  width: 29px;
  height: 29px;
  object-fit: contain;
}

.sidebar-navigation {
  padding: 10px 8px;
}

.sidebar-navigation :deep(.v-list-item) {
  min-height: 46px;
  margin-bottom: 4px;
}

.sidebar-navigation :deep(.v-list-item--active) {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.notifications-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.notifications-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.notifications-header span {
  display: block;
  margin-top: 2px;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.notifications-list {
  padding: 8px;
}

.notification-item {
  margin-bottom: 5px;
  border: 1px solid transparent;
}

.notification-item--unread {
  background: rgba(var(--v-theme-primary), 0.055);
  border-color: rgba(var(--v-theme-primary), 0.1);
}

.notification-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.notification-icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.notification-icon--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.1);
}

.notification-icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}

.notification-icon--info {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.notification-title {
  font-size: 0.78rem;
  font-weight: 600;
}

.notification-message {
  margin-top: 2px;
  font-size: 0.68rem;
}

.notification-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  align-self: flex-start;
  gap: 2px;
}

.notification-meta span {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.notifications-empty {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

.notifications-empty__icon {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.07);
}

.notifications-empty h4 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
}

.notifications-empty p {
  margin: 5px 0 0;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.logout-dialog {
  padding-top: 24px;
  text-align: center;
}

.logout-dialog__icon {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  border-radius: 50%;
  background: rgba(var(--v-theme-error), 0.09);
}

.logout-dialog__title {
  justify-content: center;
  padding-bottom: 5px;
  font-size: 1.05rem;
  font-weight: 700;
}

.logout-dialog__text {
  padding-top: 2px;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.logout-dialog__actions {
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px 18px;
}

@media (max-width: 600px) {
  .mobile-brand__text {
    display: none;
  }
}
</style>
