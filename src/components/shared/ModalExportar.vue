<template>
  <v-dialog v-model="visible" max-width="500" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center gap-2 pa-4">
        <v-icon color="primary">mdi-export</v-icon>
        <span class="text-body-1 font-weight-bold">Exportar datos</span>
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="visible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <!-- Rango de fechas -->
        <p class="text-body-2 font-weight-medium mb-2">Rango de fechas</p>
        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-menu v-model="menuDesde" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="filtros.fechaDesde"
                  label="Desde"
                  variant="outlined"
                  density="compact"
                  hide-details
                  readonly
                  prepend-inner-icon="mdi-calendar"
                  clearable
                  @click:clear="filtros.fechaDesde = ''"
                />
              </template>
              <v-date-picker
                v-model="fechaDesdeObj"
                hide-header
                @update:model-value="menuDesde = false"
              />
            </v-menu>
          </v-col>
          <v-col cols="6">
            <v-menu v-model="menuHasta" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="filtros.fechaHasta"
                  label="Hasta"
                  variant="outlined"
                  density="compact"
                  hide-details
                  readonly
                  prepend-inner-icon="mdi-calendar"
                  clearable
                  @click:clear="filtros.fechaHasta = ''"
                />
              </template>
              <v-date-picker
                v-model="fechaHastaObj"
                hide-header
                @update:model-value="menuHasta = false"
              />
            </v-menu>
          </v-col>
        </v-row>

        <!-- Filtros específicos según tipo -->
        <template v-if="tipo === 'eventos'">
          <p class="text-body-2 font-weight-medium mb-2">Filtros</p>
          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-select
                v-model="filtros.accion"
                :items="['Todos', 'abrir', 'cerrar', 'detener']"
                label="Acción"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="filtros.resultado"
                :items="['Todos', 'exitoso', 'fallido', 'pendiente']"
                label="Resultado"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-select
                v-model="filtros.modo"
                :items="['Todos', 'remoto', 'automatico', 'local']"
                label="Modo"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </template>

        <template v-if="tipo === 'meteorologia'">
          <p class="text-body-2 font-weight-medium mb-2">Rango de valores</p>
          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-text-field
                v-model="filtros.tempMin"
                label="Temp. mínima (°C)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="filtros.tempMax"
                label="Temp. máxima (°C)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-text-field
                v-model="filtros.lluviaMin"
                label="Prob. lluvia mín. (%)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="filtros.lluviaMax"
                label="Prob. lluvia máx. (%)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </template>

        <!-- Columnas a incluir -->
        <p class="text-body-2 font-weight-medium mb-2">Columnas a incluir</p>
        <v-row dense>
          <v-col v-for="col in columnasDisponibles" :key="col.key" cols="6">
            <v-checkbox
              v-model="filtros.columnas"
              :label="col.label"
              :value="col.key"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 d-flex gap-2">
        <v-spacer />
        <v-btn variant="text" @click="visible = false">Cancelar</v-btn>
        <v-btn
          color="success"
          variant="tonal"
          prepend-icon="mdi-microsoft-excel"
          @click="exportar('excel')"
        >
          Excel
        </v-btn>
        <v-btn
          color="error"
          variant="tonal"
          prepend-icon="mdi-file-pdf-box"
          @click="exportar('pdf')"
        >
          PDF
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useExportar } from '../../composables/useExportar'
const menuDesde = ref(false)
const menuHasta = ref(false)

const fechaDesdeObj = ref<Date | null>(null)
const fechaHastaObj = ref<Date | null>(null)

const props = defineProps<{
  modelValue: boolean
  tipo: 'eventos' | 'meteorologia'
  datos: any[]
}>()

const emit = defineEmits(['update:modelValue'])
const { exportarExcel, exportarPDF } = useExportar()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const columnasEventos = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'invernadero_nombre', label: 'Invernadero' },
  { key: 'zona_nombre', label: 'Zona' },
  { key: 'accion', label: 'Acción' },
  { key: 'modo_origen', label: 'Modo' },
  { key: 'resultado', label: 'Resultado' },
  { key: 'usuario_nombre', label: 'Usuario' },
  { key: 'detalle', label: 'Detalle' },
]

const columnasMeteo = [
  { key: 'registrado_at', label: 'Fecha' },
  { key: 'temperatura', label: 'Temperatura' },
  { key: 'humedad', label: 'Humedad' },
  { key: 'velocidad_viento', label: 'Viento' },
  { key: 'radiacion_solar', label: 'Radiación solar' },
  { key: 'probabilidad_lluvia', label: 'Prob. lluvia' },
]

const columnasDisponibles = computed(() =>
  props.tipo === 'eventos' ? columnasEventos : columnasMeteo,
)

const filtros = ref({
  fechaDesde: '',
  fechaHasta: '',
  accion: 'Todos',
  resultado: 'Todos',
  modo: 'Todos',
  tempMin: '',
  tempMax: '',
  lluviaMin: '',
  lluviaMax: '',
  columnas: columnasDisponibles.value.map((c) => c.key),
})

watch(
  () => props.tipo,
  () => {
    filtros.value.columnas = columnasDisponibles.value.map((c) => c.key)
  },
)

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

const datosFiltrados = computed(() => {
  let result = [...props.datos]

  // Filtro por fecha
  if (filtros.value.fechaDesde) {
    const desde = new Date(filtros.value.fechaDesde)
    result = result.filter((d) => {
      const fecha = new Date(d.created_at ?? d.registrado_at)
      return fecha >= desde
    })
  }
  if (filtros.value.fechaHasta) {
    const hasta = new Date(filtros.value.fechaHasta)
    hasta.setHours(23, 59, 59)
    result = result.filter((d) => {
      const fecha = new Date(d.created_at ?? d.registrado_at)
      return fecha <= hasta
    })
  }

  // Filtros de eventos
  if (props.tipo === 'eventos') {
    if (filtros.value.accion !== 'Todos')
      result = result.filter((d) => d.accion === filtros.value.accion)
    if (filtros.value.resultado !== 'Todos')
      result = result.filter((d) => d.resultado === filtros.value.resultado)
    if (filtros.value.modo !== 'Todos')
      result = result.filter((d) => d.modo_origen === filtros.value.modo)
  }

  // Filtros de meteorología
  if (props.tipo === 'meteorologia') {
    if (filtros.value.tempMin !== '')
      result = result.filter((d) => d.temperatura >= Number(filtros.value.tempMin))
    if (filtros.value.tempMax !== '')
      result = result.filter((d) => d.temperatura <= Number(filtros.value.tempMax))
    if (filtros.value.lluviaMin !== '')
      result = result.filter((d) => (d.probabilidad_lluvia ?? 0) >= Number(filtros.value.lluviaMin))
    if (filtros.value.lluviaMax !== '')
      result = result.filter((d) => (d.probabilidad_lluvia ?? 0) <= Number(filtros.value.lluviaMax))
  }

  return result
})

const mapearFila = (d: any): Record<string, any> => {
  if (props.tipo === 'eventos') {
    return {
      fecha: formatFecha(d.created_at),
      invernadero_nombre: d.invernadero_nombre ?? '—',
      zona_nombre: d.zona_nombre ?? '—',
      accion: d.accion,
      modo_origen: d.modo_origen,
      resultado: d.resultado,
      usuario_nombre: d.usuario_nombre ?? 'Sistema',
      detalle: d.detalle ?? '—',
    }
  } else {
    return {
      registrado_at: formatFecha(d.registrado_at),
      temperatura: d.temperatura,
      humedad: d.humedad,
      velocidad_viento: d.velocidad_viento,
      radiacion_solar: d.radiacion_solar,
      probabilidad_lluvia: d.probabilidad_lluvia ?? 0,
    }
  }
}

const exportar = (formato: 'excel' | 'pdf') => {
  const cols = filtros.value.columnas
  const colsInfo = columnasDisponibles.value.filter((c) => cols.includes(c.key))
  const nombre = props.tipo === 'eventos' ? 'historial-eventos-malima' : 'meteorologia-malima'
  const titulo = props.tipo === 'eventos' ? 'Historial de Eventos' : 'Datos Meteorológicos'

  const filas = datosFiltrados.value.map((d) => {
    const fila = mapearFila(d)
    return colsInfo.reduce(
      (acc, col) => {
        acc[col.label] = fila[col.key] ?? '—'
        return acc
      },
      {} as Record<string, any>,
    )
  })

  if (formato === 'excel') {
    exportarExcel(filas, nombre, titulo)
  } else {
    const headers = colsInfo.map((c) => c.label)
    const rows = filas.map((f) => headers.map((h) => f[h] ?? '—'))
    exportarPDF(titulo, headers, rows, nombre)
  }

  visible.value = false
}

watch(fechaDesdeObj, (val) => {
  if (val) {
    filtros.value.fechaDesde = val.toISOString().split('T')[0] ?? ''
  }
})

watch(fechaHastaObj, (val) => {
  if (val) {
    filtros.value.fechaHasta = val.toISOString().split('T')[0] ?? ''
  }
})
</script>
