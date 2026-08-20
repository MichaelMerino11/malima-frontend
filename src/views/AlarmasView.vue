<template>
  <v-container fluid class="alarmas-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__content">
        <div class="page-header__icon">
          <v-icon size="26">mdi-alarm-light-outline</v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Alarmas y fallas</h1>

            <v-chip
              v-if="resumen.activas > 0"
              color="error"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon start size="15">mdi-alert-circle</v-icon>
              {{ resumen.activas }} pendientes
            </v-chip>

            <v-chip v-else color="success" variant="tonal" size="small" class="font-weight-medium">
              <v-icon start size="15">mdi-check-circle</v-icon>
              Todo en orden
            </v-chip>
          </div>

          <p class="page-subtitle">
            Monitorea, filtra y gestiona las alertas detectadas por el sistema.
          </p>
        </div>
      </div>

      <div class="page-header__actions">
        <v-btn
          v-if="resumen.activas > 0"
          color="error"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-check-all"
          :disabled="cargando"
          @click="resolverTodas"
        >
          Resolver todas
        </v-btn>

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
      </div>
    </div>
    <v-row class="mb-6">
      <v-col cols="12" sm="6" lg="4">
        <v-card class="stat-card stat-card--error" rounded="xl" elevation="0">
          <div class="stat-card__icon">
            <v-icon size="26">mdi-alert-circle-outline</v-icon>
          </div>

          <div class="stat-card__content">
            <span class="stat-card__label">Alarmas activas</span>

            <strong class="stat-card__value">
              {{ resumen.activas }}
            </strong>

            <span class="stat-card__description"> Requieren atención </span>
          </div>

          <div v-if="resumen.activas > 0" class="stat-card__indicator" />
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card class="stat-card stat-card--success" rounded="xl" elevation="0">
          <div class="stat-card__icon">
            <v-icon size="26">mdi-check-circle-outline</v-icon>
          </div>

          <div class="stat-card__content">
            <span class="stat-card__label">Resueltas</span>

            <strong class="stat-card__value">
              {{ resumen.resueltas }}
            </strong>

            <span class="stat-card__description"> Incidencias atendidas </span>
          </div>
        </v-card>
      </v-col>

      <!-- TOTAL -->
      <v-col cols="12" sm="6" lg="4">
        <v-card class="stat-card stat-card--primary" rounded="xl" elevation="0">
          <div class="stat-card__icon">
            <v-icon size="26">mdi-bell-outline</v-icon>
          </div>

          <div class="stat-card__content">
            <span class="stat-card__label">Total registradas</span>

            <strong class="stat-card__value">
              {{ resumen.total }}
            </strong>

            <span class="stat-card__description"> Historial acumulado </span>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-card class="main-card" rounded="xl" elevation="0">
      <!-- Toolbar -->
      <div class="alarm-toolbar">
        <div class="alarm-toolbar__title">
          <div class="section-icon">
            <v-icon size="21">mdi-format-list-bulleted</v-icon>
          </div>

          <div>
            <h2>Registro de alarmas</h2>

            <span>
              {{ alarmas.length }}
              {{ alarmas.length === 1 ? 'registro encontrado' : 'registros encontrados' }}
            </span>
          </div>
        </div>

        <div class="alarm-toolbar__filters">
          <v-select
            v-model="filtros.estado"
            :items="estadosItems"
            item-title="title"
            item-value="value"
            label="Estado"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            prepend-inner-icon="mdi-filter-outline"
            class="filter-field"
            @update:model-value="cargar"
          />

          <v-select
            v-model="filtros.zona_id"
            :items="zonaItems"
            item-title="nombre"
            item-value="id"
            label="Zona"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-map-marker-outline"
            class="filter-field"
            @update:model-value="cargar"
          />

          <v-btn
            v-if="hayFiltrosActivos"
            variant="text"
            color="primary"
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

      <div v-if="cargando && alarmas.length === 0" class="pa-4">
        <div v-for="i in 4" :key="i" class="alarm-skeleton">
          <v-skeleton-loader type="avatar, list-item-two-line" class="w-100" />
        </div>
      </div>

      <div v-else-if="alarmas.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <v-icon size="42" color="success"> mdi-shield-check-outline </v-icon>
        </div>

        <h3>No se encontraron alarmas</h3>

        <p>No existen registros que coincidan con los filtros seleccionados.</p>

        <v-btn
          v-if="hayFiltrosActivos"
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-filter-remove-outline"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </v-btn>
      </div>

      <div v-else class="alarm-list">
        <div
          v-for="alarma in alarmas"
          :key="alarma.id"
          class="alarm-item"
          :class="{
            'alarm-item--active': alarma.estado === 'activa',
            'alarm-item--resolved': alarma.estado === 'resuelta',
          }"
        >
          <!-- ICON -->
          <div
            class="alarm-item__icon"
            :class="{
              'alarm-item__icon--active': alarma.estado === 'activa',
              'alarm-item__icon--resolved': alarma.estado === 'resuelta',
            }"
          >
            <v-icon size="23">
              {{ alarma.estado === 'activa' ? 'mdi-alert-outline' : 'mdi-check' }}
            </v-icon>
          </div>

          <!-- CONTENT -->
          <div class="alarm-item__content">
            <div class="alarm-item__top">
              <div class="alarm-item__message">
                {{ alarma.mensaje }}
              </div>

              <div class="alarm-item__chips">
                <v-chip
                  size="small"
                  :color="colorTipo(alarma.tipo)"
                  variant="tonal"
                  class="alarm-type-chip"
                >
                  <v-icon start size="15">
                    {{ iconTipo(alarma.tipo) }}
                  </v-icon>

                  {{ labelTipo(alarma.tipo) }}
                </v-chip>

                <v-chip
                  size="small"
                  :color="alarma.estado === 'activa' ? 'error' : 'success'"
                  variant="tonal"
                >
                  {{ alarma.estado === 'activa' ? 'Activa' : 'Resuelta' }}
                </v-chip>
              </div>
            </div>

            <!-- METADATA -->
            <div class="alarm-item__meta">
              <span class="alarm-meta">
                <v-icon size="15"> mdi-map-marker-outline </v-icon>

                {{ alarma.zona_nombre || 'Zona no especificada' }}
              </span>

              <span class="alarm-meta">
                <v-icon size="15"> mdi-clock-outline </v-icon>

                {{ formatFecha(alarma.created_at) }}
              </span>

              <span v-if="alarma.resuelta_at" class="alarm-meta alarm-meta--resolved">
                <v-icon size="15"> mdi-check-circle-outline </v-icon>

                Resuelta {{ formatFecha(alarma.resuelta_at) }}
              </span>
            </div>
          </div>

          <!-- ACTION -->
          <div class="alarm-item__action">
            <v-tooltip v-if="alarma.estado === 'activa'" text="Marcar como resuelta" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="success"
                  variant="tonal"
                  icon
                  size="small"
                  @click="resolver(alarma.id)"
                >
                  <v-icon size="19"> mdi-check </v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-icon v-else size="20" color="success"> mdi-check-circle </v-icon>
          </div>
        </div>
      </div>
    </v-card>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
      rounded="lg"
    >
      <div class="d-flex align-center ga-2">
        <v-icon>
          {{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}
        </v-icon>

        {{ snackbar.mensaje }}
      </div>

      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.visible = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'
import api from '../api/axios'

const invernaderosStore = useInvernaderosStore()
const loadingStore = useLoadingStore()

const { zonas } = storeToRefs(invernaderosStore)

const alarmas = ref<any[]>([])
const cargando = ref(false)

const resumen = reactive({
  activas: 0,
  resueltas: 0,
  total: 0,
})

const filtros = reactive({
  estado: 'Todos',
  zona_id: null as number | null,
})

const snackbar = reactive({
  visible: false,
  mensaje: '',
  color: 'success',
})

const estadosItems = [
  {
    title: 'Todos los estados',
    value: 'Todos',
  },
  {
    title: 'Activas',
    value: 'activa',
  },
  {
    title: 'Resueltas',
    value: 'resuelta',
  },
]

const zonaItems = computed(() => zonas.value)

const hayFiltrosActivos = computed(() => {
  return filtros.estado !== 'Todos' || filtros.zona_id !== null
})

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.visible = true
}

const colorTipo = (tipo: string) => {
  switch (tipo) {
    case 'temperatura_alta':
      return 'error'

    case 'viento_fuerte':
      return 'warning'

    case 'lluvia_inminente':
      return 'info'

    case 'humedad_alta':
      return 'primary'

    default:
      return 'grey'
  }
}

const labelTipo = (tipo: string) => {
  switch (tipo) {
    case 'temperatura_alta':
      return 'Temperatura'

    case 'viento_fuerte':
      return 'Viento'

    case 'lluvia_inminente':
      return 'Lluvia'

    case 'humedad_alta':
      return 'Humedad'

    default:
      return tipo
  }
}

const iconTipo = (tipo: string) => {
  switch (tipo) {
    case 'temperatura_alta':
      return 'mdi-thermometer-high'

    case 'viento_fuerte':
      return 'mdi-weather-windy'

    case 'lluvia_inminente':
      return 'mdi-weather-pouring'

    case 'humedad_alta':
      return 'mdi-water-percent'

    default:
      return 'mdi-alert-outline'
  }
}

const formatFecha = (fecha: string) => {
  if (!fecha) return '-'

  return new Date(fecha).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const limpiarFiltros = async () => {
  filtros.estado = 'Todos'
  filtros.zona_id = null

  await cargar()
}

const cargar = async () => {
  cargando.value = true

  try {
    const params: Record<string, any> = {}

    if (filtros.estado !== 'Todos') {
      params.estado = filtros.estado
    }

    if (filtros.zona_id) {
      params.zona_id = filtros.zona_id
    }

    const [alarmasRes, resumenRes] = await Promise.all([
      api.get('/alarmas', {
        params,
      }),

      api.get('/alarmas/resumen'),
    ])

    if (alarmasRes.data.ok) {
      alarmas.value = alarmasRes.data.data
    }

    if (resumenRes.data.ok) {
      Object.assign(resumen, resumenRes.data.data)
    }
  } catch (error) {
    console.error(error)

    mostrarSnackbar('Error cargando alarmas', 'error')
  } finally {
    cargando.value = false
  }
}

const resolver = async (id: number) => {
  try {
    await api.patch(`/alarmas/${id}/resolver`)

    mostrarSnackbar('Alarma resuelta correctamente')

    await cargar()
  } catch (error) {
    console.error(error)

    mostrarSnackbar('Error resolviendo alarma', 'error')
  }
}

const resolverTodas = async () => {
  try {
    await api.patch('/alarmas/resolver-todas')

    mostrarSnackbar('Todas las alarmas fueron resueltas')

    await cargar()
  } catch (error) {
    console.error(error)

    mostrarSnackbar('Error resolviendo las alarmas', 'error')
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando alarmas...')

  try {
    await invernaderosStore.cargarZonas()
    await cargar()
  } finally {
    loadingStore.ocultar()
  }
})
</script>

<style scoped>

.alarmas-page {
  max-width: 1500px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.page-header__content {
  display: flex;
  align-items: center;
  gap: 14px;
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
  background: rgba(var(--v-theme-primary), 0.1);
}

.page-title {
  margin: 0;

  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 4px 0 0;

  font-size: 0.875rem;

  color: rgba(var(--v-theme-on-surface), 0.62);
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-card {
  min-height: 122px;

  display: flex;
  align-items: center;

  gap: 16px;

  padding: 20px;

  position: relative;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  overflow: hidden;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06) !important;
}

.stat-card__icon {
  width: 50px;
  height: 50px;

  flex: 0 0 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;
}

.stat-card__content {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.stat-card__label {
  font-size: 0.78rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.6);
}

.stat-card__value {
  margin-top: 2px;

  font-size: 1.8rem;
  font-weight: 750;
  line-height: 1.15;
}

.stat-card__description {
  margin-top: 3px;

  font-size: 0.75rem;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

/* ERROR */

.stat-card--error .stat-card__icon {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.1);
}

.stat-card--error .stat-card__value {
  color: rgb(var(--v-theme-error));
}

/* SUCCESS */

.stat-card--success .stat-card__icon {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.1);
}

.stat-card--success .stat-card__value {
  color: rgb(var(--v-theme-success));
}

/* PRIMARY */

.stat-card--primary .stat-card__icon {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);
}

.stat-card--primary .stat-card__value {
  color: rgb(var(--v-theme-primary));
}

.stat-card__indicator {
  position: absolute;

  right: 0;
  top: 24px;
  bottom: 24px;

  width: 4px;

  border-radius: 10px 0 0 10px;

  background: rgb(var(--v-theme-error));
}

.main-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  overflow: hidden;
}

.alarm-toolbar {
  min-height: 84px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 16px 20px;
}

.alarm-toolbar__title {
  display: flex;
  align-items: center;

  gap: 12px;

  flex-shrink: 0;
}

.alarm-toolbar__title h2 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.alarm-toolbar__title span {
  display: block;

  margin-top: 2px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.54);
}

.section-icon {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.08);
}

.alarm-toolbar__filters {
  display: flex;
  align-items: center;

  gap: 10px;
}

.filter-field {
  width: 210px;
}

.alarm-list {
  padding: 8px 14px 14px;
}

.alarm-item {
  position: relative;

  display: flex;
  align-items: center;

  gap: 14px;

  min-height: 82px;

  margin-top: 8px;
  padding: 14px 14px 14px 16px;

  border: 1px solid rgba(var(--v-border-color), 0.55);

  border-radius: 14px;

  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.alarm-item:hover {
  transform: translateY(-1px);

  border-color: rgba(var(--v-theme-primary), 0.25);

  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.045);
}

.alarm-item--active {
  background: linear-gradient(90deg, rgba(var(--v-theme-error), 0.045), transparent 45%);
}

.alarm-item--resolved {
  opacity: 0.78;
}

.alarm-item__icon {
  width: 42px;
  height: 42px;

  flex: 0 0 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
}

.alarm-item__icon--active {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.1);
}

.alarm-item__icon--resolved {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.1);
}

.alarm-item__content {
  flex: 1;
  min-width: 0;
}

.alarm-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;
}

.alarm-item__message {
  min-width: 0;

  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;

  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-item__chips {
  display: flex;
  align-items: center;

  gap: 7px;

  flex-shrink: 0;
}

.alarm-type-chip {
  font-weight: 500;
}

.alarm-item__meta {
  display: flex;
  flex-wrap: wrap;

  align-items: center;

  gap: 8px 16px;

  margin-top: 7px;
}

.alarm-meta {
  display: inline-flex;
  align-items: center;

  gap: 4px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.55);
}

.alarm-meta--resolved {
  color: rgb(var(--v-theme-success));
}

.alarm-item__action {
  min-width: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-state {
  min-height: 310px;

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

  background: rgba(var(--v-theme-success), 0.08);
}

.empty-state h3 {
  margin: 0;

  font-size: 1rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 390px;

  margin: 6px 0 18px;

  font-size: 0.82rem;

  color: rgba(var(--v-theme-on-surface), 0.55);
}

.alarm-skeleton {
  min-height: 74px;

  display: flex;
  align-items: center;

  margin-bottom: 8px;

  border: 1px solid rgba(var(--v-border-color), 0.45);

  border-radius: 14px;

  overflow: hidden;
}

@media (max-width: 959px) {
  .page-header {
    align-items: flex-start;
  }

  .alarm-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .alarm-toolbar__filters {
    width: 100%;
  }

  .filter-field {
    flex: 1;
    width: auto;
  }
}

@media (max-width: 700px) {
  .alarmas-page {
    padding: 16px !important;
  }

  .page-header {
    flex-direction: column;

    gap: 16px;
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions .v-btn {
    flex: 1;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .alarm-toolbar__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-field {
    width: 100%;
  }

  .alarm-item {
    align-items: flex-start;

    padding: 14px;
  }

  .alarm-item__top {
    flex-direction: column;
    align-items: flex-start;

    gap: 8px;
  }

  .alarm-item__chips {
    flex-wrap: wrap;
  }

  .alarm-item__action {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .page-header__icon {
    width: 42px;
    height: 42px;

    flex-basis: 42px;
  }

  .page-header__actions {
    flex-direction: column;
  }

  .page-header__actions .v-btn {
    width: 100%;
  }

  .alarm-item__icon {
    width: 38px;
    height: 38px;

    flex-basis: 38px;
  }

  .alarm-item {
    gap: 10px;
  }

  .alarm-item__message {
    white-space: normal;
  }

  .alarm-item__action {
    position: absolute;

    right: 12px;
    bottom: 12px;
  }

  .alarm-item__meta {
    padding-right: 34px;
  }
}
</style>