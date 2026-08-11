<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-3" align="center">
      <v-col>
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          to="/dashboard"
          class="mb-1 px-0"
          size="small"
        >
          Volver
        </v-btn>
        <h1 class="text-h5 font-weight-bold text-primary">{{ zonaActual?.nombre ?? 'Zona' }}</h1>
        <p class="text-body-2 text-medium-emphasis">Control individual de invernaderos</p>
      </v-col>
      <v-col cols="auto" class="d-flex gap-2">
        <v-btn
          color="success"
          variant="tonal"
          :size="mobile ? 'small' : 'default'"
          prepend-icon="mdi-arrow-up-circle"
          disabled
          @click="abrirTodo"
        >
          {{ mobile ? 'Abrir' : 'Abrir todo' }}
        </v-btn>
        <v-btn
          color="error"
          variant="tonal"
          :size="mobile ? 'small' : 'default'"
          prepend-icon="mdi-arrow-down-circle"
          disabled
          @click="cerrarTodo"
        >
          {{ mobile ? 'Cerrar' : 'Cerrar todo' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Invernaderos -->
    <v-row>
      <v-col v-for="inv in invernaderos" :key="inv.id" cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <v-icon :color="colorEstado(inv.estado)" size="20">mdi-greenhouse</v-icon>
                <span class="text-body-2 font-weight-medium">{{ inv.nombre }}</span>
              </div>
              <v-chip :color="colorEstado(inv.estado)" size="x-small">
                {{ inv.estado }}
              </v-chip>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2 text-medium-emphasis">Modo</span>
              <v-select
                :model-value="inv.modo"
                :items="modos"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 140px"
                @update:model-value="(val) => cambiarModo(inv.id, val)"
              />
            </div>
          </v-card-text>

          <v-card-actions class="pa-3 pt-0 d-flex gap-1">
            <v-btn
              color="success"
              variant="tonal"
              :size="mobile ? 'small' : 'default'"
              prepend-icon="mdi-arrow-up-circle"
              :disabled="inv.modo === 'local'"
              @click="enviarComando(inv.id, 'abrir')"
              style="flex: 1"
            >
              Abrir
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              :size="mobile ? 'small' : 'default'"
              prepend-icon="mdi-arrow-down-circle"
              :disabled="inv.modo === 'local'"
              @click="enviarComando(inv.id, 'cerrar')"
              style="flex: 1"
            >
              Cerrar
            </v-btn>
            <v-btn
              color="warning"
              variant="tonal"
              :size="mobile ? 'small' : 'default'"
              icon="mdi-stop-circle"
              :disabled="inv.modo === 'local'"
              @click="enviarComando(inv.id, 'detener')"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000">
      {{ snackbar.mensaje }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useInvernaderosStore()
const { zonas } = storeToRefs(store)
const { mobile } = useDisplay()

const zona_id = computed(() => Number(route.params.id))
const zonaActual = computed(() => zonas.value.find((z) => z.id === zona_id.value))
const invernaderos = computed(() => zonaActual.value?.invernaderos ?? [])

const modos = ['local', 'remoto', 'automatico']

const snackbar = reactive({ visible: false, mensaje: '', color: 'success' })

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.visible = true
}

const colorEstado = (estado: string) => {
  if (estado === 'abierto') return 'success'
  if (estado === 'en_movimiento') return 'warning'
  return 'error'
}

const enviarComando = async (invernadero_id: number, accion: 'abrir' | 'cerrar' | 'detener') => {
  const res = await store.enviarComando(invernadero_id, accion)
  if (res.ok) {
    mostrarSnackbar(`Comando '${accion}' enviado correctamente`)
    await store.cargarEstadoZona(zona_id.value)
  } else {
    mostrarSnackbar(res.mensaje ?? 'Error enviando comando', 'error')
  }
}

const cambiarModo = async (invernadero_id: number, modo: 'local' | 'remoto' | 'automatico') => {
  const res = await store.cambiarModo(invernadero_id, modo)
  if (res.ok) {
    mostrarSnackbar(`Modo cambiado a '${modo}'`)
    await store.cargarEstadoZona(zona_id.value)
  } else {
    mostrarSnackbar('Error cambiando modo', 'error')
  }
}

const abrirTodo = async () => {
  const res = await store.enviarComandoZona(zona_id.value, 'abrir')
  mostrarSnackbar(
    res.ok ? 'Abriendo todos los invernaderos' : 'Error',
    res.ok ? 'success' : 'error',
  )
  await store.cargarEstadoZona(zona_id.value)
}

const cerrarTodo = async () => {
  const res = await store.enviarComandoZona(zona_id.value, 'cerrar')
  mostrarSnackbar(
    res.ok ? 'Cerrando todos los invernaderos' : 'Error',
    res.ok ? 'success' : 'error',
  )
  await store.cargarEstadoZona(zona_id.value)
}

onMounted(async () => {
  await store.cargarEstadoZona(zona_id.value)
})
</script>
