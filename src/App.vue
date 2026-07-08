import { ref, computed, watch, onMounted } from 'vue'

<template>
  <v-app>
    <!-- HEADER MÓVIL -->
    <v-app-bar v-if="mobile" flat color="white" border="b" elevation="1">
      <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen" />
      <v-app-bar-title>
        <img src="/logo_malima.png" height="32" style="vertical-align: middle" />
      </v-app-bar-title>
    </v-app-bar>

    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawerOpen"
      :rail="!mobile && railMode"
      :temporary="mobile"
      :permanent="!mobile"
    >
      <!-- Logo -->
      <div class="d-flex align-center justify-space-between px-3 py-3">
        <img v-if="!railMode" src="/logo_malima.png" height="40" style="object-fit: contain" />
        <img
          v-else
          src="/logo_malima_icono.png"
          height="32"
          style="object-fit: contain; margin: 0 auto"
        />
      </div>

      <v-divider />

      <v-list nav>
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
          v-if="authStore.isAdmin"
          prepend-icon="mdi-cog"
          title="Configuración"
          to="/configuracion"
          @click="mobile && (drawerOpen = false)"
        />
      </v-list>

      <template #append>
        <v-divider />
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar sesión"
          :subtitle="!railMode ? authStore.usuario?.nombre : undefined"
          class="py-3"
          @click="logout"
        />
      </template>
    </v-navigation-drawer>

    <!-- BOTÓN TOGGLE DESKTOP (flota sobre el contenido) -->
    <v-btn
      v-if="!mobile && authStore.isAuthenticated"
      :icon="railMode ? 'mdi-chevron-right' : 'mdi-chevron-left'"
      variant="elevated"
      color="white"
      size="x-small"
      elevation="3"
      style="
        position: fixed;
        top: 50%;
        left: v-bind(toggleLeft);
        transform: translateY(-50%);
        z-index: 1010;
        transition: left 0.2s;
      "
      @click="railMode = !railMode"
    />

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from './stores/auth'
import { ref, computed, watch, onMounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const { mobile } = useDisplay()

const railMode = ref(false)
const drawerOpen = ref(!mobile.value)

const toggleLeft = computed(() => (railMode.value ? '56px' : '256px'))

watch(mobile, (isMobile) => {
  drawerOpen.value = !isMobile
  if (isMobile) railMode.value = false
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
onMounted(async () => {
  await authStore.cargarUsuario()
})
</script>
