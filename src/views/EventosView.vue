<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Historial de eventos</h1>
        <p class="text-body-2 text-medium-emphasis">
          Registro de todas las acciones realizadas en el sistema
        </p>
      </v-col>
      <v-col cols="auto" class="d-flex gap-2">
        <v-select
          v-model="filtros.zona_id"
          :items="zonaItems"
          item-title="nombre"
          item-value="id"
          label="Zona"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          style="min-width: 140px"
          @update:model-value="cargar"
        />
        <v-select
          v-model="filtros.resultado"
          :items="resultadoItems"
          label="Resultado"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          style="min-width: 140px"
          @update:model-value="filtrarLocal"
        />
      </v-col>
    </v-row>

    <!-- Resumen rápido -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="24" color="primary">mdi-format-list-bulleted</v-icon>
          <p class="text-h6 font-weight-bold mt-1">{{ eventos.length }}</p>
          <p class="text-caption text-medium-emphasis">Total eventos</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
          <p class="text-h6 font-weight-bold mt-1 text-success">
            {{ eventosFiltrados.filter((e) => e.resultado === 'exitoso').length }}
          </p>
          <p class="text-caption text-medium-emphasis">Exitosos</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="24" color="error">mdi-close-circle</v-icon>
          <p class="text-h6 font-weight-bold mt-1 text-error">
            {{ eventosFiltrados.filter((e) => e.resultado === 'fallido').length }}
          </p>
          <p class="text-caption text-medium-emphasis">Fallidos</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="2" class="pa-3 text-center">
          <v-icon size="24" color="warning">mdi-clock-outline</v-icon>
          <p class="text-h6 font-weight-bold mt-1 text-warning">
            {{ eventosFiltrados.filter((e) => e.resultado === 'pendiente').length }}
          </p>
          <p class="text-caption text-medium-emphasis">Pendientes</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de eventos -->
    <v-row>
      <v-col>
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center gap-2">
              <v-icon color="primary">mdi-history</v-icon>
              <span class="text-body-1 font-weight-bold">Eventos recientes</span>
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-export"
              @click="modalExportar = true"
            >
              Exportar
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-data-table
            :headers="headers"
            :items="eventosFiltrados"
            :loading="cargando"
            no-data-text="No hay eventos registrados"
            density="comfortable"
            :items-per-page="15"
          >
            <template #item.accion="{ item }">
              <v-chip
                size="small"
                :color="colorAccion(item.accion)"
                variant="tonal"
                :prepend-icon="iconoAccion(item.accion)"
              >
                {{ item.accion }}
              </v-chip>
            </template>
            <template #item.resultado="{ item }">
              <v-chip
                size="small"
                :color="colorResultado(item.resultado)"
                variant="tonal"
                :prepend-icon="iconoResultado(item.resultado)"
              >
                {{ item.resultado }}
              </v-chip>
            </template>
            <template #item.modo_origen="{ item }">
              <v-chip size="x-small" color="secondary" variant="tonal">
                {{ item.modo_origen }}
              </v-chip>
            </template>
            <template #item.usuario_nombre="{ item }">
              <span class="text-caption">{{ item.usuario_nombre ?? 'Sistema' }}</span>
            </template>

            <template #item.detalle="{ item }">
              <v-tooltip :text="item.detalle ?? '—'" location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="text-caption text-medium-emphasis"
                    style="
                      max-width: 200px;
                      display: block;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      cursor: pointer;
                    "
                  >
                    {{ item.detalle ?? '—' }}
                  </span>
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <ModalExportar v-model="modalExportar" tipo="eventos" :datos="eventosFiltrados" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'
import api from '../api/axios'
import { useExportar } from '../composables/useExportar'
import ModalExportar from '../components/shared/ModalExportar.vue'

const modalExportar = ref(false)
const invernaderosStore = useInvernaderosStore()
const { zonas } = storeToRefs(invernaderosStore)

const eventos = ref<any[]>([])
const cargando = ref(false)
const filtros = reactive({ zona_id: null as number | null, resultado: null as string | null })

const zonaItems = computed(() => zonas.value)
const resultadoItems = ['exitoso', 'fallido', 'pendiente']

const eventosFiltrados = computed(() => {
  const base = filtros.resultado
    ? eventos.value.filter((e) => e.resultado === filtros.resultado)
    : eventos.value

  return base.map((e) => ({
    ...e,
    fecha: formatFecha(e.created_at),
  }))
})
const { exportarExcel, exportarPDF } = useExportar()

const headers = [
  { title: 'Fecha', key: 'fecha', width: '160px' },
  { title: 'Invernadero', key: 'invernadero_nombre' },
  { title: 'Zona', key: 'zona_nombre' },
  { title: 'Acción', key: 'accion' },
  { title: 'Modo', key: 'modo_origen' },
  { title: 'Resultado', key: 'resultado' },
  { title: 'Usuario', key: 'usuario_nombre' },
  { title: 'Detalle', key: 'detalle' },
]

const colorAccion = (accion: string) => {
  if (accion === 'abrir') return 'success'
  if (accion === 'cerrar') return 'error'
  return 'warning'
}

const iconoAccion = (accion: string) => {
  if (accion === 'abrir') return 'mdi-arrow-up-circle'
  if (accion === 'cerrar') return 'mdi-arrow-down-circle'
  return 'mdi-stop-circle'
}

const colorResultado = (resultado: string) => {
  if (resultado === 'exitoso') return 'success'
  if (resultado === 'fallido') return 'error'
  return 'warning'
}

const iconoResultado = (resultado: string) => {
  if (resultado === 'exitoso') return 'mdi-check-circle'
  if (resultado === 'fallido') return 'mdi-close-circle'
  return 'mdi-clock-outline'
}

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const cargar = async () => {
  cargando.value = true
  try {
    const params = filtros.zona_id ? `?zona_id=${filtros.zona_id}` : ''
    const { data } = await api.get(`/zonas/eventos${params}`)
    if (data.ok) eventos.value = data.data
  } catch {
    eventos.value = []
  } finally {
    cargando.value = false
  }
}

const filtrarLocal = () => {}

onMounted(async () => {
  await invernaderosStore.cargarZonas()
  await cargar()
})
</script>
