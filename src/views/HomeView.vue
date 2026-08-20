<template>
  <v-container fluid class="home-page pa-4 pa-md-6">
    <v-card class="welcome-card mb-6" rounded="xl" elevation="0">
      <div class="welcome-card__content">
        <div class="welcome-main">
          <div class="welcome-icon">
            <v-icon size="27"> mdi-view-dashboard-outline </v-icon>
          </div>

          <div class="welcome-text">
            <span class="welcome-eyebrow"> Panel operativo </span>

            <h1>Bienvenido, {{ nombreUsuario }}</h1>

            <p class="welcome-date">
              {{ fechaActual }}
            </p>
          </div>
        </div>

        <div class="welcome-status">
          <v-chip
            :color="conexionTinker ? 'success' : 'error'"
            variant="tonal"
            size="small"
            class="connection-chip"
          >
            <span
              class="connection-dot"
              :class="{
                'connection-dot--online': conexionTinker,
                'connection-dot--offline': !conexionTinker,
              }"
            />

            {{ conexionTinker ? 'TinkerBoard conectada' : 'TinkerBoard desconectada' }}
          </v-chip>

          <div class="update-status">
            <v-icon size="14"> mdi-clock-outline </v-icon>

            <span>
              {{ ultimaActualizacion ? `Actualizado ${ultimaActualizacion}` : 'Sin actualizar' }}
            </span>
          </div>

          <v-btn
            icon
            size="small"
            variant="tonal"
            color="primary"
            :loading="actualizando"
            @click="cargar"
          >
            <v-icon size="19"> mdi-refresh </v-icon>

            <v-tooltip activator="parent" location="bottom"> Actualizar información </v-tooltip>
          </v-btn>
        </div>
      </div>
    </v-card>

    <v-row class="mb-2">
      <v-col v-for="item in indicadoresResumen" :key="item.label" cols="6" sm="4" lg="2">
        <v-card class="summary-card" rounded="xl" elevation="0">
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

          <span class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="5">
        <v-card rounded="xl" elevation="0" class="dashboard-card h-100">
          <div class="card-header">
            <div class="card-header__main">
              <div class="card-header__icon">
                <v-icon size="21"> mdi-weather-partly-cloudy </v-icon>
              </div>

              <div>
                <h2>Clima actual</h2>

                <p>Condiciones meteorológicas en tiempo real</p>
              </div>
            </div>

            <v-chip size="small" color="primary" variant="tonal">
              <v-icon start size="14"> mdi-map-marker-outline </v-icon>

              {{ zonaClimaActual }}
            </v-chip>
          </div>

          <v-divider />

          <div v-if="meteo" class="weather-content">
            <div class="weather-main">
              <div class="weather-main__icon">
                <v-icon size="38"> mdi-thermometer </v-icon>
              </div>

              <div>
                <span> Temperatura </span>

                <div class="temperature-value">
                  {{ formatearNumero(meteo.temperatura) }}

                  <small>°C</small>
                </div>
              </div>

              <div class="weather-condition">
                <v-icon size="18" color="success"> mdi-access-point </v-icon>

                <span> Sensor activo </span>
              </div>
            </div>

            <div class="weather-grid">
              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--info">
                  <v-icon size="19"> mdi-water-percent </v-icon>
                </div>

                <div>
                  <span>Humedad</span>

                  <strong> {{ formatearNumero(meteo.humedad) }}% </strong>
                </div>
              </div>

              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--warning">
                  <v-icon size="19"> mdi-weather-windy </v-icon>
                </div>

                <div>
                  <span>Viento</span>

                  <strong>
                    {{ formatearNumero(meteo.velocidad_viento) }}
                    <small>km/h</small>
                  </strong>
                </div>
              </div>

              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--primary">
                  <v-icon size="19"> mdi-white-balance-sunny </v-icon>
                </div>

                <div>
                  <span>Radiación</span>

                  <strong>
                    {{ formatearNumero(meteo.radiacion_solar) }}
                    <small>W/m²</small>
                  </strong>
                </div>
              </div>

              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--primary">
                  <v-icon size="19"> mdi-gauge </v-icon>
                </div>

                <div>
                  <span>Presión</span>

                  <strong>
                    {{
                      meteo.presion_atmosferica != null
                        ? formatearNumero(meteo.presion_atmosferica)
                        : '--'
                    }}

                    <small>hPa</small>
                  </strong>
                </div>
              </div>
            </div>

            <div class="rain-card">
              <div class="rain-card__header">
                <div>
                  <span> Probabilidad de lluvia </span>

                  <strong
                    :class="{
                      'text-error': probabilidadLluvia > 60,
                    }"
                  >
                    {{ probabilidadLluvia }}%
                  </strong>
                </div>

                <v-icon :color="probabilidadLluvia > 60 ? 'error' : 'primary'" size="24">
                  {{ probabilidadLluvia > 60 ? 'mdi-weather-pouring' : 'mdi-weather-cloudy' }}
                </v-icon>
              </div>

              <v-progress-linear
                :model-value="probabilidadLluvia"
                :color="
                  probabilidadLluvia > 60
                    ? 'error'
                    : probabilidadLluvia > 35
                      ? 'warning'
                      : 'primary'
                "
                rounded
                height="6"
              />
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-state__icon">
              <v-icon size="40" color="primary"> mdi-weather-cloudy-alert </v-icon>
            </div>

            <h3>Sin datos meteorológicos</h3>

            <p>No fue posible obtener información del sensor.</p>
          </div>

          <v-divider />

          <div class="card-footer">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              to="/meteorologia"
              append-icon="mdi-arrow-right"
            >
              Ver meteorología completa
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card rounded="xl" elevation="0" class="dashboard-card h-100">
          <div class="card-header">
            <div class="card-header__main">
              <div class="card-header__icon">
                <v-icon size="21"> mdi-lightning-bolt-outline </v-icon>
              </div>

              <div>
                <h2>Accesos rápidos</h2>

                <p>Navegación frecuente</p>
              </div>
            </div>
          </div>

          <v-divider />

          <div class="quick-actions">
            <v-card
              v-for="accion in accionesRapidas"
              :key="accion.title"
              :to="accion.to"
              rounded="lg"
              elevation="0"
              class="quick-action"
            >
              <div class="quick-action__icon" :class="`quick-action__icon--${accion.color}`">
                <v-icon size="21">
                  {{ accion.icon }}
                </v-icon>
              </div>

              <div class="quick-action__content">
                <strong>
                  {{ accion.title }}
                </strong>

                <span>
                  {{ accion.subtitle }}
                </span>
              </div>

              <v-icon size="17" class="quick-action__arrow"> mdi-chevron-right </v-icon>
            </v-card>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card rounded="xl" elevation="0" class="dashboard-card h-100">
          <div class="card-header">
            <div class="card-header__main">
              <div class="card-header__icon">
                <v-icon size="21"> mdi-history </v-icon>
              </div>

              <div>
                <h2>Últimos eventos</h2>

                <p>Actividad reciente del sistema</p>
              </div>
            </div>

            <v-chip v-if="ultimosEventos.length > 0" size="x-small" variant="tonal" color="primary">
              {{ ultimosEventos.length }} recientes
            </v-chip>
          </div>

          <v-divider />

          <div v-if="ultimosEventos.length === 0" class="events-empty">
            <div class="empty-state__icon">
              <v-icon size="36" color="primary"> mdi-history </v-icon>
            </div>

            <h3>Sin eventos recientes</h3>

            <p>La actividad del sistema aparecerá aquí.</p>
          </div>

          <div v-else class="events-list">
            <div v-for="evento in ultimosEventos" :key="evento.id" class="event-item">
              <div
                class="event-item__icon"
                :class="`event-item__icon--${colorEvento(evento.accion)}`"
              >
                <v-icon size="19">
                  {{ iconEvento(evento.accion) }}
                </v-icon>
              </div>

              <div class="event-item__content">
                <div class="event-item__top">
                  <strong>
                    {{ evento.invernadero_nombre || 'Invernadero' }}
                  </strong>

                  <span>
                    {{ formatHora(evento.created_at) }}
                  </span>
                </div>

                <div class="event-item__bottom">
                  <span class="event-action">
                    {{ labelAccion(evento.accion) }}
                  </span>

                  <v-chip
                    size="x-small"
                    :color="evento.resultado === 'exitoso' ? 'success' : 'error'"
                    variant="tonal"
                  >
                    {{ evento.resultado === 'exitoso' ? 'Exitoso' : evento.resultado }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>

          <v-divider />

          <div class="card-footer">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              to="/eventos"
              append-icon="mdi-arrow-right"
            >
              Ver historial completo
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../stores/auth'
import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'
import api from '../api/axios'

const loadingStore = useLoadingStore()
const authStore = useAuthStore()
const invernaderosStore = useInvernaderosStore()

const { zonas } = storeToRefs(invernaderosStore)

const meteo = ref<any>(null)
const ultimosEventos = ref<any[]>([])
const conexionTinker = ref(false)
const actualizando = ref(false)
const ultimaActualizacion = ref('')
const zonaClimaActual = ref('Zona principal')

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

const nombreUsuario = computed(() => {
  const nombre = authStore.usuario?.nombre?.trim()

  return nombre || 'Operador'
})

const fechaActual = computed(() => {
  const fecha = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return fecha.charAt(0).toUpperCase() + fecha.slice(1)
})

const probabilidadLluvia = computed(() => {
  const valor = Number(meteo.value?.probabilidad_lluvia ?? 0)

  return Math.min(Math.max(Math.round(valor), 0), 100)
})

const indicadoresResumen = computed(() => [
  {
    label: 'Galpones',
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

const accionesRapidas = computed(() => {
  const acciones = [
    {
      title: 'Dashboard',
      subtitle: 'Resumen general',
      icon: 'mdi-view-dashboard-outline',
      color: 'primary',
      to: '/dashboard',
    },
    {
      title: 'Variadores',
      subtitle: 'Estado de equipos',
      icon: 'mdi-cog-transfer-outline',
      color: 'success',
      to: '/variadores',
    },
    {
      title: 'Meteorología',
      subtitle: 'Clima y sensores',
      icon: 'mdi-weather-partly-cloudy',
      color: 'info',
      to: '/meteorologia',
    },
    {
      title: 'Alarmas',
      subtitle: 'Alertas del sistema',
      icon: 'mdi-alert-outline',
      color: 'error',
      to: '/alarmas',
    },
    {
      title: 'Historial',
      subtitle: 'Eventos registrados',
      icon: 'mdi-history',
      color: 'warning',
      to: '/eventos',
    },
  ]

  if (authStore.isAdmin) {
    acciones.push({
      title: 'Configuración',
      subtitle: 'Ajustes del sistema',
      icon: 'mdi-cog-outline',
      color: 'secondary',
      to: '/configuracion',
    })
  }

  return acciones
})

const formatearNumero = (valor: number | string | null | undefined) => {
  const numero = Number(valor ?? 0)

  if (Number.isNaN(numero)) {
    return '0.0'
  }

  return numero.toFixed(1)
}

const formatHora = (fecha: string) => {
  if (!fecha) {
    return '--'
  }

  return new Date(fecha).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const colorEvento = (accion: string) => {
  if (accion === 'abrir') {
    return 'success'
  }

  if (accion === 'cerrar') {
    return 'error'
  }

  return 'warning'
}

const iconEvento = (accion: string) => {
  if (accion === 'abrir') {
    return 'mdi-arrow-up'
  }

  if (accion === 'cerrar') {
    return 'mdi-arrow-down'
  }

  return 'mdi-stop'
}

const labelAccion = (accion: string) => {
  if (accion === 'abrir') {
    return 'Apertura'
  }

  if (accion === 'cerrar') {
    return 'Cierre'
  }

  if (accion === 'detener') {
    return 'Detención'
  }

  return accion || 'Evento'
}

const cargar = async () => {
  if (actualizando.value) {
    return
  }

  actualizando.value = true

  try {
    const zonaId = zonas.value[0]?.id ?? 1

    zonaClimaActual.value = zonas.value[0]?.nombre ?? 'Zona principal'

    const [resumenResult, meteoResult, eventosResult] = await Promise.allSettled([
      api.get('/zonas/resumen'),
      api.get(`/tinker/ultimo-estado/${zonaId}`),
      api.get('/zonas/eventos?limit=5'),
    ])

    if (resumenResult.status === 'fulfilled' && resumenResult.value.data.ok) {
      Object.assign(resumen, resumenResult.value.data.data)
    }

    if (
      meteoResult.status === 'fulfilled' &&
      meteoResult.value.data.ok &&
      meteoResult.value.data.data.meteorologia
    ) {
      meteo.value = meteoResult.value.data.data.meteorologia

      conexionTinker.value = true
    } else {
      conexionTinker.value = false
    }

    if (eventosResult.status === 'fulfilled' && eventosResult.value.data.ok) {
      ultimosEventos.value = eventosResult.value.data.data ?? []
    }

    ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } finally {
    actualizando.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando sistema...')

  try {
    await invernaderosStore.cargarZonas()
    await cargar()

    intervalo = setInterval(cargar, 30000)
  } finally {
    loadingStore.ocultar()
  }
})

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo)
  }
})
</script>

<style scoped>
.home-page {
  max-width: 1600px;
  margin: 0 auto;
}

.welcome-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: linear-gradient(
    120deg,
    rgba(var(--v-theme-primary), 0.055),
    rgb(var(--v-theme-surface)) 45%
  );
}

.welcome-card__content {
  min-height: 108px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 22px;
}

.welcome-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.welcome-icon {
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.welcome-eyebrow {
  display: block;
  margin-bottom: 2px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-primary));
}

.welcome-text h1 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.welcome-date {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.56);
}

.welcome-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.connection-chip {
  font-weight: 600;
}

.connection-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  margin-right: 7px;
  border-radius: 50%;
}

.connection-dot--online {
  background: rgb(var(--v-theme-success));
  animation: connectionPulse 2s ease-in-out infinite;
}

.connection-dot--offline {
  background: rgb(var(--v-theme-error));
  animation: connectionPulse 1.3s ease-in-out infinite;
}

.update-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.summary-card {
  position: relative;
  min-height: 94px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 24px rgba(0, 0, 0, 0.055) !important;
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
  line-height: 1.15;
}

.summary-card__content span {
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.69rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.summary-card__accent {
  position: absolute;
  right: 0;
  top: 20px;
  bottom: 20px;
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

.dashboard-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.card-header {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 17px;
}

.card-header__main {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.card-header__icon {
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

.card-header h2 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.card-header p {
  margin: 2px 0 0;
  font-size: 0.65rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.weather-content {
  padding: 17px;
}

.weather-main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.05);
}

.weather-main__icon {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.weather-main span {
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.temperature-value {
  margin-top: 1px;
  font-size: 2rem;
  font-weight: 750;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.temperature-value small {
  margin-left: 2px;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.weather-condition {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.weather-condition span {
  font-size: 0.6rem;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.weather-metric {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.035);
}

.weather-metric__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
}

.weather-metric__icon--primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.weather-metric__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.weather-metric__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.weather-metric > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.weather-metric span {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.weather-metric strong {
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 700;
}

.weather-metric small {
  font-size: 0.58rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.rain-card {
  margin-top: 10px;
  padding: 12px 13px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.035);
}

.rain-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.rain-card__header > div {
  display: flex;
  flex-direction: column;
}

.rain-card__header span {
  font-size: 0.62rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.rain-card__header strong {
  margin-top: 1px;
  font-size: 0.9rem;
  font-weight: 700;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px;
}

.quick-action {
  min-height: 57px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  background: rgba(var(--v-theme-on-surface), 0.025);
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.quick-action:hover {
  transform: translateX(2px);
  border-color: rgba(var(--v-theme-primary), 0.15);
  background: rgba(var(--v-theme-primary), 0.045);
}

.quick-action__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.quick-action__icon--primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.quick-action__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.quick-action__icon--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.09);
}

.quick-action__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.quick-action__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.quick-action__icon--secondary {
  color: rgb(var(--v-theme-secondary));
  background: rgba(var(--v-theme-secondary), 0.09);
}

.quick-action__content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.quick-action__content strong {
  font-size: 0.75rem;
  font-weight: 650;
}

.quick-action__content span {
  margin-top: 1px;
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.46);
}

.quick-action__arrow {
  color: rgba(var(--v-theme-on-surface), 0.35);
}

.events-list {
  padding: 8px 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 62px;
  padding: 8px 5px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.4);
}

.event-item:last-child {
  border-bottom: 0;
}

.event-item__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.event-item__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.event-item__icon--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.09);
}

.event-item__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.event-item__content {
  min-width: 0;
  flex: 1;
}

.event-item__top,
.event-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.event-item__top strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.73rem;
  font-weight: 650;
}

.event-item__top > span {
  flex-shrink: 0;
  font-size: 0.57rem;
  color: rgba(var(--v-theme-on-surface), 0.42);
}

.event-item__bottom {
  margin-top: 4px;
}

.event-action {
  font-size: 0.62rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.card-footer {
  min-height: 50px;
  display: flex;
  align-items: center;
  padding: 6px 10px;
}

.empty-state,
.events-empty {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
}

.events-empty {
  min-height: 300px;
}

.empty-state__icon {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3,
.events-empty h3 {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
}

.empty-state p,
.events-empty p {
  max-width: 280px;
  margin: 5px 0 0;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
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

@keyframes connectionPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@media (max-width: 959px) {
  .welcome-card__content {
    align-items: flex-start;
  }

  .welcome-status {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .update-status {
    display: none;
  }
}

@media (max-width: 600px) {
  .home-page {
    padding: 14px !important;
  }

  .welcome-card {
    margin-bottom: 14px !important;
  }

  .welcome-card__content {
    min-height: auto;
    flex-direction: column;
    gap: 15px;
    padding: 16px;
  }

  .welcome-main {
    width: 100%;
    align-items: flex-start;
    gap: 11px;
  }

  .welcome-icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
    border-radius: 12px;
  }

  .welcome-text {
    min-width: 0;
  }

  .welcome-eyebrow {
    font-size: 0.6rem;
  }

  .welcome-text h1 {
    font-size: 1.22rem;
  }

  .welcome-date {
    margin-top: 5px;
    font-size: 0.68rem;
  }

  .welcome-status {
    width: 100%;
    justify-content: space-between;
  }

  .summary-card {
    min-height: 83px;
    padding: 12px;
    gap: 9px;
  }

  .summary-card__icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
    border-radius: 10px;
  }

  .summary-card__content strong {
    font-size: 1.2rem;
  }

  .summary-card__content span {
    font-size: 0.61rem;
  }

  .card-header {
    min-height: 68px;
    padding: 13px 14px;
  }

  .weather-content {
    padding: 13px;
  }

  .weather-main {
    padding: 14px;
  }

  .weather-condition {
    display: none;
  }

  .temperature-value {
    font-size: 1.7rem;
  }

  .weather-grid {
    gap: 7px;
  }

  .weather-metric {
    padding: 9px;
  }

  .weather-metric__icon {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
  }

  .quick-actions {
    padding: 10px;
  }

  .event-item__top {
    align-items: flex-start;
  }
}

@media (max-width: 380px) {
  .summary-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
