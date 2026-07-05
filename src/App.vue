<template>
  <v-app>
    <v-navigation-drawer permanent>
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
      <template #append>
        <v-divider />
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
import { RouterView } from 'vue-router'
</script>
