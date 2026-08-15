<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis">Control general de invernaderos</p>
      </v-col>
      <v-col cols="auto">
        <v-chip
          :color="resumen.en_movimiento > 0 ? 'warning' : 'success'"
          variant="tonal"
          :prepend-icon="resumen.en_movimiento > 0 ? 'mdi-loading' : 'mdi-check-circle'"
        >
          {{
            resumen.en_movimiento > 0 ? `${resumen.en_movimiento} en movimiento` : 'Sistema estable'
          }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Tarjetas de resumen -->
    <v-row class="mb-4">
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="28" color="primary">mdi-greenhouse</v-icon>
          <p class="text-h5 font-weight-bold mt-1">{{ resumen.total }}</p>
          <p class="text-caption text-medium-emphasis">Total</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="28" color="success">mdi-arrow-up-circle</v-icon>
          <p class="text-h5 font-weight-bold mt-1 text-success">{{ resumen.abiertos }}</p>
          <p class="text-caption text-medium-emphasis">Abiertos</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="28" color="error">mdi-arrow-down-circle</v-icon>
          <p class="text-h5 font-weight-bold mt-1 text-error">{{ resumen.cerrados }}</p>
          <p class="text-caption text-medium-emphasis">Cerrados</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="28" color="warning" :class="resumen.en_movimiento > 0 ? 'rotating' : ''"
            >mdi-loading</v-icon
          >
          <p class="text-h5 font-weight-bold mt-1 text-warning">{{ resumen.en_movimiento }}</p>
          <p class="text-caption text-medium-emphasis">En movimiento</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="28" color="info">mdi-robot</v-icon>
          <p class="text-h5 font-weight-bold mt-1 text-info">{{ resumen.en_automatico }}</p>
          <p class="text-caption text-medium-emphasis">Automático</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="28" color="secondary">mdi-hand-back-right</v-icon>
          <p class="text-h5 font-weight-bold mt-1">{{ resumen.en_local }}</p>
          <p class="text-caption text-medium-emphasis">Local</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Zonas -->
    <v-row>
      <v-col v-for="zona in zonas" :key="zona.id" cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between flex-wrap gap-2">
              <div class="d-flex align-center gap-2">
                <v-icon color="primary">mdi-greenhouse</v-icon>
                <span class="text-body-1 font-weight-bold">{{ zona.nombre }}</span>
                <v-chip size="x-small" color="success" variant="tonal">
                  {{ zona.invernaderos?.filter((i) => i.estado === 'abierto').length ?? 0 }}
                  abiertos
                </v-chip>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  color="success"
                  variant="tonal"
                  prepend-icon="mdi-arrow-up-circle"
                  disabled
                  @click="abrirZona(zona.id)"
                >
                  <span v-if="!mobile">Abrir todo</span>
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="tonal"
                  prepend-icon="mdi-arrow-down-circle"
                  disabled
                  @click="cerrarZona(zona.id)"
                >
                  <span v-if="!mobile">Cerrar todo</span>
                </v-btn>
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-3">
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
                  <v-icon
                    :size="mobile ? 22 : 28"
                    :class="inv.estado === 'en_movimiento' ? 'rotating' : ''"
                  >
                    {{ iconoEstado(inv.estado) }}
                  </v-icon>
                  <p class="text-caption font-weight-medium mt-1 text-truncate">{{ inv.nombre }}</p>
                  <v-chip size="x-small" :color="colorEstado(inv.estado)" class="mt-1">
                    {{ inv.estado }}
                  </v-chip>
                </v-card>
              </v-col>

              <v-col v-if="!zona.invernaderos?.length" cols="12">
                <p class="text-body-2 text-medium-emphasis text-center py-4">
                  Cargando invernaderos...
                </p>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-3 pt-0">
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
import { onMounted, onUnmounted, reactive } from 'vue'
import { useDisplay } from 'vuetify'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'
import api from '../api/axios'
import { useLoadingStore } from '../stores/loading'
import { useSocket } from '../composables/useSocket'

const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()
const loadingStore = useLoadingStore()
const store = useInvernaderosStore()
const { zonas } = storeToRefs(store)
const { mobile } = useDisplay()

const resumen = reactive({
  total: 0,
  abiertos: 0,
  cerrados: 0,
  en_movimiento: 0,
  en_automatico: 0,
  en_remoto: 0,
  en_local: 0,
})

let intervalo: ReturnType<typeof setInterval>

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

const cargarResumen = async () => {
  try {
    const { data } = await api.get('/zonas/resumen')
    if (data.ok) Object.assign(resumen, data.data)
  } catch {}
}

const cargarTodo = async () => {
  await store.cargarZonas()
  for (const zona of zonas.value) {
    await store.cargarEstadoZona(zona.id)
  }
  await cargarResumen()
}

onMounted(async () => {
  loadingStore.mostrar('Cargando invernaderos...')
  await cargarTodo()
  loadingStore.ocultar()

  // Unirse a todas las zonas
  for (const zona of zonas.value) {
    unirseAZona(zona.id)
  }

  escuchar('estado-actualizado', async (data) => {
    await store.cargarEstadoZona(data.zona_id)
    await cargarResumen()
  })

  intervalo = setInterval(cargarTodo, 30000)
})

onUnmounted(() => {
  dejarDeEscuchar('estado-actualizado')
  clearInterval(intervalo)
})
</script>

<style scoped>
.rotating {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
