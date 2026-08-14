<template>
  <v-app>
    <!-- HEADER MÓVIL -->
    <v-app-bar v-if="mobile" flat color="white" border="b" elevation="1">
      <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen" />
      <v-app-bar-title>
        <img src="/logo_malima.png" height="28" style="vertical-align: middle; margin-top: 4px" />
      </v-app-bar-title>
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
      <!-- Logo -->
      <div class="d-flex align-center justify-center px-3 py-3">
        <img
          v-if="hovered || mobile"
          src="/logo_malima.png"
          height="40"
          style="object-fit: contain"
        />
        <img v-else src="/logo_malima_icono.png" height="32" style="object-fit: contain" />
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

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const { mobile } = useDisplay()

const hovered = ref(false)
const drawerOpen = ref(!mobile.value)

watch(mobile, (isMobile) => {
  drawerOpen.value = !isMobile
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await authStore.cargarUsuario()
})
</script>
