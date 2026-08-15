<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" class="text-center">
            <img
              src="/logo_malima_icono.png"
              height="80"
              style="object-fit: contain"
              class="mb-4 pulsing"
            />

            <h1 class="text-h1 font-weight-bold text-primary mb-2">404</h1>
            <h2 class="text-h5 font-weight-bold mb-3">Página no encontrada</h2>
            <p class="text-body-2 text-medium-emphasis mb-6">
              La página que buscas no existe o fue movida.
            </p>

            <div class="d-flex gap-3 justify-center">
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-home" to="/home">
                Ir al inicio
              </v-btn>
              <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="router.back()">
                Volver atrás
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
