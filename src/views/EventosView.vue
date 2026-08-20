<template>
  <v-container fluid class="historial-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-history </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Historial de eventos</h1>

            <v-chip color="primary" variant="tonal" size="small" class="records-chip">
              {{ eventosFiltrados.length }}
              {{ eventosFiltrados.length === 1 ? 'registro' : 'registros' }}
            </v-chip>
          </div>

          <p class="page-subtitle">
            Registro y trazabilidad de las acciones realizadas en el sistema
          </p>
        </div>
      </div>

      <div class="page-header__actions">
        <div v-if="ultimaActualizacion" class="last-update">
          <v-icon size="14"> mdi-clock-outline </v-icon>

          <span> Actualizado {{ ultimaActualizacion }} </span>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="cargando"
          @click="cargar"
        >
          Actualizar
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          rounded="lg"
          prepend-icon="mdi-export-variant"
          :disabled="eventosFiltrados.length === 0"
          @click="modalExportar = true"
        >
          Exportar
        </v-btn>
      </div>
    </div>

    <v-row class="mb-5">
      <v-col v-for="item in indicadores" :key="item.label" cols="6" md="3">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div class="summary-card__icon" :class="`summary-card__icon--${item.color}`">
            <v-icon size="23">
              {{ item.icon }}
            </v-icon>
          </div>

          <div class="summary-card__content">
            <strong>
              {{ item.value }}
            </strong>

            <span>
              {{ item.label }}
            </span>
          </div>

          <span class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="history-card">
      <div class="history-toolbar">
        <div class="history-toolbar__title">
          <div class="section-icon">
            <v-icon size="20"> mdi-format-list-bulleted </v-icon>
          </div>

          <div>
            <h2>Eventos registrados</h2>

            <p>Consulta, filtra y revisa la actividad del sistema</p>
          </div>
        </div>

        <div class="history-toolbar__filters">
          <v-text-field
            v-model="busqueda"
            label="Buscar"
            placeholder="Galpón, zona, usuario..."
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            class="search-field"
          />

          <v-select
            v-model="filtros.zona_id"
            :items="zonaItems"
            item-title="nombre"
            item-value="id"
            label="Zona"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-map-marker-outline"
            class="filter-field"
            @update:model-value="cargar"
          />

          <v-select
            v-model="filtros.resultado"
            :items="resultadoItems"
            item-title="title"
            item-value="value"
            label="Resultado"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-filter-outline"
            class="filter-field"
          />

          <v-btn
            v-if="hayFiltros"
            color="primary"
            variant="text"
            size="small"
            rounded="lg"
            prepend-icon="mdi-filter-remove-outline"
            @click="limpiarFiltros"
          >
            Limpiar
          </v-btn>
        </div>
      </div>

      <v-divider />

      <div v-if="cargando && eventos.length === 0" class="table-loading">
        <v-skeleton-loader type="table-heading, table-thead, table-tbody" />
      </div>

      <div v-else-if="eventosFiltrados.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <v-icon size="44" color="primary"> mdi-history </v-icon>
        </div>

        <h3>No se encontraron eventos</h3>

        <p>No existen registros que coincidan con los filtros seleccionados.</p>

        <v-btn
          v-if="hayFiltros"
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-filter-remove-outline"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </v-btn>
      </div>

      <div v-else class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="eventosFiltrados"
          :loading="cargando"
          density="comfortable"
          :items-per-page="15"
          items-per-page-text="Eventos por página"
          no-data-text="No hay eventos registrados"
          class="events-table"
        >
          <template #item.fecha="{ item }">
            <div class="date-cell">
              <div class="date-cell__icon">
                <v-icon size="15"> mdi-calendar-clock-outline </v-icon>
              </div>

              <div>
                <strong>
                  {{ formatDia(item.created_at) }}
                </strong>

                <span>
                  {{ formatHora(item.created_at) }}
                </span>
              </div>
            </div>
          </template>

          <template #item.invernadero_nombre="{ item }">
            <div class="entity-cell">
              <div class="entity-cell__icon">
                <v-icon size="17"> mdi-greenhouse </v-icon>
              </div>

              <div>
                <strong>
                  {{ item.invernadero_nombre || 'Sin galpón' }}
                </strong>

                <span v-if="item.invernadero_id"> ID {{ item.invernadero_id }} </span>
              </div>
            </div>
          </template>

          <template #item.zona_nombre="{ item }">
            <div class="zone-cell">
              <v-icon size="15" color="primary"> mdi-map-marker-outline </v-icon>

              <span>
                {{ item.zona_nombre || '—' }}
              </span>
            </div>
          </template>

          <template #item.accion="{ item }">
            <div class="action-cell">
              <div class="action-icon" :class="`action-icon--${colorAccion(item.accion)}`">
                <v-icon size="16">
                  {{ iconoAccion(item.accion) }}
                </v-icon>
              </div>

              <span>
                {{ labelAccion(item.accion) }}
              </span>
            </div>
          </template>

          <template #item.modo_origen="{ item }">
            <div class="mode-cell">
              <v-icon size="15" :color="colorModo(item.modo_origen)">
                {{ iconoModo(item.modo_origen) }}
              </v-icon>

              <span>
                {{ labelModo(item.modo_origen) }}
              </span>
            </div>
          </template>

          <template #item.resultado="{ item }">
            <v-chip
              size="small"
              :color="colorResultado(item.resultado)"
              variant="tonal"
              class="result-chip"
            >
              <v-icon start size="14">
                {{ iconoResultado(item.resultado) }}
              </v-icon>

              {{ labelResultado(item.resultado) }}
            </v-chip>
          </template>

          <template #item.usuario_nombre="{ item }">
            <div class="user-cell">
              <div class="user-avatar">
                <v-icon size="15">
                  {{ item.usuario_nombre ? 'mdi-account-outline' : 'mdi-robot-outline' }}
                </v-icon>
              </div>

              <span>
                {{ item.usuario_nombre ?? 'Sistema' }}
              </span>
            </div>
          </template>

          <template #item.detalle="{ item }">
            <v-tooltip :text="item.detalle ?? 'Sin detalle'" location="top" max-width="420">
              <template #activator="{ props }">
                <div v-bind="props" class="detail-cell">
                  <v-icon size="14"> mdi-text-box-outline </v-icon>

                  <span>
                    {{ item.detalle ?? '—' }}
                  </span>
                </div>
              </template>
            </v-tooltip>
          </template>

          <template #bottom>
            <div class="table-footer">
              <div class="table-footer__info">
                <v-icon size="14"> mdi-information-outline </v-icon>

                <span>
                  Mostrando
                  {{ eventosFiltrados.length }}
                  de
                  {{ eventos.length }}
                  eventos
                </span>
              </div>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <ModalExportar v-model="modalExportar" tipo="eventos" :datos="eventosFiltrados" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'

import ModalExportar from '../components/shared/ModalExportar.vue'
import api from '../api/axios'

const loadingStore = useLoadingStore()
const invernaderosStore = useInvernaderosStore()

const { zonas } = storeToRefs(invernaderosStore)

const eventos = ref<any[]>([])
const cargando = ref(false)
const modalExportar = ref(false)
const busqueda = ref('')
const ultimaActualizacion = ref('')

const filtros = reactive({
  zona_id: null as number | null,
  resultado: null as string | null,
})

const zonaItems = computed(() => zonas.value)

const resultadoItems = [
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

const eventosFiltrados = computed(() => {
  let resultado = [...eventos.value]

  if (filtros.resultado) {
    resultado = resultado.filter((evento) => evento.resultado === filtros.resultado)
  }

  const termino = busqueda.value.trim().toLowerCase()

  if (termino) {
    resultado = resultado.filter((evento) => {
      const campos = [
        evento.invernadero_nombre,
        evento.zona_nombre,
        evento.usuario_nombre,
        evento.detalle,
        evento.accion,
        evento.modo_origen,
        evento.resultado,
      ]

      return campos.some((valor) =>
        String(valor ?? '')
          .toLowerCase()
          .includes(termino),
      )
    })
  }

  return resultado
})

const totalExitosos = computed(() => {
  return eventos.value.filter((evento) => evento.resultado === 'exitoso').length
})

const totalFallidos = computed(() => {
  return eventos.value.filter((evento) => evento.resultado === 'fallido').length
})

const totalPendientes = computed(() => {
  return eventos.value.filter((evento) => evento.resultado === 'pendiente').length
})

const indicadores = computed(() => [
  {
    label: 'Total eventos',
    value: eventos.value.length,
    icon: 'mdi-format-list-bulleted',
    color: 'primary',
  },
  {
    label: 'Exitosos',
    value: totalExitosos.value,
    icon: 'mdi-check-circle-outline',
    color: 'success',
  },
  {
    label: 'Fallidos',
    value: totalFallidos.value,
    icon: 'mdi-close-circle-outline',
    color: 'error',
  },
  {
    label: 'Pendientes',
    value: totalPendientes.value,
    icon: 'mdi-clock-outline',
    color: 'warning',
  },
])

const hayFiltros = computed(() => {
  return Boolean(filtros.zona_id || filtros.resultado || busqueda.value.trim())
})

const headers = [
  {
    title: 'Fecha',
    key: 'fecha',
    width: '145px',
  },
  {
    title: 'Galpón',
    key: 'invernadero_nombre',
    minWidth: '160px',
  },
  {
    title: 'Zona',
    key: 'zona_nombre',
    minWidth: '130px',
  },
  {
    title: 'Acción',
    key: 'accion',
    minWidth: '115px',
  },
  {
    title: 'Modo',
    key: 'modo_origen',
    minWidth: '105px',
  },
  {
    title: 'Resultado',
    key: 'resultado',
    minWidth: '125px',
  },
  {
    title: 'Usuario',
    key: 'usuario_nombre',
    minWidth: '135px',
  },
  {
    title: 'Detalle',
    key: 'detalle',
    minWidth: '190px',
  },
]

const colorAccion = (accion: string) => {
  if (accion === 'abrir') {
    return 'success'
  }

  if (accion === 'cerrar') {
    return 'error'
  }

  if (accion === 'detener') {
    return 'warning'
  }

  return 'primary'
}

const iconoAccion = (accion: string) => {
  if (accion === 'abrir') {
    return 'mdi-arrow-up'
  }

  if (accion === 'cerrar') {
    return 'mdi-arrow-down'
  }

  if (accion === 'detener') {
    return 'mdi-stop'
  }

  return 'mdi-cog-outline'
}

const labelAccion = (accion: string) => {
  if (accion === 'abrir') {
    return 'Abrir'
  }

  if (accion === 'cerrar') {
    return 'Cerrar'
  }

  if (accion === 'detener') {
    return 'Detener'
  }

  return accion || 'Acción'
}

const colorResultado = (resultado: string) => {
  if (resultado === 'exitoso') {
    return 'success'
  }

  if (resultado === 'fallido') {
    return 'error'
  }

  return 'warning'
}

const iconoResultado = (resultado: string) => {
  if (resultado === 'exitoso') {
    return 'mdi-check'
  }

  if (resultado === 'fallido') {
    return 'mdi-close'
  }

  return 'mdi-clock-outline'
}

const labelResultado = (resultado: string) => {
  if (resultado === 'exitoso') {
    return 'Exitoso'
  }

  if (resultado === 'fallido') {
    return 'Fallido'
  }

  if (resultado === 'pendiente') {
    return 'Pendiente'
  }

  return resultado || 'Desconocido'
}

const colorModo = (modo: string) => {
  if (modo === 'automatico') {
    return 'primary'
  }

  if (modo === 'remoto') {
    return 'info'
  }

  if (modo === 'local') {
    return 'warning'
  }

  return 'grey'
}

const iconoModo = (modo: string) => {
  if (modo === 'automatico') {
    return 'mdi-robot-outline'
  }

  if (modo === 'remoto') {
    return 'mdi-access-point'
  }

  if (modo === 'local') {
    return 'mdi-hand-back-right-outline'
  }

  return 'mdi-help-circle-outline'
}

const labelModo = (modo: string) => {
  if (modo === 'automatico') {
    return 'Automático'
  }

  if (modo === 'remoto') {
    return 'Remoto'
  }

  if (modo === 'local') {
    return 'Local'
  }

  return modo || '—'
}

const formatDia = (fecha: string) => {
  if (!fecha) {
    return '—'
  }

  return new Date(fecha).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatHora = (fecha: string) => {
  if (!fecha) {
    return ''
  }

  return new Date(fecha).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const limpiarFiltros = async () => {
  const teniaZona = filtros.zona_id !== null

  filtros.zona_id = null
  filtros.resultado = null
  busqueda.value = ''

  if (teniaZona) {
    await cargar()
  }
}

const cargar = async () => {
  if (cargando.value) {
    return
  }

  cargando.value = true

  try {
    const params: Record<string, any> = {}

    if (filtros.zona_id) {
      params.zona_id = filtros.zona_id
    }

    const { data } = await api.get('/zonas/eventos', {
      params,
    })

    if (data.ok) {
      eventos.value = data.data ?? []
    } else {
      eventos.value = []
    }

    ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    console.error('Error cargando historial:', error)

    eventos.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando historial...')

  try {
    await invernaderosStore.cargarZonas()
    await cargar()
  } finally {
    loadingStore.ocultar()
  }
})
</script>

<style scoped>
.historial-page {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.page-header__main {
  display: flex;
  align-items: center;
  gap: 13px;
}

.page-header__icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.page-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 750;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.records-chip {
  font-weight: 600;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 3px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.summary-card {
  position: relative;
  min-height: 94px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 24px rgba(0, 0, 0, 0.05) !important;
}

.summary-card__icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.summary-card__icon--primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.summary-card__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.summary-card__icon--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.09);
}

.summary-card__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.summary-card__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.summary-card__content strong {
  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-card__content span {
  margin-top: 4px;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.summary-card__accent {
  position: absolute;
  top: 21px;
  right: 0;
  bottom: 21px;
  width: 3px;
  border-radius: 4px 0 0 4px;
}

.summary-card__accent--primary {
  background: rgb(var(--v-theme-primary));
}

.summary-card__accent--success {
  background: rgb(var(--v-theme-success));
}

.summary-card__accent--error {
  background: rgb(var(--v-theme-error));
}

.summary-card__accent--warning {
  background: rgb(var(--v-theme-warning));
}

.history-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.history-toolbar {
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
}

.history-toolbar__title {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.history-toolbar h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.history-toolbar p {
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.history-toolbar__filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-field {
  width: 240px;
}

.filter-field {
  width: 180px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.events-table {
  min-width: 1050px;
}

.events-table :deep(th) {
  height: 48px !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: rgba(var(--v-theme-on-surface), 0.65) !important;
}

.events-table :deep(td) {
  min-height: 58px;
  font-size: 0.78rem;
  border-bottom-color: rgba(var(--v-border-color), 0.4) !important;
}

.events-table :deep(tbody tr) {
  transition: background-color 0.16s ease;
}

.events-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.025) !important;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-cell__icon {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.07);
}

.date-cell > div:last-child {
  display: flex;
  flex-direction: column;
}

.date-cell strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.date-cell span {
  margin-top: 2px;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.entity-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entity-cell__icon {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.07);
}

.entity-cell > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.entity-cell strong {
  max-width: 145px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 650;
}

.entity-cell span {
  margin-top: 2px;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.zone-cell,
.mode-cell,
.user-cell,
.action-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.zone-cell span,
.mode-cell span,
.user-cell span,
.action-cell > span {
  font-size: 0.76rem;
}

.action-icon {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.action-icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.action-icon--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.09);
}

.action-icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.action-icon--primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.result-chip {
  font-size: 0.72rem;
  font-weight: 600;
}

.user-avatar {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.07);
}

.detail-cell {
  max-width: 210px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: help;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.detail-cell span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.74rem;
}

.table-footer {
  min-height: 45px;
  display: flex;
  align-items: center;
  padding: 8px 17px;
  border-top: 1px solid rgba(var(--v-border-color), 0.4);
}

.table-footer__info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.empty-state {
  min-height: 330px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state__icon {
  width: 78px;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 400px;
  margin: 6px 0 18px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.table-loading {
  min-height: 300px;
  padding: 16px;
}

.search-field :deep(.v-field__input),
.filter-field :deep(.v-field__input) {
  font-size: 0.82rem;
}

.search-field :deep(.v-field-label),
.filter-field :deep(.v-field-label) {
  font-size: 0.78rem;
}

.filter-field :deep(.v-select__selection-text) {
  font-size: 0.82rem;
}

.search-field :deep(input::placeholder) {
  font-size: 0.82rem;
}

@media (max-width: 1100px) {
  .history-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .history-toolbar__filters {
    width: 100%;
  }

  .search-field {
    flex: 1;
    width: auto;
  }

  .filter-field {
    width: 180px;
  }
}

@media (max-width: 700px) {
  .historial-page {
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .page-header__main {
    align-items: flex-start;
  }

  .page-header__icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .page-subtitle {
    font-size: 0.7rem;
  }

  .page-header__actions {
    width: 100%;
  }

  .last-update {
    display: none;
  }

  .page-header__actions .v-btn {
    flex: 1;
  }

  .summary-card {
    min-height: 82px;
    padding: 12px;
    gap: 9px;
  }

  .summary-card__icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .summary-card__content strong {
    font-size: 1.2rem;
  }

  .summary-card__content span {
    font-size: 0.6rem;
  }

  .history-toolbar {
    padding: 14px;
  }

  .history-toolbar__filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .search-field {
    width: 100%;
    grid-column: 1 / -1;
  }

  .filter-field {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .records-chip {
    display: none;
  }

  .history-toolbar__filters {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: auto;
  }

  .page-header__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
