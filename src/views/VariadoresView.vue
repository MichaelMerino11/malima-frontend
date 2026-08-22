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
            Monitoreo en tiempo real de los variadores asociados a cada nave.
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

    <v-row class="mb-5">
      <v-col v-for="item in indicadores" :key="item.label" cols="6" md="3">
        <v-card class="summary-card" rounded="xl" elevation="0">
          <div class="summary-card__icon" :class="`summary-card__icon--${item.color}`">
            <v-icon
              size="24"
              :class="{
                rotating: item.rotating && Number(item.value) > 0,
              }"
            >
              {{ item.icon }}
            </v-icon>
          </div>

          <div class="summary-card__info">
            <span class="summary-card__label">
              {{ item.label }}
            </span>

            <strong class="summary-card__value">
              {{ item.value }}
            </strong>

            <span class="summary-card__description">
              {{ item.description }}
            </span>
          </div>

          <span class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="main-panel">
      <div class="panel-header">
        <div class="panel-header__title">
          <div class="panel-icon">
            <v-icon size="21"> mdi-view-grid-outline </v-icon>
          </div>

          <div>
            <div class="d-flex align-center flex-wrap ga-2">
              <h2>Estado de variadores</h2>

              <v-chip color="primary" variant="tonal" size="x-small">
                {{ zonaActualNombre }}
              </v-chip>
            </div>

            <p>
              {{ variadores.length }}
              {{ variadores.length === 1 ? 'equipo asociado' : 'equipos asociados' }}
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

      <div v-if="zonaSeleccionada" class="distribution-bar">
        <div class="distribution-bar__left">
          <div
            class="distribution-icon"
            :class="zonaActualLetra === 'A' ? 'distribution-icon--a' : 'distribution-icon--b'"
          >
            <v-icon size="19"> mdi-sitemap-outline </v-icon>
          </div>

          <div class="distribution-info">
            <span> Distribución de {{ zonaActualNombre }} </span>

            <strong>
              {{ distribucionActual }}
            </strong>
          </div>
        </div>

        <div class="distribution-bar__right">
          <v-chip
            :color="zonaActualLetra === 'A' ? 'primary' : 'info'"
            variant="tonal"
            size="small"
          >
            <v-icon start size="14"> mdi-greenhouse </v-icon>

            {{ zonaActualLetra === 'A' ? 'Naves impares' : 'Naves pares' }}
          </v-chip>
        </div>
      </div>

      <v-divider />

      <v-row v-if="cargando && variadores.length === 0" class="pa-4">
        <v-col v-for="i in 7" :key="i" cols="12" sm="6" lg="4" xl="3">
          <v-skeleton-loader type="heading, paragraph, list-item-two-line" class="skeleton-card" />
        </v-col>
      </v-row>

      <div v-else-if="variadores.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <v-icon size="46" color="primary"> mdi-engine-off-outline </v-icon>
        </div>

        <h3>No hay variadores disponibles</h3>

        <p>
          No se encontraron equipos asociados a las naves de
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
            <span
              class="variador-status-line"
              :class="`variador-status-line--${estadoClase(variador.estado)}`"
            />

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
                    {{ nombreNave(variador) }}
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

            <div class="metrics-grid">
              <div class="metric-box">
                <div class="metric-box__icon">
                  <v-icon size="18"> mdi-current-ac </v-icon>
                </div>

                <div>
                  <span class="metric-box__label"> Amperaje </span>

                  <strong>
                    {{ formatearNumero(variador.amperaje) }}

                    <small> A </small>
                  </strong>
                </div>
              </div>

              <div class="metric-box">
                <div class="metric-box__icon">
                  <v-icon size="18"> mdi-tune-variant </v-icon>
                </div>

                <div>
                  <span class="metric-box__label"> Modo </span>

                  <strong class="text-capitalize">
                    {{ labelModo(variador.modo) }}
                  </strong>
                </div>
              </div>
            </div>

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
                <template #activator="{ props: tooltipProps }">
                  <v-icon v-bind="tooltipProps" size="17" color="medium-emphasis">
                    mdi-access-point
                  </v-icon>
                </template>
              </v-tooltip>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider />

      <div class="panel-footer">
        <div class="panel-footer__status">
          <v-icon size="16" color="success"> mdi-access-point </v-icon>

          <span> Monitoreo activo </span>
        </div>

        <div class="panel-footer__info">
          <span>
            {{ zonaActualNombre }}
          </span>

          <span class="footer-dot" />

          <span> {{ variadores.length }} de 7 equipos encontrados </span>
        </div>
      </div>
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

const variadoresFuente = ref<any[]>([])

const cargando = ref(false)

const zonaSeleccionada = ref<number | null>(null)

let intervalo: ReturnType<typeof setInterval> | undefined

const NAVE_MIN = 1
const NAVE_MAX = 14

const normalizarTexto = (valor: unknown) => {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const obtenerLetraZona = (zona: any): 'A' | 'B' | null => {
  const nombre = normalizarTexto(zona?.nombre)

  if (nombre === 'a' || nombre.includes('zona a')) {
    return 'A'
  }

  if (nombre === 'b' || nombre.includes('zona b')) {
    return 'B'
  }

  return null
}

const zonaItems = computed(() => {
  return zonas.value
    .filter((zona: any) => {
      return Boolean(obtenerLetraZona(zona))
    })
    .map((zona: any) => ({
      ...zona,

      nombre: obtenerLetraZona(zona) === 'A' ? 'Zona A' : 'Zona B',
    }))
    .sort((a: any, b: any) => {
      return String(a.nombre).localeCompare(String(b.nombre))
    })
})

const zonaActual = computed(() => {
  return zonaItems.value.find((zona: any) => Number(zona.id) === Number(zonaSeleccionada.value))
})

const zonaActualLetra = computed<'A' | 'B' | null>(() => {
  return obtenerLetraZona(zonaActual.value)
})

const zonaActualNombre = computed(() => {
  if (zonaActualLetra.value === 'A') {
    return 'Zona A'
  }

  if (zonaActualLetra.value === 'B') {
    return 'Zona B'
  }

  return 'Zona seleccionada'
})

const distribucionActual = computed(() => {
  if (zonaActualLetra.value === 'A') {
    return 'Naves 1 · 3 · 5 · 7 · 9 · 11 · 13'
  }

  if (zonaActualLetra.value === 'B') {
    return 'Naves 2 · 4 · 6 · 8 · 10 · 12 · 14'
  }

  return 'Sin distribución definida'
})

const numeroNave = (variador: any): number | null => {
  const candidatos = [
    variador?.numero_nave,
    variador?.numeroNave,
    variador?.nave_numero,

    variador?.galpon_numero,
    variador?.numero_galpon,

    variador?.invernadero_numero,

    variador?.galpon_nombre,
    variador?.invernadero_nombre,
    variador?.nave_nombre,

    variador?.nombre,
    variador?.codigo,
  ]

  for (const candidato of candidatos) {
    if (candidato === null || candidato === undefined) {
      continue
    }

    if (typeof candidato === 'number') {
      if (Number.isFinite(candidato)) {
        return candidato
      }

      continue
    }

    const texto = String(candidato)

    const coincidencia = texto.match(/\d+/)

    if (coincidencia) {
      const numero = Number(coincidencia[0])

      if (Number.isFinite(numero)) {
        return numero
      }
    }
  }

  /*
   * Fallback temporal:
   * si el backend no devuelve número
   * de nave pero el ID del variador
   * coincide con 1-14, podemos usarlo.
   *
   * Cuando la BD quede normalizada,
   * este fallback se puede retirar.
   */
  const id = Number(variador?.id)

  if (Number.isFinite(id) && id >= NAVE_MIN && id <= NAVE_MAX) {
    return id
  }

  return null
}

const esNaveOperativa = (variador: any) => {
  const numero = numeroNave(variador)

  return numero !== null && numero >= NAVE_MIN && numero <= NAVE_MAX
}

const variadoresUnicos = computed(() => {
  const mapa = new Map<number, any>()

  for (const variador of variadoresFuente.value) {
    if (!esNaveOperativa(variador)) {
      continue
    }

    const numero = numeroNave(variador)

    if (numero === null) {
      continue
    }

    const existente = mapa.get(numero)

    if (!existente) {
      mapa.set(numero, variador)

      continue
    }

    /*
     * Si accidentalmente el backend
     * devuelve la misma nave desde
     * más de una zona, preferimos
     * el registro que tenga más datos
     * operativos disponibles.
     */
    const puntuacionExistente = calidadVariador(existente)

    const puntuacionNuevo = calidadVariador(variador)

    if (puntuacionNuevo > puntuacionExistente) {
      mapa.set(numero, variador)
    }
  }

  return Array.from(mapa.entries())
    .sort(([numeroA], [numeroB]) => numeroA - numeroB)
    .map(([, variador]) => variador)
})

const variadores = computed(() => {
  const letra = zonaActualLetra.value

  if (!letra) {
    return []
  }

  return variadoresUnicos.value
    .filter((variador) => {
      const numero = numeroNave(variador)

      if (numero === null) {
        return false
      }

      if (letra === 'A') {
        return numero % 2 !== 0
      }

      return numero % 2 === 0
    })
    .sort((a, b) => Number(numeroNave(a) ?? 0) - Number(numeroNave(b) ?? 0))
})

const calidadVariador = (variador: any) => {
  let puntos = 0

  if (variador?.estado) {
    puntos++
  }

  if (variador?.hz !== null && variador?.hz !== undefined) {
    puntos++
  }

  if (variador?.amperaje !== null && variador?.amperaje !== undefined) {
    puntos++
  }

  if (variador?.modo) {
    puntos++
  }

  return puntos
}

const totalVariadores = computed(() => {
  return variadores.value.length
})

const totalOperativos = computed(() => {
  return variadores.value.filter((variador) => {
    const estado = normalizarTexto(variador.estado)

    return estado !== 'detenido' && estado !== 'error'
  }).length
})

const totalMovimiento = computed(() => {
  return variadores.value.filter((variador) => {
    const estado = normalizarTexto(variador.estado)

    return estado === 'abriendo' || estado === 'cerrando' || estado === 'en_movimiento'
  }).length
})

const totalErrores = computed(() => {
  return variadores.value.filter((variador) => normalizarTexto(variador.estado) === 'error').length
})

const indicadores = computed(() => [
  {
    label: 'Total',

    value: totalVariadores.value,

    description: 'Variadores de la zona',

    icon: 'mdi-engine',

    color: 'primary',

    rotating: false,
  },

  {
    label: 'Operativos',

    value: totalOperativos.value,

    description: 'En funcionamiento',

    icon: 'mdi-play-circle-outline',

    color: 'success',

    rotating: false,
  },

  {
    label: 'En movimiento',

    value: totalMovimiento.value,

    description: 'Abriendo o cerrando',

    icon: 'mdi-cog-outline',

    color: 'warning',

    rotating: true,
  },

  {
    label: 'Con error',

    value: totalErrores.value,

    description: 'Requieren atención',

    icon: 'mdi-alert-circle-outline',

    color: 'error',

    rotating: false,
  },
])

const nombreNave = (variador: any) => {
  const numero = numeroNave(variador)

  if (numero !== null) {
    return `Nave ${numero}`
  }

  const nombre = String(
    variador?.galpon_nombre ?? variador?.invernadero_nombre ?? variador?.nave_nombre ?? '',
  ).trim()

  if (nombre) {
    return nombre.replace(/galp[oó]n/gi, 'Nave').replace(/invernadero/gi, 'Nave')
  }

  return 'Nave sin identificar'
}

const colorEstado = (estado: string) => {
  switch (normalizarTexto(estado)) {
    case 'abriendo':
    case 'cerrando':
    case 'en_movimiento':
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
  switch (normalizarTexto(estado)) {
    case 'abriendo':
    case 'cerrando':
    case 'en_movimiento':
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
  switch (normalizarTexto(estado)) {
    case 'abriendo':
      return 'Abriendo'

    case 'cerrando':
      return 'Cerrando'

    case 'en_movimiento':
      return 'En movimiento'

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
  switch (normalizarTexto(estado)) {
    case 'abriendo':
      return 'mdi-arrow-up-circle-outline'

    case 'cerrando':
      return 'mdi-arrow-down-circle-outline'

    case 'en_movimiento':
      return 'mdi-cog-outline'

    case 'error':
      return 'mdi-alert-circle-outline'

    case 'detenido':
      return 'mdi-stop-circle-outline'

    default:
      return 'mdi-check-circle-outline'
  }
}

const labelModo = (modo: string | null | undefined) => {
  const valor = normalizarTexto(modo)

  if (valor === 'automatico' || valor === 'automatica') {
    return 'Automático'
  }

  if (valor === 'remoto') {
    return 'Remoto'
  }

  if (valor === 'local') {
    return 'Local'
  }

  return modo || 'N/D'
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

const cargarVariadoresTodasLasZonas = async () => {
  const zonasBackend = zonas.value

  if (zonasBackend.length === 0) {
    variadoresFuente.value = []

    return
  }

  const resultados = await Promise.allSettled(
    zonasBackend.map((zona) => api.get(`/zonas/${zona.id}/variadores`)),
  )

  const acumulados: any[] = []

  for (const resultado of resultados) {
    if (resultado.status !== 'fulfilled') {
      continue
    }

    const data = resultado.value.data

    if (!data?.ok) {
      continue
    }

    if (Array.isArray(data.data)) {
      acumulados.push(...data.data)
    }
  }

  variadoresFuente.value = acumulados
}

const cargar = async () => {
  if (cargando.value) {
    return
  }

  cargando.value = true

  try {
    /*
     * Temporalmente consultamos todas
     * las zonas existentes porque la
     * base de datos todavía puede tener
     * Naves 1-14 distribuidas entre
     * Zona A, B, C y D.
     *
     * Después las reorganizamos:
     *
     * Zona A -> impares
     * Zona B -> pares
     */
    await cargarVariadoresTodasLasZonas()
  } catch (error) {
    console.error('Error cargando variadores:', error)

    variadoresFuente.value = []
  } finally {
    cargando.value = false
  }
}

const cambiarZona = async () => {
  await cargar()
}

const suscribirseAZonas = () => {
  /*
   * Mientras C y D sigan existiendo
   * en el backend, también nos
   * suscribimos a ellas.
   *
   * De esta manera no perdemos una
   * actualización de una nave que
   * todavía esté asociada a una zona
   * antigua.
   */
  for (const zona of zonas.value) {
    unirseAZona(zona.id)
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando variadores...')

  try {
    await invernaderosStore.cargarZonas()

    const primeraZona = zonaItems.value[0]

    zonaSeleccionada.value = primeraZona?.id ?? null

    await cargar()

    suscribirseAZonas()

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

.page-header__actions {
  display: flex;
  align-items: center;

  gap: 10px;
}

.zone-selector {
  width: 220px;
}

.zone-selector :deep(.v-field__input) {
  font-size: 0.84rem;
}

.zone-selector :deep(.v-field-label) {
  font-size: 0.8rem;
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

  animation: livePulse 1.8s ease-in-out infinite;
}

.summary-card {
  position: relative;

  min-height: 105px;

  display: flex;
  align-items: center;

  gap: 13px;

  padding: 16px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.055) !important;
}

.summary-card__icon {
  width: 44px;
  height: 44px;

  flex: 0 0 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;
}

.summary-card__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.summary-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.summary-card__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.summary-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
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

  font-size: 1.5rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-card__description {
  margin-top: 3px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.72rem;

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

.summary-card__accent--warning {
  background: rgb(var(--v-theme-warning));
}

.summary-card__accent--error {
  background: rgb(var(--v-theme-error));
}

.main-panel {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.panel-header {
  min-height: 80px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 15px 18px;
}

.panel-header__title {
  display: flex;
  align-items: center;

  gap: 11px;
}

.panel-icon {
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

.panel-header__title h2 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.panel-header__title p {
  margin: 3px 0 0;

  font-size: 0.74rem;

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

  font-size: 0.72rem;
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
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.distribution-bar {
  min-height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 18px;

  padding: 10px 18px;

  background: rgba(var(--v-theme-primary), 0.025);
}

.distribution-bar__left {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 10px;
}

.distribution-icon {
  width: 36px;
  height: 36px;

  flex: 0 0 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.distribution-icon--a {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.distribution-icon--b {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.distribution-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.distribution-info span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.distribution-info strong {
  margin-top: 2px;

  font-size: 0.8rem;
  font-weight: 650;

  letter-spacing: 0.01em;
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
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 10px;
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

  background: rgba(var(--v-theme-warning), 0.1);
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
  margin-top: 2px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.estado-chip {
  flex-shrink: 0;

  font-size: 0.7rem;
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

  font-size: 0.72rem;
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

  font-size: 0.74rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.frequency-progress {
  margin-top: 9px;
}

.progress-scale {
  display: flex;
  justify-content: space-between;

  margin-top: 5px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.43);
}

.metrics-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 8px;

  margin-top: 16px;
}

.metric-box {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 9px;

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
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.metric-box strong {
  margin-top: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.8rem;
  font-weight: 700;
}

.metric-box small {
  font-size: 0.68rem;
  font-weight: 500;

  color: rgba(var(--v-theme-on-surface), 0.47);
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

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
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

.panel-footer {
  min-height: 54px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 8px 16px;
}

.panel-footer__status,
.panel-footer__info {
  display: flex;
  align-items: center;

  gap: 6px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.footer-dot {
  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: rgba(var(--v-theme-on-surface), 0.32);
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
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;

    gap: 15px;
  }

  .page-header__left {
    align-items: flex-start;
  }

  .page-header__icon {
    width: 42px;
    height: 42px;

    flex-basis: 42px;
  }

  .page-header__actions {
    width: 100%;
  }

  .zone-selector {
    flex: 1;

    width: auto;
  }

  .page-title {
    font-size: 1.22rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .summary-card {
    min-height: 92px;

    padding: 13px;

    gap: 10px;
  }

  .summary-card__icon {
    width: 39px;
    height: 39px;

    flex-basis: 39px;
  }

  .summary-card__value {
    font-size: 1.3rem;
  }

  .summary-card__description {
    display: none;
  }

  .panel-header {
    align-items: flex-start;

    padding: 13px 14px;
  }

  .panel-header__status {
    display: none;
  }

  .distribution-bar {
    padding: 10px 14px;
  }

  .distribution-bar__right {
    display: none;
  }

  .variadores-grid {
    padding: 12px !important;
  }

  .panel-footer {
    padding: 8px 13px;
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

    gap: 7px;
  }

  .distribution-info strong {
    font-size: 0.72rem;
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

  .panel-footer {
    align-items: flex-start;
    flex-direction: column;

    gap: 5px;
  }
}
</style>