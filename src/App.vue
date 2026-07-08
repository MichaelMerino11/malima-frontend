<template>
  <v-app>
    <v-navigation-drawer v-if="authStore.isAuthenticated" permanent>
      <v-list-item
        title="Grupo Malima"
        subtitle="Sistema de Invernaderos"
        prepend-icon="mdi-leaf"
        class="py-4"
      />
      <v-divider />
      <v-list nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard" />
        <v-list-item
          prepend-icon="mdi-weather-partly-cloudy"
          title="Meteorología"
          to="/meteorologia"
        />
      </v-list>
      <v-list-item
        v-if="authStore.isAdmin"
        prepend-icon="mdi-cog"
        title="Configuración"
        to="/configuracion"
      />
      <template #append>
        <v-divider />
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar sesión"
          :subtitle="authStore.usuario?.nombre"
          @click="logout"
          class="py-3"
        />
        <v-list-item
          prepend-icon="mdi-alpha-m-box"
          title="Maintronic"
          subtitle="v1.0.0"
          class="py-3"
        />
      </template>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  authStore.cargarUsuario()
})
</script>
