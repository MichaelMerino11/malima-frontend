<template>
  <v-container fluid class="dashboard-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-view-dashboard-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Dashboard</h1>

            <v-chip
              :color="resumen.en_movimiento > 0 ? 'warning' : 'success'"
              variant="tonal"
              size="small"
              class="system-status"
            >
              <span
                class="status-dot"
                :class="resumen.en_movimiento > 0 ? 'status-dot--warning' : 'status-dot--success'"
              />

              {{
                resumen.en_movimiento > 0
                  ? `${resumen.en_movimiento} en movimiento`
                  : 'Sistema estable'
              }}
            </v-chip>
          </div>

          <p class="page-subtitle">Monitoreo general del estado operativo de los galpones</p>
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
          :loading="actualizando"
          @click="cargarTodo"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <v-row class="mb-3">
      <v-col v-for="item in indicadores" :key="item.label" cols="6" sm="4" lg="2">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div class="summary-card__icon" :class="`summary-card__icon--${item.color}`">
            <v-icon
              size="23"
              :class="{
                rotating: item.rotating && Number(item.value) > 0,
              }"
            >
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

          <div class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <div class="section-header">
      <div>
        <div class="section-header__title">
          <div class="section-icon">
            <v-icon size="20"> mdi-greenhouse </v-icon>
          </div>

          <div>
            <h2>Zonas de operación</h2>

            <p>Estado en tiempo real de los galpones por zona</p>
          </div>
        </div>
      </div>

      <v-chip color="primary" variant="tonal" size="small">
        {{ zonas.length }}
        {{ zonas.length === 1 ? 'zona' : 'zonas' }}
      </v-chip>
    </div>

    <v-row v-if="actualizando && zonas.length === 0">
      <v-col v-for="i in 4" :key="i" cols="12" md="6">
        <v-skeleton-loader type="heading, paragraph, list-item-three-line" class="zone-skeleton" />
      </v-col>
    </v-row>

    <div v-else-if="zonas.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <v-icon size="42" color="primary"> mdi-greenhouse-off </v-icon>
      </div>

      <h3>No hay zonas disponibles</h3>

      <p>No se encontraron zonas configuradas en el sistema.</p>

      <v-btn
        color="primary"
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-refresh"
        @click="cargarTodo"
      >
        Volver a consultar
      </v-btn>
    </div>

    <v-row v-else>
      <v-col v-for="zona in zonas" :key="zona.id" cols="12" lg="6" xl="4">
        <v-card rounded="xl" elevation="0" class="zone-card">
          <div class="zone-card__header">
            <div class="zone-title">
              <div class="zone-title__icon">
                <v-icon size="22"> mdi-greenhouse </v-icon>
              </div>

              <div class="zone-title__text">
                <div class="d-flex align-center ga-2">
                  <h3>
                    {{ zona.nombre }}
                  </h3>

                  <span
                    class="zone-online-dot"
                    :class="{
                      'zone-online-dot--movement': conteoZona(zona, 'en_movimiento') > 0,
                    }"
                  />
                </div>

                <span>
                  {{ totalZona(zona) }}
                  {{ totalZona(zona) === 1 ? 'galpón registrado' : 'galpones registrados' }}
                </span>
              </div>
            </div>

            <div class="zone-actions">
              <v-tooltip text="Abrir todos los galpones" location="top">
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-btn
                      color="success"
                      variant="tonal"
                      rounded="lg"
                      size="small"
                      :icon="mobile"
                      disabled
                      @click="abrirZona(zona.id)"
                    >
                      <v-icon v-if="mobile" size="18"> mdi-arrow-up </v-icon>

                      <template v-else>
                        <v-icon start size="17"> mdi-arrow-up </v-icon>

                        Abrir todo
                      </template>
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>

              <v-tooltip text="Cerrar todos los galpones" location="top">
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-btn
                      color="error"
                      variant="tonal"
                      rounded="lg"
                      size="small"
                      :icon="mobile"
                      disabled
                      @click="cerrarZona(zona.id)"
                    >
                      <v-icon v-if="mobile" size="18"> mdi-arrow-down </v-icon>

                      <template v-else>
                        <v-icon start size="17"> mdi-arrow-down </v-icon>

                        Cerrar todo
                      </template>
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>
            </div>
          </div>

          <div class="zone-summary">
            <div class="zone-summary__item">
              <span class="zone-summary__label"> Abiertos </span>

              <div class="zone-summary__value text-success">
                <v-icon size="16"> mdi-arrow-up-circle-outline </v-icon>

                {{ conteoZona(zona, 'abierto') }}
              </div>
            </div>

            <div class="zone-summary__divider" />

            <div class="zone-summary__item">
              <span class="zone-summary__label"> Cerrados </span>

              <div class="zone-summary__value text-error">
                <v-icon size="16"> mdi-arrow-down-circle-outline </v-icon>

                {{ conteoCerrados(zona) }}
              </div>
            </div>

            <div class="zone-summary__divider" />

            <div class="zone-summary__item">
              <span class="zone-summary__label"> Movimiento </span>

              <div class="zone-summary__value text-warning">
                <v-icon
                  size="16"
                  :class="{
                    rotating: conteoZona(zona, 'en_movimiento') > 0,
                  }"
                >
                  mdi-cog-outline
                </v-icon>

                {{ conteoZona(zona, 'en_movimiento') }}
              </div>
            </div>
          </div>

          <div class="zone-progress">
            <div class="zone-progress__header">
              <span> Galpones abiertos </span>

              <strong> {{ porcentajeAbiertos(zona) }}% </strong>
            </div>

            <v-progress-linear
              :model-value="porcentajeAbiertos(zona)"
              color="success"
              height="6"
              rounded
            />
          </div>

          <v-divider />

          <div v-if="zona.invernaderos?.length" class="greenhouses-grid">
            <v-card
              v-for="inv in zona.invernaderos"
              :key="inv.id"
              :to="`/zona/${zona.id}`"
              elevation="0"
              rounded="lg"
              class="greenhouse-card"
              :class="`greenhouse-card--${estadoClase(inv.estado)}`"
            >
              <span
                class="greenhouse-card__status"
                :class="`greenhouse-card__status--${estadoClase(inv.estado)}`"
              />

              <div
                class="greenhouse-card__icon"
                :class="`greenhouse-card__icon--${estadoClase(inv.estado)}`"
              >
                <v-icon
                  size="21"
                  :class="{
                    rotating: inv.estado === 'en_movimiento',
                  }"
                >
                  {{ iconoEstado(inv.estado) }}
                </v-icon>
              </div>

              <div class="greenhouse-card__content">
                <strong>
                  {{ inv.nombre }}
                </strong>

                <div class="greenhouse-card__state">
                  <span class="state-dot" :class="`state-dot--${estadoClase(inv.estado)}`" />

                  {{ labelEstado(inv.estado) }}
                </div>
              </div>

              <v-icon size="17" class="greenhouse-card__arrow"> mdi-chevron-right </v-icon>
            </v-card>
          </div>

          <div v-else class="zone-empty">
            <v-icon size="34" color="medium-emphasis"> mdi-greenhouse-off </v-icon>

            <span> No hay galpones disponibles </span>
          </div>

          <v-divider />

          <div class="zone-card__footer">
            <span class="zone-footer-status">
              <v-icon size="14" color="success"> mdi-access-point </v-icon>

              Monitoreo activo
            </span>

            <v-btn
              variant="text"
              color="primary"
              size="small"
              :to="`/zona/${zona.id}`"
              append-icon="mdi-arrow-right"
            >
              Ver detalle
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'

import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'
import { useSocket } from '../composables/useSocket'
import api from '../api/axios'

const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()

const loadingStore = useLoadingStore()
const store = useInvernaderosStore()

const { zonas } = storeToRefs(store)
const { mobile } = useDisplay()

const actualizando = ref(false)
const ultimaActualizacion = ref('')

const resumen = reactive({
  total: 0,
  abiertos: 0,
  cerrados: 0,
  en_movimiento: 0,
  en_automatico: 0,
  en_remoto: 0,
  en_local: 0,
})

let intervalo: ReturnType<typeof setInterval> | undefined

const indicadores = computed(() => [
  {
    label: 'Total',
    value: resumen.total,
    icon: 'mdi-greenhouse',
    color: 'primary',
    rotating: false,
  },
  {
    label: 'Abiertos',
    value: resumen.abiertos,
    icon: 'mdi-arrow-up-circle-outline',
    color: 'success',
    rotating: false,
  },
  {
    label: 'Cerrados',
    value: resumen.cerrados,
    icon: 'mdi-arrow-down-circle-outline',
    color: 'error',
    rotating: false,
  },
  {
    label: 'En movimiento',
    value: resumen.en_movimiento,
    icon: 'mdi-cog-outline',
    color: 'warning',
    rotating: true,
  },
  {
    label: 'Automático',
    value: resumen.en_automatico,
    icon: 'mdi-robot-outline',
    color: 'info',
    rotating: false,
  },
  {
    label: 'Local',
    value: resumen.en_local,
    icon: 'mdi-hand-back-right-outline',
    color: 'secondary',
    rotating: false,
  },
])

const estadoClase = (estado: string) => {
  if (estado === 'abierto') {
    return 'success'
  }

  if (estado === 'en_movimiento') {
    return 'warning'
  }

  return 'error'
}

const iconoEstado = (estado: string) => {
  if (estado === 'abierto') {
    return 'mdi-arrow-up'
  }

  if (estado === 'en_movimiento') {
    return 'mdi-cog-outline'
  }

  return 'mdi-arrow-down'
}

const labelEstado = (estado: string) => {
  if (estado === 'abierto') {
    return 'Abierto'
  }

  if (estado === 'en_movimiento') {
    return 'En movimiento'
  }

  if (estado === 'cerrado') {
    return 'Cerrado'
  }

  return estado || 'Desconocido'
}

const totalZona = (zona: any) => {
  return zona.invernaderos?.length ?? 0
}

const conteoZona = (zona: any, estado: string) => {
  return zona.invernaderos?.filter((inv: any) => inv.estado === estado).length ?? 0
}

const conteoCerrados = (zona: any) => {
  return (
    zona.invernaderos?.filter(
      (inv: any) => inv.estado !== 'abierto' && inv.estado !== 'en_movimiento',
    ).length ?? 0
  )
}

const porcentajeAbiertos = (zona: any) => {
  const total = totalZona(zona)

  if (!total) {
    return 0
  }

  return Math.round((conteoZona(zona, 'abierto') / total) * 100)
}

const abrirZona = async (zonaId: number) => {
  await store.enviarComandoZona(zonaId, 'abrir')

  await store.cargarEstadoZona(zonaId)
}

const cerrarZona = async (zonaId: number) => {
  await store.enviarComandoZona(zonaId, 'cerrar')

  await store.cargarEstadoZona(zonaId)
}

const cargarResumen = async () => {
  try {
    const { data } = await api.get('/zonas/resumen')

    if (data.ok) {
      Object.assign(resumen, data.data)
    }
  } catch (error) {
    console.error('Error cargando resumen:', error)
  }
}

const cargarTodo = async () => {
  if (actualizando.value) {
    return
  }

  actualizando.value = true

  try {
    await store.cargarZonas()

    await Promise.all(zonas.value.map((zona) => store.cargarEstadoZona(zona.id)))

    await cargarResumen()

    ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    actualizando.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando invernaderos...')

  try {
    await cargarTodo()

    for (const zona of zonas.value) {
      unirseAZona(zona.id)
    }

    escuchar('estado-actualizado', async (data) => {
      if (data?.zona_id) {
        await store.cargarEstadoZona(data.zona_id)
      }

      await cargarResumen()

      ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    })

    intervalo = setInterval(cargarTodo, 30000)
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
.dashboard-page {
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
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.56);
}

.system-status {
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
}

.status-dot--success {
  background: rgb(var(--v-theme-success));
}

.status-dot--warning {
  background: rgb(var(--v-theme-warning));
  animation: statusPulse 1.5s ease-in-out infinite;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.47);
}

.summary-card {
  position: relative;
  min-height: 92px;
  display: flex;
  align-items: center;
  gap: 11px;
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

.summary-card__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.summary-card__icon--secondary {
  color: rgb(var(--v-theme-secondary));
  background: rgba(var(--v-theme-secondary), 0.09);
}

.summary-card__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.summary-card__content strong {
  font-size: 1.4rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-card__content span {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
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

.summary-card__accent--info {
  background: rgb(var(--v-theme-info));
}

.summary-card__accent--secondary {
  background: rgb(var(--v-theme-secondary));
}

.section-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 7px;
  margin-bottom: 5px;
}

.section-header__title {
  display: flex;
  align-items: center;
  gap: 11px;
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

.section-header h2 {
  margin: 0;
  font-size: 0.93rem;
  font-weight: 700;
}

.section-header p {
  margin: 2px 0 0;
  font-size: 0.67rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.zone-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.zone-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05) !important;
}

.zone-card__header {
  min-height: 75px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
}

.zone-title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.zone-title__icon {
  width: 39px;
  height: 39px;
  flex: 0 0 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.zone-title__text {
  min-width: 0;
}

.zone-title__text h3 {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.84rem;
  font-weight: 700;
}

.zone-title__text > span {
  display: block;
  margin-top: 2px;
  font-size: 0.62rem;
  color: rgba(var(--v-theme-on-surface), 0.47);
}

.zone-online-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
}

.zone-online-dot--movement {
  background: rgb(var(--v-theme-warning));
  animation: statusPulse 1.4s ease-in-out infinite;
}

.zone-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.zone-summary {
  display: flex;
  align-items: center;
  margin: 0 16px;
  padding: 11px 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.028);
}

.zone-summary__item {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.zone-summary__label {
  display: block;
  font-size: 0.58rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.zone-summary__value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 3px;
  font-size: 0.78rem;
  font-weight: 700;
}

.zone-summary__divider {
  width: 1px;
  height: 27px;
  background: rgba(var(--v-theme-on-surface), 0.09);
}

.zone-progress {
  padding: 13px 16px 16px;
}

.zone-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.zone-progress__header span {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.47);
}

.zone-progress__header strong {
  font-size: 0.65rem;
  font-weight: 700;
}

.greenhouses-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 13px;
}

.greenhouse-card {
  position: relative;
  min-width: 0;
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 8px 9px 10px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.45);
  background: rgb(var(--v-theme-surface));
  transition:
    transform 0.17s ease,
    border-color 0.17s ease,
    background-color 0.17s ease;
}

.greenhouse-card:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.025);
}

.greenhouse-card--warning {
  background: rgba(var(--v-theme-warning), 0.025);
}

.greenhouse-card__status {
  position: absolute;
  top: 13px;
  bottom: 13px;
  left: 0;
  width: 3px;
  border-radius: 0 4px 4px 0;
}

.greenhouse-card__status--success {
  background: rgb(var(--v-theme-success));
}

.greenhouse-card__status--warning {
  background: rgb(var(--v-theme-warning));
}

.greenhouse-card__status--error {
  background: rgb(var(--v-theme-error));
}

.greenhouse-card__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
}

.greenhouse-card__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.greenhouse-card__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.greenhouse-card__icon--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.09);
}

.greenhouse-card__content {
  min-width: 0;
  flex: 1;
}

.greenhouse-card__content strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.68rem;
  font-weight: 650;
}

.greenhouse-card__state {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.56rem;
  color: rgba(var(--v-theme-on-surface), 0.47);
}

.state-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.state-dot--success {
  background: rgb(var(--v-theme-success));
}

.state-dot--warning {
  background: rgb(var(--v-theme-warning));
}

.state-dot--error {
  background: rgb(var(--v-theme-error));
}

.greenhouse-card__arrow {
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), 0.3);
}

.zone-empty {
  min-height: 135px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 20px;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-card__footer {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 10px 6px 16px;
}

.zone-footer-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.empty-state {
  min-height: 330px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px 20px;
  text-align: center;
}

.empty-state__icon {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.empty-state p {
  margin: 5px 0 18px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.zone-skeleton {
  min-height: 300px;
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

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@media (max-width: 1263px) {
  .greenhouses-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 959px) {
  .page-header {
    align-items: flex-start;
  }

  .last-update {
    display: none;
  }

  .greenhouses-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .dashboard-page {
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;
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
    font-size: 1.22rem;
  }

  .page-subtitle {
    font-size: 0.74rem;
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions .v-btn {
    margin-left: auto;
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
    font-size: 0.61rem;
  }

  .section-header {
    min-height: 60px;
  }

  .section-header p {
    display: none;
  }

  .zone-card__header {
    padding: 12px;
  }

  .zone-summary {
    margin: 0 12px;
  }

  .zone-progress {
    padding: 12px 12px 14px;
  }

  .greenhouses-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 11px;
  }
}

@media (max-width: 420px) {
  .system-status {
    display: none;
  }

  .zone-title__text h3 {
    max-width: 130px;
  }

  .greenhouses-grid {
    grid-template-columns: 1fr;
  }

  .zone-card__footer {
    padding-left: 12px;
  }
}
</style>