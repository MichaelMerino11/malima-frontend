<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis">Control general de invernaderos</p>
      </v-col>
    </v-row>

    <!-- Tarjetas de zonas -->
    <v-row>
      <v-col v-for="zona in zonas" :key="zona.id" cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center gap-2">
              <v-icon color="primary">mdi-greenhouse</v-icon>
              <span>{{ zona.nombre }}</span>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-arrow-up-circle"
                @click="abrirZona(zona.id)"
              >
                Abrir todo
              </v-btn>
              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-arrow-down-circle"
                @click="cerrarZona(zona.id)"
              >
                Cerrar todo
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <v-row dense>
              <v-col v-for="inv in zona.invernaderos ?? []" :key="inv.id" cols="6" sm="4">
                <v-card
                  rounded="lg"
                  :color="colorEstado(inv.estado)"
                  variant="tonal"
                  class="pa-2 text-center"
                  :to="`/zona/${zona.id}`"
                  hover
                >
                  <v-icon size="28">{{ iconoEstado(inv.estado) }}</v-icon>
                  <p class="text-caption font-weight-medium mt-1">{{ inv.nombre }}</p>
                  <v-chip size="x-small" :color="colorEstado(inv.estado)" class="mt-1">
                    {{ inv.estado }}
                  </v-chip>
                </v-card>
              </v-col>

              <!-- Placeholder si no hay invernaderos cargados -->
              <v-col v-if="!zona.invernaderos?.length" cols="12">
                <p class="text-body-2 text-medium-emphasis text-center py-4">
                  <v-icon>mdi-loading</v-icon> Cargando invernaderos...
                </p>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              :to="`/zona/${zona.id}`"
              append-icon="mdi-arrow-right"
            >
              Ver detalle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'

const store = useInvernaderosStore()
const { zonas } = storeToRefs(store)

const colorEstado = (estado: string) => {
  if (estado === 'abierto') return 'success'
  if (estado === 'en_movimiento') return 'warning'
  return 'error'
}

const iconoEstado = (estado: string) => {
  if (estado === 'abierto') return 'mdi-arrow-up-circle'
  if (estado === 'en_movimiento') return 'mdi-loading'
  return 'mdi-arrow-down-circle'
}

const abrirZona = async (zona_id: number) => {
  await store.enviarComandoZona(zona_id, 'abrir')
  await store.cargarEstadoZona(zona_id)
}

const cerrarZona = async (zona_id: number) => {
  await store.enviarComandoZona(zona_id, 'cerrar')
  await store.cargarEstadoZona(zona_id)
}

onMounted(async () => {
  await store.cargarZonas()
  for (const zona of zonas.value) {
    await store.cargarEstadoZona(zona.id)
  }
})
</script>
