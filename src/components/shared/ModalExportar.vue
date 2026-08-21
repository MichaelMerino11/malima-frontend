<template>
  <v-dialog v-model="visible" max-width="760" persistent scrollable>
    <v-card rounded="xl" elevation="12" class="export-dialog">
      <div class="dialog-header">
        <div class="dialog-header__main">
          <div class="dialog-header__icon">
            <v-icon size="24"> mdi-export-variant </v-icon>
          </div>

          <div>
            <div class="d-flex align-center flex-wrap ga-2">
              <h2>Exportar datos</h2>

              <v-chip color="primary" variant="tonal" size="small">
                <v-icon start size="14">
                  {{ iconoTipo }}
                </v-icon>

                {{ tituloTipo }}
              </v-chip>
            </div>

            <p>Configura los filtros y selecciona la información que deseas incluir.</p>
          </div>
        </div>

        <v-btn icon size="small" variant="text" @click="cerrar">
          <v-icon size="19"> mdi-close </v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="dialog-content">
        <div class="export-summary">
          <div class="export-summary__item">
            <div class="export-summary__icon">
              <v-icon size="19"> mdi-database-outline </v-icon>
            </div>

            <div>
              <span> Registros disponibles </span>

              <strong>
                {{ props.datos.length }}
              </strong>
            </div>
          </div>

          <div class="export-summary__divider" />

          <div class="export-summary__item">
            <div
              class="export-summary__icon"
              :class="{
                'export-summary__icon--success': datosFiltrados.length > 0,
              }"
            >
              <v-icon size="19"> mdi-filter-check-outline </v-icon>
            </div>

            <div>
              <span> Después de filtros </span>

              <strong>
                {{ datosFiltrados.length }}
              </strong>
            </div>
          </div>

          <div class="export-summary__divider" />

          <div class="export-summary__item">
            <div class="export-summary__icon">
              <v-icon size="19"> mdi-view-column-outline </v-icon>
            </div>

            <div>
              <span> Columnas seleccionadas </span>

              <strong>
                {{ filtros.columnas.length }}
              </strong>
            </div>
          </div>
        </div>

        <section class="export-section">
          <div class="section-header">
            <div class="section-header__main">
              <div class="section-icon">
                <v-icon size="19"> mdi-calendar-range-outline </v-icon>
              </div>

              <div>
                <h3>Rango de fechas</h3>

                <p>Limita la exportación a un período específico</p>
              </div>
            </div>

            <v-btn
              v-if="filtros.fechaDesde || filtros.fechaHasta"
              variant="text"
              color="primary"
              size="small"
              @click="limpiarFechas"
            >
              Limpiar
            </v-btn>
          </div>

          <div class="date-grid">
            <v-menu v-model="menuDesde" :close-on-content-click="false" location="bottom">
              <template #activator="{ props: menuProps }">
                <v-text-field
                  v-bind="menuProps"
                  :model-value="fechaDesdeMostrar"
                  label="Desde"
                  placeholder="Seleccionar fecha"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  readonly
                  clearable
                  prepend-inner-icon="mdi-calendar-start-outline"
                  class="export-field"
                  @click:clear.stop="limpiarFechaDesde"
                />
              </template>

              <v-date-picker
                v-model="fechaDesdeObj"
                hide-header
                color="primary"
                @update:model-value="menuDesde = false"
              />
            </v-menu>

            <div class="date-separator">
              <v-icon size="18"> mdi-arrow-right </v-icon>
            </div>

            <v-menu v-model="menuHasta" :close-on-content-click="false" location="bottom">
              <template #activator="{ props: menuProps }">
                <v-text-field
                  v-bind="menuProps"
                  :model-value="fechaHastaMostrar"
                  label="Hasta"
                  placeholder="Seleccionar fecha"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  readonly
                  clearable
                  prepend-inner-icon="mdi-calendar-end-outline"
                  class="export-field"
                  @click:clear.stop="limpiarFechaHasta"
                />
              </template>

              <v-date-picker
                v-model="fechaHastaObj"
                hide-header
                color="primary"
                :min="fechaDesdeObj ?? undefined"
                @update:model-value="menuHasta = false"
              />
            </v-menu>
          </div>

          <div v-if="errorFechas" class="filter-warning">
            <v-icon size="17" color="error"> mdi-alert-circle-outline </v-icon>

            <span> La fecha final no puede ser anterior a la fecha inicial. </span>
          </div>
        </section>

        <section v-if="tipo === 'eventos'" class="export-section">
          <div class="section-header">
            <div class="section-header__main">
              <div class="section-icon">
                <v-icon size="19"> mdi-filter-outline </v-icon>
              </div>

              <div>
                <h3>Filtros de eventos</h3>

                <p>Selecciona qué acciones deseas incluir</p>
              </div>
            </div>
          </div>

          <div class="filters-grid filters-grid--three">
            <v-select
              v-model="filtros.accion"
              :items="accionItems"
              item-title="title"
              item-value="value"
              label="Acción"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              prepend-inner-icon="mdi-lightning-bolt-outline"
              class="export-field"
            />

            <v-select
              v-model="filtros.resultado"
              :items="resultadoItems"
              item-title="title"
              item-value="value"
              label="Resultado"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              prepend-inner-icon="mdi-check-decagram-outline"
              class="export-field"
            />

            <v-select
              v-model="filtros.modo"
              :items="modoItems"
              item-title="title"
              item-value="value"
              label="Modo"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              prepend-inner-icon="mdi-tune-variant"
              class="export-field"
            />
          </div>
        </section>

        <section v-if="tipo === 'meteorologia'" class="export-section">
          <div class="section-header">
            <div class="section-header__main">
              <div class="section-icon">
                <v-icon size="19"> mdi-chart-box-outline </v-icon>
              </div>

              <div>
                <h3>Rango de valores</h3>

                <p>Filtra las mediciones antes de generar el archivo</p>
              </div>
            </div>
          </div>

          <div class="range-group">
            <div class="range-group__label">
              <div class="range-group__icon">
                <v-icon size="17"> mdi-thermometer </v-icon>
              </div>

              <span> Temperatura </span>
            </div>

            <div class="range-fields">
              <v-text-field
                v-model="filtros.tempMin"
                label="Mínima"
                type="number"
                suffix="°C"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                class="export-field"
              />

              <span> a </span>

              <v-text-field
                v-model="filtros.tempMax"
                label="Máxima"
                type="number"
                suffix="°C"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                class="export-field"
              />
            </div>
          </div>

          <div class="range-group">
            <div class="range-group__label">
              <div class="range-group__icon range-group__icon--info">
                <v-icon size="17"> mdi-weather-rainy </v-icon>
              </div>

              <span> Probabilidad de lluvia </span>
            </div>

            <div class="range-fields">
              <v-text-field
                v-model="filtros.lluviaMin"
                label="Mínima"
                type="number"
                suffix="%"
                min="0"
                max="100"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                class="export-field"
              />

              <span> a </span>

              <v-text-field
                v-model="filtros.lluviaMax"
                label="Máxima"
                type="number"
                suffix="%"
                min="0"
                max="100"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                class="export-field"
              />
            </div>
          </div>
        </section>

        <section class="export-section export-section--columns">
          <div class="section-header">
            <div class="section-header__main">
              <div class="section-icon">
                <v-icon size="19"> mdi-view-column-outline </v-icon>
              </div>

              <div>
                <h3>Columnas a incluir</h3>

                <p>Elige la información que aparecerá en el archivo</p>
              </div>
            </div>

            <div class="columns-actions">
              <v-btn variant="text" color="primary" size="small" @click="seleccionarTodasColumnas">
                Todas
              </v-btn>

              <v-btn variant="text" size="small" @click="limpiarColumnas"> Ninguna </v-btn>
            </div>
          </div>

          <div class="columns-grid">
            <label
              v-for="col in columnasDisponibles"
              :key="col.key"
              class="column-option"
              :class="{
                'column-option--selected': filtros.columnas.includes(col.key),
              }"
            >
              <v-checkbox
                v-model="filtros.columnas"
                :value="col.key"
                density="compact"
                hide-details
                color="primary"
              />

              <div class="column-option__content">
                <div class="column-option__icon">
                  <v-icon size="17">
                    {{ iconoColumna(col.key) }}
                  </v-icon>
                </div>

                <span>
                  {{ col.label }}
                </span>
              </div>
            </label>
          </div>
        </section>

        <div v-if="datosFiltrados.length === 0" class="empty-export">
          <div class="empty-export__icon">
            <v-icon size="23"> mdi-filter-off-outline </v-icon>
          </div>

          <div>
            <strong> No hay registros para exportar </strong>

            <span> Modifica los filtros seleccionados para obtener resultados. </span>
          </div>
        </div>

        <div v-else-if="filtros.columnas.length === 0" class="empty-export">
          <div class="empty-export__icon">
            <v-icon size="23"> mdi-view-column-outline </v-icon>
          </div>

          <div>
            <strong> Selecciona al menos una columna </strong>

            <span> El archivo necesita al menos un campo para poder generarse. </span>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <div class="dialog-footer">
        <div class="export-result">
          <span
            class="export-result__dot"
            :class="{
              'export-result__dot--ready': puedeExportar,
            }"
          />

          <div>
            <strong>
              {{
                puedeExportar
                  ? `${datosFiltrados.length} registros listos`
                  : 'Exportación pendiente'
              }}
            </strong>

            <span>
              {{
                puedeExportar
                  ? `${filtros.columnas.length} columnas seleccionadas`
                  : 'Revisa los filtros y columnas'
              }}
            </span>
          </div>
        </div>

        <div class="dialog-footer__actions">
          <v-btn variant="text" rounded="lg" @click="cerrar"> Cancelar </v-btn>

          <v-btn
            color="success"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-microsoft-excel"
            :disabled="!puedeExportar"
            @click="exportar('excel')"
          >
            Excel
          </v-btn>

          <v-btn
            color="error"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-file-pdf-box"
            :disabled="!puedeExportar"
            @click="exportar('pdf')"
          >
            PDF
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useExportar } from '../../composables/useExportar'

interface ColumnaExportacion {
  key: string
  label: string
}

const props = defineProps<{
  modelValue: boolean
  tipo: 'eventos' | 'meteorologia'
  datos: any[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { exportarExcel, exportarPDF } = useExportar()

const menuDesde = ref(false)
const menuHasta = ref(false)

const fechaDesdeObj = ref<Date | null>(null)

const fechaHastaObj = ref<Date | null>(null)

const visible = computed({
  get: () => props.modelValue,

  set: (valor: boolean) => {
    emit('update:modelValue', valor)
  },
})

const columnasEventos: ColumnaExportacion[] = [
  {
    key: 'fecha',
    label: 'Fecha',
  },
  {
    key: 'invernadero_nombre',
    label: 'Invernadero',
  },
  {
    key: 'zona_nombre',
    label: 'Zona',
  },
  {
    key: 'accion',
    label: 'Acción',
  },
  {
    key: 'modo_origen',
    label: 'Modo',
  },
  {
    key: 'resultado',
    label: 'Resultado',
  },
  {
    key: 'usuario_nombre',
    label: 'Usuario',
  },
  {
    key: 'detalle',
    label: 'Detalle',
  },
]

const columnasMeteo: ColumnaExportacion[] = [
  {
    key: 'registrado_at',
    label: 'Fecha',
  },
  {
    key: 'temperatura',
    label: 'Temperatura',
  },
  {
    key: 'humedad',
    label: 'Humedad',
  },
  {
    key: 'velocidad_viento',
    label: 'Viento',
  },
  {
    key: 'radiacion_solar',
    label: 'Radiación solar',
  },
  {
    key: 'probabilidad_lluvia',
    label: 'Prob. lluvia',
  },
]

const columnasDisponibles = computed(() =>
  props.tipo === 'eventos' ? columnasEventos : columnasMeteo,
)

const accionItems = [
  {
    title: 'Todas las acciones',
    value: 'Todos',
  },
  {
    title: 'Abrir',
    value: 'abrir',
  },
  {
    title: 'Cerrar',
    value: 'cerrar',
  },
  {
    title: 'Detener',
    value: 'detener',
  },
]

const resultadoItems = [
  {
    title: 'Todos los resultados',
    value: 'Todos',
  },
  {
    title: 'Exitosos',
    value: 'exitoso',
  },
  {
    title: 'Fallidos',
    value: 'fallido',
  },
  {
    title: 'Pendientes',
    value: 'pendiente',
  },
]

const modoItems = [
  {
    title: 'Todos los modos',
    value: 'Todos',
  },
  {
    title: 'Remoto',
    value: 'remoto',
  },
  {
    title: 'Automático',
    value: 'automatico',
  },
  {
    title: 'Local',
    value: 'local',
  },
]

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

  columnas: columnasDisponibles.value.map((columna) => columna.key),
})

const tituloTipo = computed(() => {
  return props.tipo === 'eventos' ? 'Historial de eventos' : 'Meteorología'
})

const iconoTipo = computed(() => {
  return props.tipo === 'eventos' ? 'mdi-history' : 'mdi-weather-partly-cloudy'
})

const fechaDesdeMostrar = computed(() => {
  if (!fechaDesdeObj.value) {
    return ''
  }

  return formatearFechaSimple(fechaDesdeObj.value)
})

const fechaHastaMostrar = computed(() => {
  if (!fechaHastaObj.value) {
    return ''
  }

  return formatearFechaSimple(fechaHastaObj.value)
})

const errorFechas = computed(() => {
  if (!fechaDesdeObj.value || !fechaHastaObj.value) {
    return false
  }

  return fechaHastaObj.value < fechaDesdeObj.value
})

const puedeExportar = computed(() => {
  return Boolean(
    datosFiltrados.value.length > 0 && filtros.value.columnas.length > 0 && !errorFechas.value,
  )
})

const formatearFechaSimple = (fecha: Date) => {
  return fecha.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const fechaLocalISO = (fecha: Date) => {
  const anio = fecha.getFullYear()

  const mes = String(fecha.getMonth() + 1).padStart(2, '0')

  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

const formatFecha = (fecha: string) => {
  if (!fecha) {
    return '—'
  }

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
  let resultado = [...props.datos]

  if (filtros.value.fechaDesde) {
    const desde = new Date(`${filtros.value.fechaDesde}T00:00:00`)

    resultado = resultado.filter((dato) => {
      const fecha = new Date(dato.created_at ?? dato.registrado_at)

      return fecha >= desde
    })
  }

  if (filtros.value.fechaHasta) {
    const hasta = new Date(`${filtros.value.fechaHasta}T23:59:59.999`)

    resultado = resultado.filter((dato) => {
      const fecha = new Date(dato.created_at ?? dato.registrado_at)

      return fecha <= hasta
    })
  }

  if (props.tipo === 'eventos') {
    if (filtros.value.accion !== 'Todos') {
      resultado = resultado.filter((dato) => dato.accion === filtros.value.accion)
    }

    if (filtros.value.resultado !== 'Todos') {
      resultado = resultado.filter((dato) => dato.resultado === filtros.value.resultado)
    }

    if (filtros.value.modo !== 'Todos') {
      resultado = resultado.filter((dato) => dato.modo_origen === filtros.value.modo)
    }
  }

  if (props.tipo === 'meteorologia') {
    if (filtros.value.tempMin !== '') {
      resultado = resultado.filter(
        (dato) => Number(dato.temperatura) >= Number(filtros.value.tempMin),
      )
    }

    if (filtros.value.tempMax !== '') {
      resultado = resultado.filter(
        (dato) => Number(dato.temperatura) <= Number(filtros.value.tempMax),
      )
    }

    if (filtros.value.lluviaMin !== '') {
      resultado = resultado.filter(
        (dato) => Number(dato.probabilidad_lluvia ?? 0) >= Number(filtros.value.lluviaMin),
      )
    }

    if (filtros.value.lluviaMax !== '') {
      resultado = resultado.filter(
        (dato) => Number(dato.probabilidad_lluvia ?? 0) <= Number(filtros.value.lluviaMax),
      )
    }
  }

  return resultado
})

const mapearFila = (dato: any): Record<string, any> => {
  if (props.tipo === 'eventos') {
    return {
      fecha: formatFecha(dato.created_at),

      invernadero_nombre: dato.invernadero_nombre ?? '—',

      zona_nombre: dato.zona_nombre ?? '—',

      accion: dato.accion ?? '—',

      modo_origen: dato.modo_origen ?? '—',

      resultado: dato.resultado ?? '—',

      usuario_nombre: dato.usuario_nombre ?? 'Sistema',

      detalle: dato.detalle ?? '—',
    }
  }

  return {
    registrado_at: formatFecha(dato.registrado_at),

    temperatura: dato.temperatura,

    humedad: dato.humedad,

    velocidad_viento: dato.velocidad_viento,

    radiacion_solar: dato.radiacion_solar,

    probabilidad_lluvia: dato.probabilidad_lluvia ?? 0,
  }
}

const iconoColumna = (key: string) => {
  const iconos: Record<string, string> = {
    fecha: 'mdi-calendar-clock-outline',

    registrado_at: 'mdi-calendar-clock-outline',

    invernadero_nombre: 'mdi-greenhouse',

    zona_nombre: 'mdi-map-marker-outline',

    accion: 'mdi-lightning-bolt-outline',

    modo_origen: 'mdi-tune-variant',

    resultado: 'mdi-check-decagram-outline',

    usuario_nombre: 'mdi-account-outline',

    detalle: 'mdi-text-box-outline',

    temperatura: 'mdi-thermometer',

    humedad: 'mdi-water-percent',

    velocidad_viento: 'mdi-weather-windy',

    radiacion_solar: 'mdi-white-balance-sunny',

    probabilidad_lluvia: 'mdi-weather-rainy',
  }

  return iconos[key] ?? 'mdi-table-column'
}

const seleccionarTodasColumnas = () => {
  filtros.value.columnas = columnasDisponibles.value.map((columna) => columna.key)
}

const limpiarColumnas = () => {
  filtros.value.columnas = []
}

const limpiarFechaDesde = () => {
  fechaDesdeObj.value = null
  filtros.value.fechaDesde = ''
}

const limpiarFechaHasta = () => {
  fechaHastaObj.value = null
  filtros.value.fechaHasta = ''
}

const limpiarFechas = () => {
  limpiarFechaDesde()
  limpiarFechaHasta()
}

const resetearFiltros = () => {
  filtros.value = {
    fechaDesde: '',
    fechaHasta: '',

    accion: 'Todos',
    resultado: 'Todos',
    modo: 'Todos',

    tempMin: '',
    tempMax: '',

    lluviaMin: '',
    lluviaMax: '',

    columnas: columnasDisponibles.value.map((columna) => columna.key),
  }

  fechaDesdeObj.value = null
  fechaHastaObj.value = null

  menuDesde.value = false
  menuHasta.value = false
}

const cerrar = () => {
  visible.value = false
}

const exportar = (formato: 'excel' | 'pdf') => {
  if (!puedeExportar.value) {
    return
  }

  const columnasSeleccionadas = filtros.value.columnas

  const columnasInfo = columnasDisponibles.value.filter((columna) =>
    columnasSeleccionadas.includes(columna.key),
  )

  const nombre = props.tipo === 'eventos' ? 'historial-eventos-malima' : 'meteorologia-malima'

  const titulo = props.tipo === 'eventos' ? 'Historial de Eventos' : 'Datos Meteorológicos'

  const filas = datosFiltrados.value.map((dato) => {
    const fila = mapearFila(dato)

    return columnasInfo.reduce(
      (acumulador, columna) => {
        acumulador[columna.label] = fila[columna.key] ?? '—'

        return acumulador
      },
      {} as Record<string, any>,
    )
  })

  if (formato === 'excel') {
    exportarExcel(filas, nombre, titulo)
  } else {
    const headers = columnasInfo.map((columna) => columna.label)

    const rows = filas.map((fila) => headers.map((header) => fila[header] ?? '—'))

    exportarPDF(titulo, headers, rows, nombre)
  }

  visible.value = false
}

watch(fechaDesdeObj, (valor) => {
  filtros.value.fechaDesde = valor ? fechaLocalISO(valor) : ''
})

watch(fechaHastaObj, (valor) => {
  filtros.value.fechaHasta = valor ? fechaLocalISO(valor) : ''
})

watch(
  () => props.tipo,
  () => {
    resetearFiltros()
  },
)
</script>

<style scoped>
.export-dialog {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.dialog-header {
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.dialog-header__main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-header__icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.dialog-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.dialog-header p {
  margin: 3px 0 0;
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.dialog-content {
  padding: 18px !important;
}

.export-summary {
  display: grid;
  grid-template-columns:
    1fr
    1px
    1fr
    1px
    1fr;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding: 13px 15px;
  border-radius: 13px;
  background: rgba(var(--v-theme-primary), 0.035);
}

.export-summary__item {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.export-summary__icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.export-summary__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.export-summary__item > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.export-summary__item span {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.export-summary__item strong {
  margin-top: 2px;
  font-size: 0.95rem;
  font-weight: 700;
}

.export-summary__divider {
  width: 1px;
  height: 34px;
  background: rgba(var(--v-theme-on-surface), 0.09);
}

.export-section {
  margin-top: 16px;
  padding: 15px;
  border: 1px solid rgba(var(--v-border-color), 0.5);
  border-radius: 14px;
}

.export-section:first-of-type {
  margin-top: 0;
}

.section-header {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
}

.section-header__main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.section-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.section-header h3 {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
}

.section-header p {
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.date-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    30px
    minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.filters-grid {
  display: grid;
  gap: 10px;
}

.filters-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.export-field :deep(.v-field__input) {
  font-size: 0.84rem;
}

.export-field :deep(.v-field-label) {
  font-size: 0.8rem;
}

.filter-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
  font-size: 0.74rem;
  color: rgb(var(--v-theme-error));
}

.range-group {
  display: grid;
  grid-template-columns:
    180px
    minmax(0, 1fr);
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.range-group + .range-group {
  border-top: 1px solid rgba(var(--v-border-color), 0.4);
}

.range-group__label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-group__label > span {
  font-size: 0.78rem;
  font-weight: 650;
}

.range-group__icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.09);
}

.range-group__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.range-fields {
  display: grid;
  grid-template-columns:
    1fr
    20px
    1fr;
  align-items: center;
  gap: 7px;
}

.range-fields > span {
  text-align: center;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.columns-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.column-option {
  position: relative;
  min-width: 0;
  min-height: 53px;
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border: 1px solid rgba(var(--v-border-color), 0.55);
  border-radius: 11px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.column-option:hover {
  border-color: rgba(var(--v-theme-primary), 0.22);
}

.column-option--selected {
  border-color: rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.035);
}

.column-option :deep(.v-selection-control) {
  min-height: auto;
}

.column-option :deep(.v-checkbox-btn) {
  margin-right: 3px;
}

.column-option__content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.column-option__icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.07);
}

.column-option__content span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 550;
}

.empty-export {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 11px 13px;
  border-radius: 11px;
  background: rgba(var(--v-theme-warning), 0.055);
}

.empty-export__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.empty-export > div:last-child {
  display: flex;
  flex-direction: column;
}

.empty-export strong {
  font-size: 0.78rem;
  font-weight: 650;
}

.empty-export span {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.dialog-footer {
  min-height: 73px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 12px 18px;
}

.export-result {
  display: flex;
  align-items: center;
  gap: 9px;
}

.export-result__dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.25);
}

.export-result__dot--ready {
  background: rgb(var(--v-theme-success));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-success), 0.08);
}

.export-result > div {
  display: flex;
  flex-direction: column;
}

.export-result strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.export-result span {
  margin-top: 1px;
  font-size: 0.69rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.dialog-footer__actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

@media (max-width: 700px) {
  .dialog-header {
    padding: 14px;
  }

  .dialog-header__icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }

  .dialog-header p {
    font-size: 0.72rem;
  }

  .dialog-content {
    padding: 14px !important;
  }

  .export-summary {
    grid-template-columns:
      1fr
      1fr
      1fr;
    gap: 7px;
    padding: 10px;
  }

  .export-summary__divider {
    display: none;
  }

  .export-summary__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .date-grid {
    grid-template-columns: 1fr;
  }

  .date-separator {
    display: none;
  }

  .filters-grid--three {
    grid-template-columns: 1fr;
  }

  .range-group {
    grid-template-columns: 1fr;
  }

  .columns-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .dialog-footer__actions {
    width: 100%;
  }

  .dialog-footer__actions .v-btn {
    flex: 1;
  }
}

@media (max-width: 440px) {
  .dialog-header p {
    display: none;
  }

  .dialog-header__main .v-chip {
    display: none;
  }

  .export-summary__icon {
    width: 31px;
    height: 31px;
  }

  .export-summary__item span {
    font-size: 0.66rem;
  }

  .export-summary__item strong {
    font-size: 0.86rem;
  }

  .export-section {
    padding: 12px;
  }

  .section-header p {
    display: none;
  }

  .columns-grid {
    grid-template-columns: 1fr;
  }

  .range-fields {
    grid-template-columns:
      1fr
      16px
      1fr;
  }

  .dialog-footer__actions {
    display: grid;
    grid-template-columns:
      1fr
      1fr;
  }

  .dialog-footer__actions .v-btn:first-child {
    grid-column: 1 / -1;
  }
}
</style>