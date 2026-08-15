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
        <v-card rounded="lg" elevation="2" class="fade-in">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <v-icon
                  :color="colorEstado(inv.estado)"
                  size="20"
                  :class="inv.estado === 'en_movimiento' ? 'rotating' : ''"
                >
                  mdi-greenhouse
                </v-icon>
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
              @click="enviarComando(inv.id, 'abrir', inv.nombre)"
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
              @click="enviarComando(inv.id, 'cerrar', inv.nombre)"
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
              @click="enviarComando(inv.id, 'detener', inv.nombre)"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000">
      {{ snackbar.mensaje }}
    </v-snackbar>
  </v-container>
  <ModalConfirmar
    v-model="modalConfirmar.visible"
    :accion="modalConfirmar.accion"
    :nombre="modalConfirmar.nombre"
    @confirmar="ejecutarAccion"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'
import { useLoadingStore } from '../stores/loading'
import ModalConfirmar from '../components/shared/ModalConfirmar.vue'
import { useSocket } from '../composables/useSocket'

const loadingStore = useLoadingStore()
const route = useRoute()
const store = useInvernaderosStore()
const { zonas } = storeToRefs(store)
const { mobile } = useDisplay()
const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()

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

const enviarComando = (
  invernadero_id: number,
  accion: 'abrir' | 'cerrar' | 'detener',
  nombre: string,
) => {
  pedirConfirmacion(accion, nombre, async () => {
    const res = await store.enviarComando(invernadero_id, accion)
    if (res.ok) {
      mostrarSnackbar(`Comando '${accion}' enviado correctamente`)
      await store.cargarEstadoZona(zona_id.value)
    } else {
      mostrarSnackbar(res.mensaje ?? 'Error enviando comando', 'error')
    }
  })
}

const abrirTodo = () => {
  pedirConfirmacion('zona-abrir', zonaActual.value?.nombre ?? 'esta zona', async () => {
    const res = await store.enviarComandoZona(zona_id.value, 'abrir')
    mostrarSnackbar(
      res.ok ? 'Abriendo todos los invernaderos' : 'Error',
      res.ok ? 'success' : 'error',
    )
    await store.cargarEstadoZona(zona_id.value)
  })
}

const cerrarTodo = () => {
  pedirConfirmacion('zona-cerrar', zonaActual.value?.nombre ?? 'esta zona', async () => {
    const res = await store.enviarComandoZona(zona_id.value, 'cerrar')
    mostrarSnackbar(
      res.ok ? 'Cerrando todos los invernaderos' : 'Error',
      res.ok ? 'success' : 'error',
    )
    await store.cargarEstadoZona(zona_id.value)
  })
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

const modalConfirmar = reactive({
  visible: false,
  accion: 'abrir' as 'abrir' | 'cerrar' | 'detener' | 'zona-abrir' | 'zona-cerrar',
  nombre: '',
  callback: null as (() => Promise<void>) | null,
})

const pedirConfirmacion = (
  accion: typeof modalConfirmar.accion,
  nombre: string,
  callback: () => Promise<void>,
) => {
  modalConfirmar.accion = accion
  modalConfirmar.nombre = nombre
  modalConfirmar.callback = callback
  modalConfirmar.visible = true
}

const ejecutarAccion = async () => {
  if (modalConfirmar.callback) await modalConfirmar.callback()
}

onMounted(async () => {
  loadingStore.mostrar('Cargando zona...')

  if (zonas.value.length === 0) {
    await store.cargarZonas()
  }

  await store.cargarEstadoZona(zona_id.value)
  loadingStore.ocultar()

  unirseAZona(zona_id.value)

  escuchar('estado-actualizado', async () => {
    await store.cargarEstadoZona(zona_id.value)
  })

  escuchar('comando-enviado', (data) => {
    if (data.resultado === 'exitoso') {
      mostrarSnackbar('Invernadero actualizado', 'success')
    }
    store.cargarEstadoZona(zona_id.value)
  })
})

onUnmounted(() => {
  dejarDeEscuchar('estado-actualizado')
  dejarDeEscuchar('comando-enviado')
})
</script>
