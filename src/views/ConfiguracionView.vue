<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Configuración</h1>
        <p class="text-body-2 text-medium-emphasis">Parámetros de conexión del sistema</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center gap-2 pa-1">
            <v-icon color="primary">mdi-cog</v-icon>
            <span class="text-body-1 font-weight-bold">Parámetros TinkerBoard</span>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <v-row>
              <v-col v-for="config in configuraciones" :key="config.clave" cols="12" md="6">
                <p class="text-body-2 font-weight-medium mb-1">{{ config.descripcion }}</p>
                <p class="text-caption text-medium-emphasis mb-2">{{ config.clave }}</p>
                <div class="d-flex align-center">
                  <v-text-field
                    v-model="config.valor"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="campo-config"
                  />

                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    icon="mdi-content-save"
                    :loading="guardando === config.clave"
                    @click="guardar(config.clave, config.valor)"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000">
      {{ snackbar.mensaje }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import api from '../api/axios'

interface Configuracion {
  id: number
  clave: string
  valor: string
  descripcion: string
}

const configuraciones = ref<Configuracion[]>([])
const guardando = ref<string | null>(null)
const snackbar = reactive({ visible: false, mensaje: '', color: 'success' })

const cargar = async () => {
  const { data } = await api.get('/configuracion')
  if (data.ok) configuraciones.value = data.data
}

const guardar = async (clave: string, valor: string) => {
  guardando.value = clave
  try {
    const { data } = await api.patch(`/configuracion/${clave}`, { valor })
    snackbar.mensaje = data.ok ? 'Guardado correctamente' : (data.mensaje ?? 'Error')
    snackbar.color = data.ok ? 'success' : 'error'
  } catch {
    snackbar.mensaje = 'Error guardando configuración'
    snackbar.color = 'error'
  } finally {
    guardando.value = null
    snackbar.visible = true
  }
}

onMounted(cargar)
</script>

<style scoped>
.campo-config {
  flex: 1;
  margin-right: 12px;
}
</style>
