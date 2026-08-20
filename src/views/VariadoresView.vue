<template>
  <v-container fluid class="variadores-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__left">
        <div class="page-header__icon">
          <v-icon size="27"> mdi-engine-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Control de variadores</h1>

            <v-chip color="success" variant="tonal" size="small" class="status-online">
              <span class="online-dot" />

              Tiempo real
            </v-chip>
          </div>

          <p class="page-subtitle">
            Monitoreo operativo de frecuencia, amperaje y estado por zona.
          </p>
        </div>
      </div>

      <div class="page-header__actions">
        <v-select
          v-model="zonaSeleccionada"
          :items="zonaItems"
          item-title="nombre"
          item-value="id"
          label="Zona"
          density="compact"
          variant="outlined"
          rounded="lg"
          hide-details
          prepend-inner-icon="mdi-map-marker-outline"
          class="zone-selector"
          @update:model-value="cambiarZona"
        />

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
      <!-- TOTAL -->
      <v-col cols="6" md="3">
        <v-card class="summary-card summary-card--primary" rounded="xl" elevation="0">
          <div class="summary-card__icon">
            <v-icon size="25"> mdi-engine </v-icon>
          </div>

          <div class="summary-card__info">
            <span class="summary-card__label"> Total </span>

            <strong class="summary-card__value">
              {{ totalVariadores }}
            </strong>

            <span class="summary-card__description"> Variadores registrados </span>
          </div>
        </v-card>
      </v-col>

      <!-- OPERACIÓN -->
      <v-col cols="6" md="3">
        <v-card class="summary-card summary-card--success" rounded="xl" elevation="0">
          <div class="summary-card__icon">
            <v-icon size="25"> mdi-play-circle-outline </v-icon>
          </div>

          <div class="summary-card__info">
            <span class="summary-card__label"> Operativos </span>

            <strong class="summary-card__value">
              {{ totalOperativos }}
            </strong>

            <span class="summary-card__description"> En funcionamiento </span>
          </div>
        </v-card>
      </v-col>

      <!-- MOVIMIENTO -->
      <v-col cols="6" md="3">
        <v-card class="summary-card summary-card--warning" rounded="xl" elevation="0">
          <div class="summary-card__icon">
            <v-icon size="25" :class="{ rotating: totalMovimiento > 0 }"> mdi-cog-outline </v-icon>
          </div>

          <div class="summary-card__info">
            <span class="summary-card__label"> En movimiento </span>

            <strong class="summary-card__value">
              {{ totalMovimiento }}
            </strong>

            <span class="summary-card__description"> Abriendo o cerrando </span>
          </div>
        </v-card>
      </v-col>

      <!-- ERROR -->
      <v-col cols="6" md="3">
        <v-card class="summary-card summary-card--error" rounded="xl" elevation="0">
          <div class="summary-card__icon">
            <v-icon size="25"> mdi-alert-circle-outline </v-icon>
          </div>

          <div class="summary-card__info">
            <span class="summary-card__label"> Con error </span>

            <strong class="summary-card__value">
              {{ totalErrores }}
            </strong>

            <span class="summary-card__description"> Requieren atención </span>
          </div>

          <span v-if="totalErrores > 0" class="summary-alert" />
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="main-panel">
      <!-- HEADER PANEL -->
      <div class="panel-header">
        <div class="panel-header__title">
          <div class="panel-icon">
            <v-icon size="21"> mdi-view-grid-outline </v-icon>
          </div>

          <div>
            <h2>Estado de variadores</h2>

            <p>
              {{ zonaActualNombre }}
              ·
              {{ variadores.length }}
              {{ variadores.length === 1 ? 'equipo' : 'equipos' }}
            </p>
          </div>
        </div>

        <div class="panel-header__status">
          <span class="live-indicator">
            <span class="live-indicator__dot" />

            Datos en vivo
          </span>

          <span class="update-info"> Actualización automática cada 10 s </span>
        </div>
      </div>

      <v-divider />

      <v-row v-if="cargando && variadores.length === 0" class="pa-4">
        <v-col v-for="i in 8" :key="i" cols="12" sm="6" lg="4" xl="3">
          <v-skeleton-loader type="heading, paragraph, list-item-two-line" class="skeleton-card" />
        </v-col>
      </v-row>

      <div v-else-if="variadores.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <v-icon size="46" color="primary"> mdi-engine-off-outline </v-icon>
        </div>

        <h3>No hay variadores disponibles</h3>

        <p>
          No se encontraron equipos configurados para
          {{ zonaActualNombre }}.
        </p>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          rounded="lg"
          @click="cargar"
        >
          Volver a consultar
        </v-btn>
      </div>

      <v-row v-else class="variadores-grid pa-4">
        <v-col v-for="variador in variadores" :key="variador.id" cols="12" sm="6" lg="4" xl="3">
          <v-card
            rounded="xl"
            elevation="0"
            class="variador-card"
            :class="`variador-card--${estadoClase(variador.estado)}`"
          >
            <!-- ESTADO LATERAL -->
            <span
              class="variador-status-line"
              :class="`variador-status-line--${estadoClase(variador.estado)}`"
            />

            <!-- CABECERA -->
            <div class="variador-card__header">
              <div class="variador-equipo">
                <div
                  class="variador-equipo__icon"
                  :class="`variador-equipo__icon--${estadoClase(variador.estado)}`"
                >
                  <v-icon
                    size="23"
                    :class="{
                      rotating: variador.estado === 'abriendo' || variador.estado === 'cerrando',
                    }"
                  >
                    mdi-cog-outline
                  </v-icon>
                </div>

                <div class="variador-equipo__text">
                  <span class="variador-name">
                    {{ variador.galpon_nombre || 'Sin galpón' }}
                  </span>

                  <span class="variador-id"> Variador #{{ variador.id }} </span>
                </div>
              </div>

              <v-chip
                :color="colorEstado(variador.estado)"
                variant="tonal"
                size="small"
                class="estado-chip"
              >
                <v-icon start size="14">
                  {{ iconEstado(variador.estado) }}
                </v-icon>

                {{ labelEstado(variador.estado) }}
              </v-chip>
            </div>

            <!-- FRECUENCIA PRINCIPAL -->
            <div class="frecuencia-section">
              <div class="frecuencia-section__header">
                <div>
                  <span class="metric-label"> Frecuencia actual </span>

                  <div class="frequency-value">
                    {{ formatearNumero(variador.hz) }}

                    <span> Hz </span>
                  </div>
                </div>

                <div class="frequency-percentage">{{ porcentajeHz(variador.hz) }}%</div>
              </div>

              <v-progress-linear
                :model-value="porcentajeHz(variador.hz)"
                :color="colorEstado(variador.estado)"
                rounded
                height="7"
                class="frequency-progress"
              />

              <div class="progress-scale">
                <span>0 Hz</span>
                <span>60 Hz</span>
              </div>
            </div>

            <!-- MÉTRICAS -->
            <div class="metrics-grid">
              <!-- AMPERAJE -->
              <div class="metric-box">
                <div class="metric-box__icon">
                  <v-icon size="18"> mdi-current-ac </v-icon>
                </div>

                <div>
                  <span class="metric-box__label"> Amperaje </span>

                  <strong>
                    {{ formatearNumero(variador.amperaje) }}
                    <small>A</small>
                  </strong>
                </div>
              </div>

              <!-- MODO -->
              <div class="metric-box">
                <div class="metric-box__icon">
                  <v-icon size="18"> mdi-tune-variant </v-icon>
                </div>

                <div>
                  <span class="metric-box__label"> Modo </span>

                  <strong class="text-capitalize">
                    {{ variador.modo || 'N/D' }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- FOOTER -->
            <div class="variador-card__footer">
              <div class="communication-status">
                <span
                  class="communication-status__dot"
                  :class="{
                    'communication-status__dot--error': variador.estado === 'error',
                  }"
                />

                {{ variador.estado === 'error' ? 'Revisar equipo' : 'Comunicación activa' }}
              </div>

              <v-tooltip text="Información actualizada automáticamente" location="top">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="17" color="medium-emphasis">
                    mdi-access-point
                  </v-icon>
                </template>
              </v-tooltip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'
import { useSocket } from '../composables/useSocket'
import api from '../api/axios'

const invernaderosStore = useInvernaderosStore()
const loadingStore = useLoadingStore()

const { zonas } = storeToRefs(invernaderosStore)

const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()

const variadores = ref<any[]>([])
const cargando = ref(false)

const zonaSeleccionada = ref<number>(1)

const zonaItems = computed(() => zonas.value)

const totalVariadores = computed(() => {
  return variadores.value.length
})

const totalOperativos = computed(() => {
  return variadores.value.filter(
    (variador) => variador.estado !== 'detenido' && variador.estado !== 'error',
  ).length
})

const totalMovimiento = computed(() => {
  return variadores.value.filter(
    (variador) => variador.estado === 'abriendo' || variador.estado === 'cerrando',
  ).length
})

const totalErrores = computed(() => {
  return variadores.value.filter((variador) => variador.estado === 'error').length
})

const zonaActualNombre = computed(() => {
  const zona = zonas.value.find((item: any) => Number(item.id) === Number(zonaSeleccionada.value))

  return zona?.nombre || 'Zona seleccionada'
})

const colorEstado = (estado: string) => {
  switch (estado) {
    case 'abriendo':
    case 'cerrando':
      return 'warning'

    case 'error':
      return 'error'

    case 'detenido':
      return 'grey'

    default:
      return 'success'
  }
}

const estadoClase = (estado: string) => {
  switch (estado) {
    case 'abriendo':
    case 'cerrando':
      return 'warning'

    case 'error':
      return 'error'

    case 'detenido':
      return 'stopped'

    default:
      return 'success'
  }
}

const labelEstado = (estado: string) => {
  switch (estado) {
    case 'abriendo':
      return 'Abriendo'

    case 'cerrando':
      return 'Cerrando'

    case 'error':
      return 'Error'

    case 'detenido':
      return 'Detenido'

    case 'operando':
      return 'Operando'

    case 'activo':
      return 'Activo'

    default:
      return estado || 'Desconocido'
  }
}

const iconEstado = (estado: string) => {
  switch (estado) {
    case 'abriendo':
      return 'mdi-arrow-expand-horizontal'

    case 'cerrando':
      return 'mdi-arrow-collapse-horizontal'

    case 'error':
      return 'mdi-alert-circle-outline'

    case 'detenido':
      return 'mdi-stop-circle-outline'

    default:
      return 'mdi-check-circle-outline'
  }
}

const formatearNumero = (value: number | string | null | undefined) => {
  const numero = Number(value ?? 0)

  if (Number.isNaN(numero)) {
    return '0.0'
  }

  return numero.toFixed(1)
}

const porcentajeHz = (value: number | string | null | undefined) => {
  const hz = Number(value ?? 0)

  if (Number.isNaN(hz)) {
    return 0
  }

  return Math.min(Math.max(Math.round((hz / 60) * 100), 0), 100)
}

const cargar = async () => {
  if (!zonaSeleccionada.value) {
    variadores.value = []
    return
  }

  cargando.value = true

  try {
    const { data } = await api.get(`/zonas/${zonaSeleccionada.value}/variadores`)

    if (data.ok) {
      variadores.value = data.data ?? []
    } else {
      variadores.value = []
    }
  } catch (error) {
    console.error('Error cargando variadores:', error)

    variadores.value = []
  } finally {
    cargando.value = false
  }
}

const cambiarZona = async () => {
  if (!zonaSeleccionada.value) {
    return
  }

  unirseAZona(zonaSeleccionada.value)

  await cargar()
}

let intervalo: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  loadingStore.mostrar('Cargando variadores...')

  try {
    await invernaderosStore.cargarZonas()

    zonaSeleccionada.value = zonas.value[0]?.id ?? 1

    await cargar()

    unirseAZona(zonaSeleccionada.value)

    escuchar('estado-actualizado', cargar)

    intervalo = setInterval(cargar, 10000)
  } finally {
    loadingStore.ocultar()
  }
})

onUnmounted(() => {
  dejarDeEscuchar('estado-actualizado')

  if (intervalo) {
    clearInterval(intervalo)
  }
})
</script>

<style scoped>
.variadores-page {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 24px;
}

.page-header__left {
  display: flex;
  align-items: center;

  gap: 14px;
}

.page-header__icon {
  width: 48px;
  height: 48px;

  flex: 0 0 48px;

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
  line-height: 1.25;

  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 4px 0 0;

  font-size: 0.86rem;

  color: rgba(var(--v-theme-on-surface), 0.6);
}

.page-header__actions {
  display: flex;
  align-items: center;

  gap: 10px;
}

.zone-selector {
  width: 220px;
}

.status-online {
  font-weight: 600;
}

.online-dot {
  width: 7px;
  height: 7px;

  display: inline-block;

  margin-right: 7px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));

  box-shadow: 0 0 0 4px rgba(var(--v-theme-success), 0.1);
}

.summary-card {
  position: relative;

  min-height: 116px;

  display: flex;
  align-items: center;

  gap: 15px;

  padding: 18px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.055) !important;
}

.summary-card__icon {
  width: 48px;
  height: 48px;

  flex: 0 0 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;
}

.summary-card__info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.summary-card__label {
  font-size: 0.76rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.summary-card__value {
  margin-top: 2px;

  font-size: 1.65rem;
  font-weight: 750;
  line-height: 1.15;
}

.summary-card__description {
  margin-top: 2px;

  font-size: 0.69rem;

  white-space: nowrap;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

/* PRIMARY */

.summary-card--primary .summary-card__icon {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.summary-card--primary .summary-card__value {
  color: rgb(var(--v-theme-primary));
}

/* SUCCESS */

.summary-card--success .summary-card__icon {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.summary-card--success .summary-card__value {
  color: rgb(var(--v-theme-success));
}

/* WARNING */

.summary-card--warning .summary-card__icon {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.11);
}

.summary-card--warning .summary-card__value {
  color: rgb(var(--v-theme-warning));
}

/* ERROR */

.summary-card--error .summary-card__icon {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.summary-card--error .summary-card__value {
  color: rgb(var(--v-theme-error));
}

.summary-alert {
  position: absolute;

  top: 22px;
  right: 0;
  bottom: 22px;

  width: 4px;

  border-radius: 6px 0 0 6px;

  background: rgb(var(--v-theme-error));
}

.main-panel {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.panel-header {
  min-height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 16px 20px;
}

.panel-header__title {
  display: flex;
  align-items: center;

  gap: 12px;
}

.panel-icon {
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

.panel-header__title h2 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.panel-header__title p {
  margin: 2px 0 0;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

.panel-header__status {
  display: flex;
  align-items: center;

  gap: 12px;
}

.live-indicator {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  padding: 6px 10px;

  border-radius: 20px;

  font-size: 0.7rem;
  font-weight: 600;

  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.08);
}

.live-indicator__dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));

  animation: livePulse 1.8s ease-in-out infinite;
}

.update-info {
  font-size: 0.68rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.variadores-grid {
  margin: 0;
}

.variador-card {
  position: relative;

  height: 100%;

  padding: 17px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), 0.65);

  background: rgb(var(--v-theme-surface));

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.variador-card:hover {
  transform: translateY(-2px);

  border-color: rgba(var(--v-theme-primary), 0.25);

  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.055) !important;
}

.variador-card--error {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-error), 0.035),
    rgb(var(--v-theme-surface)) 55%
  );
}

.variador-card--warning {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-warning), 0.035),
    rgb(var(--v-theme-surface)) 55%
  );
}

.variador-status-line {
  position: absolute;

  top: 17px;
  bottom: 17px;
  left: 0;

  width: 3px;

  border-radius: 0 4px 4px 0;
}

.variador-status-line--success {
  background: rgb(var(--v-theme-success));
}

.variador-status-line--warning {
  background: rgb(var(--v-theme-warning));
}

.variador-status-line--error {
  background: rgb(var(--v-theme-error));
}

.variador-status-line--stopped {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

.variador-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 10px;
}

.variador-equipo {
  display: flex;
  align-items: center;

  gap: 10px;

  min-width: 0;
}

.variador-equipo__icon {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.variador-equipo__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.variador-equipo__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.11);
}

.variador-equipo__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.variador-equipo__icon--stopped {
  color: rgba(var(--v-theme-on-surface), 0.5);

  background: rgba(var(--v-theme-on-surface), 0.06);
}

.variador-equipo__text {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.variador-name {
  max-width: 150px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.84rem;
  font-weight: 700;
}

.variador-id {
  margin-top: 1px;

  font-size: 0.67rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.estado-chip {
  flex-shrink: 0;

  font-size: 0.65rem;
  font-weight: 600;
}

.frecuencia-section {
  margin-top: 22px;
}

.frecuencia-section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 12px;
}

.metric-label {
  display: block;

  margin-bottom: 2px;

  font-size: 0.68rem;
  font-weight: 500;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

.frequency-value {
  font-size: 1.8rem;
  font-weight: 750;
  line-height: 1.15;

  letter-spacing: -0.03em;
}

.frequency-value span {
  margin-left: 2px;

  font-size: 0.72rem;
  font-weight: 500;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.frequency-percentage {
  padding-bottom: 3px;

  font-size: 0.72rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.frequency-progress {
  margin-top: 9px;
}

.progress-scale {
  display: flex;
  justify-content: space-between;

  margin-top: 4px;

  font-size: 0.58rem;

  color: rgba(var(--v-theme-on-surface), 0.38);
}

.metrics-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 8px;

  margin-top: 16px;
}

.metric-box {
  display: flex;
  align-items: center;

  gap: 9px;

  min-width: 0;

  padding: 10px;

  border-radius: 11px;

  background: rgba(var(--v-theme-on-surface), 0.035);
}

.metric-box__icon {
  width: 31px;
  height: 31px;

  flex: 0 0 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.075);
}

.metric-box > div:last-child {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.metric-box__label {
  font-size: 0.61rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.metric-box strong {
  margin-top: 1px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.79rem;
  font-weight: 700;
}

.metric-box small {
  font-size: 0.6rem;
  font-weight: 500;

  color: rgba(var(--v-theme-on-surface), 0.45);
}

.variador-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: 15px;
  padding-top: 11px;

  border-top: 1px solid rgba(var(--v-border-color), 0.45);
}

.communication-status {
  display: flex;
  align-items: center;

  gap: 6px;

  font-size: 0.62rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.communication-status__dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));
}

.communication-status__dot--error {
  background: rgb(var(--v-theme-error));
}

.empty-state {
  min-height: 340px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 42px 20px;

  text-align: center;
}

.empty-state__icon {
  width: 82px;
  height: 82px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 15px;

  border-radius: 50%;

  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;

  font-size: 1rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 410px;

  margin: 6px 0 18px;

  font-size: 0.8rem;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

/* =========================================================
   SKELETON
========================================================= */

.skeleton-card {
  min-height: 260px;

  border: 1px solid rgba(var(--v-border-color), 0.4);

  border-radius: 16px;
}

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

@keyframes livePulse {
  0%,
  100% {
    opacity: 1;

    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.3);
  }

  50% {
    opacity: 0.65;

    box-shadow: 0 0 0 5px rgba(var(--v-theme-success), 0);
  }
}

@media (max-width: 959px) {
  .page-header {
    align-items: flex-start;
  }

  .page-header__actions {
    flex-shrink: 0;
  }

  .zone-selector {
    width: 180px;
  }

  .panel-header__status {
    flex-direction: column;
    align-items: flex-end;

    gap: 4px;
  }
}

@media (max-width: 700px) {
  .variadores-page {
    padding: 16px !important;
  }

  .page-header {
    flex-direction: column;

    gap: 16px;
  }

  .page-header__actions {
    width: 100%;
  }

  .zone-selector {
    flex: 1;
    width: auto;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.79rem;
  }

  .summary-card {
    min-height: 105px;

    padding: 14px;

    gap: 11px;
  }

  .summary-card__icon {
    width: 42px;
    height: 42px;

    flex-basis: 42px;
  }

  .summary-card__value {
    font-size: 1.45rem;
  }

  .summary-card__description {
    display: none;
  }

  .panel-header {
    align-items: flex-start;
  }

  .panel-header__status {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-header__actions {
    flex-direction: column;
  }

  .zone-selector {
    width: 100%;
  }

  .page-header__actions .v-btn {
    width: 100%;
  }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;

    gap: 8px;
  }

  .variador-card__header {
    align-items: flex-start;
  }

  .variador-name {
    max-width: 120px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
