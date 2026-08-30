<template>
  <v-container fluid class="live-page pa-4 pa-md-6">
    <!-- =========================
         HEADER
    ========================== -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-icon">
          <v-icon size="26"> mdi-chart-timeline-variant-shimmer </v-icon>
        </div>

        <div>
          <h1>Vista en tiempo real</h1>

          <p>Monitoreo en vivo del estado y actividad de las naves</p>
        </div>
      </div>

      <div class="page-header__right">
        <v-select
          v-model="zonaSeleccionada"
          :items="zonaItems"
          item-title="nombre"
          item-value="id"
          density="compact"
          variant="outlined"
          rounded="lg"
          hide-details
          label="Zona"
          prepend-inner-icon="mdi-map-marker-outline"
          class="zone-selector"
        />

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="actualizando"
          @click="cargar"
        >
          Actualizar
        </v-btn>

        <div class="last-update">
          <span></span>
          {{ textoUltimaActualizacion }}
        </div>
      </div>
    </div>

    <!-- =========================
         CLIMA
    ========================== -->
    <v-card rounded="xl" elevation="0" class="weather-card">
      <div class="weather-general">
        <div class="weather-main-icon" :class="`weather-main-icon--${condicionTipo}`">
          <v-icon size="35">
            {{ condicionIcono }}
          </v-icon>
        </div>

        <div>
          <span class="metric-label"> Condición general </span>

          <div class="weather-condition">
            {{ condicionTexto }}
          </div>

          <small>
            {{ condicionDescripcion }}
          </small>
        </div>
      </div>

      <div class="weather-divider"></div>

      <div class="weather-metrics">
        <div class="weather-metric">
          <v-icon color="error"> mdi-thermometer </v-icon>

          <div>
            <span>Temperatura</span>

            <strong>
              {{ meteo ? `${formatNum(meteo.temperatura)} °C` : '--' }}
            </strong>
          </div>
        </div>

        <div class="weather-metric">
          <v-icon color="info"> mdi-water-percent </v-icon>

          <div>
            <span>Humedad</span>

            <strong>
              {{ meteo ? `${formatNum(meteo.humedad)}%` : '--' }}
            </strong>
          </div>
        </div>

        <div class="weather-metric">
          <v-icon color="warning"> mdi-weather-windy </v-icon>

          <div>
            <span>Viento</span>

            <strong>
              {{ meteo ? `${formatNum(meteo.velocidad_viento)} km/h` : '--' }}
            </strong>
          </div>
        </div>

        <div class="weather-metric">
          <v-icon color="primary"> mdi-weather-rainy </v-icon>

          <div>
            <span>Lluvia</span>

            <strong>
              {{ meteo ? `${Math.round(Number(meteo.probabilidad_lluvia ?? 0))}%` : '--' }}
            </strong>
          </div>
        </div>

        <div class="weather-metric">
          <v-icon> mdi-gauge </v-icon>

          <div>
            <span>Presión</span>

            <strong>
              {{
                meteo?.presion_atmosferica ? `${formatNum(meteo.presion_atmosferica)} hPa` : '--'
              }}
            </strong>
          </div>
        </div>
      </div>
    </v-card>

    <!-- =========================
         CONTENIDO
    ========================== -->
    <div class="live-layout">
      <main class="live-main">
        <!-- KPI -->
        <v-card elevation="0" rounded="xl" class="kpi-card">
          <div v-for="item in kpis" :key="item.label" class="kpi-item">
            <div class="kpi-icon" :class="`kpi-icon--${item.tipo}`">
              <v-icon size="20">
                {{ item.icon }}
              </v-icon>
            </div>

            <div>
              <span>
                {{ item.label }}
              </span>

              <strong>
                {{ item.value }}
              </strong>
            </div>
          </div>

          <div class="kpi-item">
            <div class="kpi-icon">
              <v-icon size="20"> mdi-pulse </v-icon>
            </div>

            <div>
              <span>Latencia</span>

              <strong> {{ latencia }} ms </strong>
            </div>
          </div>
        </v-card>

        <!-- 3D -->
        <v-card rounded="xl" elevation="0" class="scene-card">
          <div class="scene-header">
            <div>
              <strong>
                {{ zonaActualNombre }}
              </strong>

              <span class="online-chip">
                <i></i>
                En línea
              </span>
            </div>

            <div class="scene-actions">
              <v-btn
                size="small"
                variant="text"
                icon="mdi-axis-arrow"
                title="Centrar cámara"
                @click="centrarCamara"
              />

              <v-btn
                size="small"
                variant="text"
                :icon="autoRotar ? 'mdi-rotate-3d' : 'mdi-rotate-3d-variant'"
                :title="autoRotar ? 'Detener rotación' : 'Rotación automática'"
                @click="autoRotar = !autoRotar"
              />
            </div>
          </div>

          <GreenhouseScene3D
            ref="scene3d"
            :naves="navesVista"
            :selected-id="naveSeleccionada?.id ?? null"
            :auto-rotate="autoRotar"
            @select="seleccionarNave"
          />

          <div class="scene-footer">
            <div class="legend">
              <strong> Estados </strong>

              <span>
                <i class="dot dot--green"></i>
                Abierta
              </span>

              <span>
                <i class="dot dot--red"></i>
                Cerrada
              </span>

              <span>
                <i class="dot dot--orange"></i>
                En movimiento
              </span>
            </div>

            <span class="scene-footer__hint"> Selecciona una nave para ver su información </span>
          </div>
        </v-card>
      </main>

      <!-- =========================
           SIDEBAR DERECHO
      ========================== -->
      <aside class="live-sidebar">
        <!-- EVENTOS -->
        <v-card rounded="xl" elevation="0" class="events-card">
          <div class="panel-title">
            <div>
              <v-icon color="primary" size="20"> mdi-access-point </v-icon>

              <strong> Eventos en tiempo real </strong>
            </div>

            <span class="live-text">
              <i></i>
              En vivo
            </span>
          </div>

          <div v-if="eventos.length" class="events-list">
            <div v-for="evento in eventos" :key="evento.id" class="event-item">
              <span class="event-time">
                {{ evento.hora }}
              </span>

              <span class="event-dot" :class="`event-dot--${evento.tipo}`"></span>

              <div class="event-content">
                <strong>
                  {{ evento.nave }}
                </strong>

                <span>
                  {{ evento.accion }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="events-empty">
            <v-icon size="32"> mdi-access-point-off </v-icon>

            <span> Esperando nuevos eventos... </span>
          </div>
        </v-card>

        <!-- DETALLE -->
        <v-card v-if="naveSeleccionada" rounded="xl" elevation="0" class="detail-card">
          <div class="panel-title detail-title">
            <div>
              <v-icon color="primary"> mdi-greenhouse </v-icon>

              <strong>
                Nave
                {{ naveSeleccionada.numero ?? naveSeleccionada.id }}
              </strong>

              <v-chip size="small" variant="tonal" :color="estadoUI(naveSeleccionada.estado).color">
                {{ estadoUI(naveSeleccionada.estado).label }}
              </v-chip>
            </div>

            <v-btn icon="mdi-close" size="small" variant="text" @click="naveSeleccionada = null" />
          </div>

          <div class="detail-grid">
            <div>
              <span>Estado</span>

              <strong>
                {{ estadoUI(naveSeleccionada.estado).label }}
              </strong>
            </div>

            <div>
              <span>Modo</span>

              <strong>
                {{ modoLabel(naveSeleccionada.modo) }}
              </strong>
            </div>

            <div>
              <span>Variadores</span>

              <strong>
                {{ variadoresNave(naveSeleccionada) }}
              </strong>
            </div>

            <div>
              <span>Grupo</span>

              <strong>
                {{ naveSeleccionada.grupo_id ? `G${naveSeleccionada.grupo_id}` : '—' }}
              </strong>
            </div>
          </div>

          <v-divider />

          <div class="telemetry">
            <div class="telemetry-title">
              <span> Telemetría en vivo </span>

              <i></i>
            </div>

            <div class="telemetry-grid">
              <div v-for="item in telemetriaActual" :key="item.label" class="telemetry-box">
                <span>
                  {{ item.label }}
                </span>

                <strong>
                  {{ item.value }}
                </strong>

                <div class="mini-chart">
                  <span
                    v-for="i in 10"
                    :key="i"
                    :style="{
                      height: `${12 + ((i * 13) % 22)}px`,
                    }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </aside>
    </div>
    <!-- PRUEBA TEMPORAL — borrar después -->
    <v-card
      rounded="xl"
      elevation="0"
      class="pa-4 mt-4"
      style="border: 1px dashed rgba(var(--v-border-color), 0.5)"
    >
      <p class="text-caption mb-3" style="color: rgba(var(--v-theme-on-surface), 0.5)">
        Simulador (prueba)
      </p>
      <div class="d-flex flex-wrap gap-2">
        <v-btn size="x-small" color="success" @click="simularEstado('abierto')"
          >Todas abiertas</v-btn
        >
        <v-btn size="x-small" color="error" @click="simularEstado('cerrado')">Todas cerradas</v-btn>
        <v-btn size="x-small" color="warning" @click="simularEstado('en_movimiento')"
          >En movimiento</v-btn
        >
        <v-btn size="x-small" color="success" variant="outlined" @click="simularClima('soleado')"
          >☀️ Soleado</v-btn
        >
        <v-btn size="x-small" color="warning" variant="outlined" @click="simularClima('nublado')"
          >☁️ Nublado</v-btn
        >
        <v-btn size="x-small" color="error" variant="outlined" @click="simularClima('lluvia')"
          >🌧️ Lluvia</v-btn
        >
        <v-btn size="x-small" color="info" variant="outlined" @click="simularClima('viento')"
          >💨 Viento</v-btn
        >
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'

import GreenhouseScene3D from '../components/GreenhouseScene3D.vue'

import { useInvernaderosStore } from '../stores/invernaderos'

import { useLoadingStore } from '../stores/loading'

import { useSocket } from '../composables/useSocket'

import api from '../api/axios'

const store = useInvernaderosStore()

const loadingStore = useLoadingStore()

const { zonas } = storeToRefs(store)

const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()

const zonaSeleccionada = ref<number | null>(null)

const naveSeleccionada = ref<any>(null)

const meteo = ref<any>(null)

const actualizando = ref(false)

const autoRotar = ref(false)

const latencia = ref(0)

const ultimaActualizacion = ref<Date | null>(null)

const scene3d = ref<any>(null)

const eventos = ref<any[]>([])

let intervalo: ReturnType<typeof setInterval> | undefined

const normalizarTexto = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

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

const zonaItems = computed(() =>
  zonas.value
    .filter((zona: any) => Boolean(obtenerLetraZona(zona)))
    .map((zona: any) => ({
      ...zona,

      nombre: obtenerLetraZona(zona) === 'A' ? 'Zona A' : 'Zona B',
    }))
    .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)),
)

const zonaActual = computed(() =>
  zonaItems.value.find((zona: any) => Number(zona.id) === Number(zonaSeleccionada.value)),
)

const zonaActualNombre = computed(() => zonaActual.value?.nombre ?? 'Zona')

const navesVista = computed(() => {
  const zona = zonas.value.find((item: any) => Number(item.id) === Number(zonaSeleccionada.value))

  const letra = obtenerLetraZona(zona)

  if (!zona || !letra) {
    return []
  }

  return (zona.invernaderos ?? [])
    .filter((nave: any) => {
      const numero = Number(nave.numero)

      return letra === 'A' ? numero % 2 !== 0 : numero % 2 === 0
    })
    .sort((a: any, b: any) => Number(a.numero) - Number(b.numero))
})

const estadoNormalizado = (estado: unknown) => {
  const value = normalizarTexto(estado)

  if (value === 'abierto' || value === 'abierta') {
    return 'abierto'
  }

  if (value === 'cerrado' || value === 'cerrada') {
    return 'cerrado'
  }

  if (value.includes('movimiento') || value === 'abriendo' || value === 'cerrando') {
    return 'en_movimiento'
  }

  return 'desconocido'
}

const abiertas = computed(
  () => navesVista.value.filter((nave: any) => estadoNormalizado(nave.estado) === 'abierto').length,
)

const cerradas = computed(
  () => navesVista.value.filter((nave: any) => estadoNormalizado(nave.estado) === 'cerrado').length,
)

const movimiento = computed(
  () =>
    navesVista.value.filter((nave: any) => estadoNormalizado(nave.estado) === 'en_movimiento')
      .length,
)

const kpis = computed(() => [
  {
    label: 'Total de naves',
    value: navesVista.value.length,
    icon: 'mdi-greenhouse',
    tipo: 'primary',
  },

  {
    label: 'Abiertas',
    value: abiertas.value,
    icon: 'mdi-lock-open-variant-outline',
    tipo: 'success',
  },

  {
    label: 'Cerradas',
    value: cerradas.value,
    icon: 'mdi-lock-outline',
    tipo: 'error',
  },

  {
    label: 'En movimiento',
    value: movimiento.value,
    icon: 'mdi-motion',
    tipo: 'warning',
  },
])

const lluvia = computed(() => Number(meteo.value?.probabilidad_lluvia ?? 0))

const viento = computed(() => Number(meteo.value?.velocidad_viento ?? 0))

const radiacion = computed(() => Number(meteo.value?.radiacion_solar ?? 0))

const condicionTipo = computed(() => {
  if (viento.value > 40 || lluvia.value >= 75) {
    return 'danger'
  }

  if (lluvia.value >= 25) {
    return 'warning'
  }

  return 'success'
})

const condicionTexto = computed(() => {
  if (viento.value > 40) {
    return 'Viento fuerte'
  }

  if (lluvia.value >= 75) {
    return 'Lluvioso'
  }

  if (lluvia.value >= 45) {
    return 'Nublado'
  }

  if (lluvia.value >= 25) {
    return 'Parcialmente nublado'
  }

  if (radiacion.value >= 300) {
    return 'Soleado'
  }

  return 'Despejado'
})

const condicionIcono = computed(() => {
  if (viento.value > 40) {
    return 'mdi-weather-windy'
  }

  if (lluvia.value >= 75) {
    return 'mdi-weather-pouring'
  }

  if (lluvia.value >= 45) {
    return 'mdi-weather-cloudy'
  }

  if (lluvia.value >= 25) {
    return 'mdi-weather-partly-cloudy'
  }

  if (radiacion.value >= 300) {
    return 'mdi-weather-sunny'
  }

  return 'mdi-weather-sunset'
})

const condicionDescripcion = computed(() => {
  if (condicionTipo.value === 'danger') {
    return 'Condiciones de riesgo para operación'
  }

  if (condicionTipo.value === 'warning') {
    return 'Condiciones que requieren vigilancia'
  }

  return 'Condiciones favorables para operación'
})

const textoUltimaActualizacion = computed(() => {
  if (!ultimaActualizacion.value) {
    return 'Sin actualizar'
  }

  return `Última actualización: ${ultimaActualizacion.value.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`
})

const estadoUI = (estado: unknown) => {
  switch (estadoNormalizado(estado)) {
    case 'abierto':
      return {
        label: 'Abierta',
        color: 'success',
      }

    case 'en_movimiento':
      return {
        label: 'En movimiento',
        color: 'warning',
      }

    case 'cerrado':
      return {
        label: 'Cerrada',
        color: 'error',
      }

    default:
      return {
        label: 'Desconocido',
        color: 'grey',
      }
  }
}

const modoLabel = (modo: unknown) => {
  const value = normalizarTexto(modo)

  if (value === 'automatico') {
    return 'Automático'
  }

  if (value === 'remoto') {
    return 'Remoto'
  }

  if (value === 'local') {
    return 'Local'
  }

  return '—'
}

const formatNum = (value: unknown) => {
  const numero = Number(value)

  if (!Number.isFinite(numero)) {
    return '--'
  }

  return numero.toFixed(1)
}

const encontrarValor = (object: any, keys: string[]) => {
  if (!object) return null

  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key]
    }
  }

  return null
}

const obtenerMotorPrincipal = (nave: any) => nave?.motores?.[0] ?? nave?.motor ?? nave

const variadoresNave = (nave: any) => {
  const motores = Array.isArray(nave?.motores) ? nave.motores : []

  const ids = motores
    .map((motor: any) => Number(motor.variador_id))
    .filter((id: number) => Number.isFinite(id))

  if (ids.length) {
    return ids.map((id: number) => `V${id}`).join(' · ')
  }

  if (nave?.variador_id) {
    return `V${nave.variador_id}`
  }

  return '—'
}

const telemetriaActual = computed(() => {
  const motor = obtenerMotorPrincipal(naveSeleccionada.value)

  return [
    {
      label: 'Frecuencia',

      value: formatTelemetry(
        encontrarValor(motor, ['frecuencia', 'frecuencia_actual', 'frecuencia_hz']),
        'Hz',
      ),
    },

    {
      label: 'Corriente',

      value: formatTelemetry(encontrarValor(motor, ['corriente', 'corriente_actual']), 'A'),
    },

    {
      label: 'Tensión',

      value: formatTelemetry(encontrarValor(motor, ['tension', 'voltaje']), 'V'),
    },

    {
      label: 'Potencia',

      value: formatTelemetry(encontrarValor(motor, ['potencia']), 'kW'),
    },
  ]
})

function formatTelemetry(value: unknown, unidad: string) {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  const numero = Number(value)

  if (Number.isFinite(numero)) {
    return `${numero.toFixed(1)} ${unidad}`
  }

  return `${value} ${unidad}`
}

const seleccionarNave = (nave: any) => {
  naveSeleccionada.value = nave
}

const centrarCamara = () => {
  scene3d.value?.resetCamera?.()
}

const agregarEvento = (data: any) => {
  const naveId = Number(data?.invernadero_id ?? data?.id)

  const nave = navesVista.value.find((item: any) => Number(item.id) === naveId)

  const estado = data?.estado ?? nave?.estado ?? ''

  const accion = data?.accion ?? estadoUI(estado).label

  const tipo = estadoNormalizado(estado)

  eventos.value.unshift({
    id: `${Date.now()}-${Math.random()}`,

    hora: new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),

    nave: nave ? `Nave ${nave.numero ?? nave.id}` : `Nave ${naveId || '—'}`,

    accion: String(accion),

    tipo:
      tipo === 'abierto'
        ? 'success'
        : tipo === 'cerrado'
          ? 'error'
          : tipo === 'en_movimiento'
            ? 'warning'
            : 'neutral',
  })

  eventos.value = eventos.value.slice(0, 10)
}

const cargarZona = async (zonaId: number) => {
  await store.cargarEstadoZona(zonaId)

  try {
    const response = await api.get(`/tinker/ultimo-estado/${zonaId}`)

    if (response.data?.ok) {
      meteo.value = response.data.data?.meteorologia ?? null
    }
  } catch (error) {
    console.error('Error cargando meteorología:', error)
  }
}

const cargar = async () => {
  if (actualizando.value) {
    return
  }

  actualizando.value = true

  const inicio = performance.now()

  try {
    await store.cargarZonas()

    if (!zonaSeleccionada.value && zonaItems.value.length) {
      zonaSeleccionada.value = Number(zonaItems.value[0].id)
    }

    if (zonaSeleccionada.value) {
      await cargarZona(Number(zonaSeleccionada.value))
    }

    ultimaActualizacion.value = new Date()
  } catch (error) {
    console.error('Error cargando visualización:', error)
  } finally {
    latencia.value = Math.round(performance.now() - inicio)

    actualizando.value = false
  }
}

watch(zonaSeleccionada, async (zonaNueva, zonaAnterior) => {
  if (!zonaNueva || zonaNueva === zonaAnterior) {
    return
  }

  naveSeleccionada.value = null

  await cargarZona(Number(zonaNueva))

  ultimaActualizacion.value = new Date()
})

onMounted(async () => {
  loadingStore.mostrar('Cargando visualización 3D...')

  try {
    await cargar()

    for (const zona of zonas.value) {
      unirseAZona(zona.id)
    }

    escuchar(
      'estado-actualizado',

      async (data: any) => {
        agregarEvento(data)

        if (data?.zona_id) {
          await store.cargarEstadoZona(Number(data.zona_id))
        }

        ultimaActualizacion.value = new Date()
      },
    )

    intervalo = setInterval(cargar, 30000)

    // PRUEBA TEMPORAL — borrar después
    if (!meteo.value) {
      meteo.value = {
        temperatura: 26.5,
        humedad: 68,
        velocidad_viento: 12,
        radiacion_solar: 420,
        probabilidad_lluvia: 20,
        presion_atmosferica: 1013,
        registrado_at: new Date().toISOString(),
      }
    }
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

const simularEstado = (estado: 'abierto' | 'cerrado' | 'en_movimiento') => {
  for (const zona of zonas.value) {
    for (const nave of (zona as any).invernaderos ?? []) {
      nave.estado = estado
    }
  }
}

const simularClima = (tipo: string) => {
  if (!meteo.value) {
    meteo.value = {
      temperatura: 26.5,
      humedad: 68,
      velocidad_viento: 12,
      radiacion_solar: 420,
      probabilidad_lluvia: 20,
      presion_atmosferica: 1013,
      registrado_at: new Date().toISOString(),
    }
  }
  if (tipo === 'soleado') {
    meteo.value.probabilidad_lluvia = 10
    meteo.value.radiacion_solar = 500
    meteo.value.velocidad_viento = 5
  }
  if (tipo === 'nublado') {
    meteo.value.probabilidad_lluvia = 35
    meteo.value.radiacion_solar = 100
    meteo.value.velocidad_viento = 15
  }
  if (tipo === 'lluvia') {
    meteo.value.probabilidad_lluvia = 80
    meteo.value.radiacion_solar = 20
    meteo.value.velocidad_viento = 5
  }
  if (tipo === 'viento') {
    meteo.value.velocidad_viento = 55
    meteo.value.probabilidad_lluvia = 20
  }
}
</script>

<style scoped>
.live-page {
  max-width: 1740px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 20px;
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-header__left h1 {
  margin: 0;

  font-size: 1.55rem;
  font-weight: 780;

  letter-spacing: -0.035em;
}

.page-header__left p {
  margin: 5px 0 0;

  color: rgba(var(--v-theme-on-surface), 0.56);

  font-size: 0.88rem;
}

.page-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 54px;
  height: 54px;

  flex: 0 0 54px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);

  border-radius: 17px;
}

.page-header__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 10px;

  flex-wrap: wrap;
}

.zone-selector {
  width: 210px;
}

.last-update {
  flex-basis: 100%;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  gap: 6px;

  color: rgba(var(--v-theme-on-surface), 0.5);

  font-size: 0.72rem;
}

.last-update span {
  width: 7px;
  height: 7px;

  background: #34c759;

  border-radius: 50%;
}

/* ========================
   WEATHER
======================== */

.weather-card {
  display: flex;
  align-items: center;

  gap: 24px;

  padding: 20px 24px;

  margin-bottom: 16px;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.weather-general {
  display: flex;
  align-items: center;

  gap: 13px;

  min-width: 250px;
}

.weather-main-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 58px;
  height: 58px;

  border-radius: 18px;
}

.weather-main-icon--success {
  color: #2e9d50;

  background: rgba(46, 157, 80, 0.1);
}

.weather-main-icon--warning {
  color: #f59f00;

  background: rgba(245, 159, 0, 0.11);
}

.weather-main-icon--danger {
  color: #e03131;

  background: rgba(224, 49, 49, 0.1);
}

.metric-label {
  display: block;

  margin-bottom: 3px;

  color: rgba(var(--v-theme-on-surface), 0.45);

  font-size: 0.65rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.06em;
}

.weather-condition {
  font-size: 0.95rem;
  font-weight: 750;
}

.weather-general small {
  display: block;

  margin-top: 3px;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.weather-divider {
  width: 1px;
  height: 52px;

  background: rgba(var(--v-border-color), 0.8);
}

.weather-metrics {
  display: grid;

  grid-template-columns: repeat(5, minmax(110px, 1fr));

  flex: 1;

  gap: 20px;
}

.weather-metric {
  display: flex;
  align-items: center;

  gap: 9px;
}

.weather-metric div {
  display: flex;
  flex-direction: column;
}

.weather-metric span {
  color: rgba(var(--v-theme-on-surface), 0.5);

  font-size: 0.68rem;
}

.weather-metric strong {
  margin-top: 2px;

  font-size: 0.89rem;
  font-weight: 750;
}

/* ========================
   MAIN
======================== */

.live-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    360px;

  gap: 16px;

  align-items: start;
}

.live-main {
  min-width: 0;
}

/* ========================
   KPI
======================== */

.kpi-card {
  display: grid;

  grid-template-columns: repeat(5, 1fr);

  margin-bottom: 12px;

  padding: 12px 8px;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.kpi-item {
  display: flex;
  align-items: center;

  gap: 10px;

  min-height: 52px;

  padding: 5px 14px;

  border-right: 1px solid rgba(var(--v-border-color), 0.55);
}

.kpi-item:last-child {
  border-right: none;
}

.kpi-item > div:last-child {
  display: flex;
  flex-direction: column;
}

.kpi-item span {
  color: rgba(var(--v-theme-on-surface), 0.5);

  font-size: 0.68rem;
}

.kpi-item strong {
  margin-top: 1px;

  font-size: 1rem;
  font-weight: 780;
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  border-radius: 13px;

  color: #657083;

  background: rgba(101, 112, 131, 0.09);
}

.kpi-icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);
}

.kpi-icon--success {
  color: #34a853;

  background: rgba(52, 168, 83, 0.1);
}

.kpi-icon--error {
  color: #e5484d;

  background: rgba(229, 72, 77, 0.1);
}

.kpi-icon--warning {
  color: #f59f00;

  background: rgba(245, 159, 0, 0.11);
}

/* ========================
   SCENE
======================== */

.scene-card {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.scene-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 53px;

  padding: 10px 14px 10px 18px;
}

.scene-header > div:first-child {
  display: flex;
  align-items: center;

  gap: 10px;
}

.scene-header strong {
  font-size: 0.88rem;
}

.online-chip {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  padding: 4px 8px;

  color: #288c48;

  background: rgba(52, 199, 89, 0.09);

  border-radius: 999px;

  font-size: 0.65rem;
  font-weight: 700;
}

.online-chip i {
  width: 6px;
  height: 6px;

  background: #34c759;

  border-radius: 50%;
}

.scene-actions {
  display: flex;
}

.scene-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 11px 16px;

  border-top: 1px solid rgba(var(--v-border-color), 0.65);
}

.legend {
  display: flex;
  align-items: center;

  gap: 15px;

  color: rgba(var(--v-theme-on-surface), 0.62);

  font-size: 0.69rem;
}

.legend strong {
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.dot {
  display: inline-block;

  width: 7px;
  height: 7px;

  margin-right: 5px;

  border-radius: 50%;
}

.dot--green {
  background: #34c759;
}

.dot--red {
  background: #ff453a;
}

.dot--orange {
  background: #ff9f0a;
}

.scene-footer__hint {
  color: rgba(var(--v-theme-on-surface), 0.42);

  font-size: 0.67rem;
}

/* ========================
   SIDE BAR
======================== */

.live-sidebar {
  display: flex;
  flex-direction: column;

  gap: 12px;
}

.events-card,
.detail-card {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 54px;

  padding: 13px 16px;

  border-bottom: 1px solid rgba(var(--v-border-color), 0.65);
}

.panel-title > div {
  display: flex;
  align-items: center;

  gap: 8px;
}

.panel-title strong {
  font-size: 0.84rem;
}

.live-text {
  display: flex;
  align-items: center;

  gap: 6px;

  color: #2b974d;

  font-size: 0.67rem;
  font-weight: 700;
}

.live-text i,
.telemetry-title i {
  width: 7px;
  height: 7px;

  background: #34c759;

  border-radius: 50%;

  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.1);
}

.events-list {
  padding: 6px 0;
}

.event-item {
  display: grid;

  grid-template-columns:
    58px
    10px
    1fr;

  align-items: center;

  gap: 8px;

  min-height: 43px;

  padding: 5px 15px;

  transition: background 0.2s ease;
}

.event-item:hover {
  background: rgba(var(--v-theme-primary), 0.035);
}

.event-time {
  color: rgba(var(--v-theme-on-surface), 0.43);

  font-size: 0.65rem;
}

.event-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #8e9aab;
}

.event-dot--success {
  background: #34c759;
}

.event-dot--error {
  background: #ff453a;
}

.event-dot--warning {
  background: #ff9f0a;
}

.event-content {
  display: flex;
  align-items: center;

  gap: 8px;

  min-width: 0;
}

.event-content strong {
  font-size: 0.72rem;
}

.event-content span {
  overflow: hidden;

  color: rgba(var(--v-theme-on-surface), 0.56);

  font-size: 0.69rem;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.events-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;

  min-height: 190px;

  color: rgba(var(--v-theme-on-surface), 0.36);

  font-size: 0.75rem;
}

/* ========================
   DETAIL
======================== */

.detail-title {
  min-height: 60px;
}

.detail-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 17px 20px;

  padding: 17px;
}

.detail-grid > div {
  display: flex;
  flex-direction: column;

  gap: 4px;
}

.detail-grid span {
  color: rgba(var(--v-theme-on-surface), 0.48);

  font-size: 0.67rem;
}

.detail-grid strong {
  font-size: 0.79rem;
}

.telemetry {
  padding: 15px;
}

.telemetry-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 11px;

  font-size: 0.72rem;
  font-weight: 750;
}

.telemetry-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 8px;
}

.telemetry-box {
  position: relative;

  overflow: hidden;

  min-height: 90px;

  padding: 10px;

  border: 1px solid rgba(var(--v-border-color), 0.72);

  border-radius: 12px;

  background: rgba(var(--v-theme-surface), 0.7);
}

.telemetry-box > span {
  display: block;

  color: rgba(var(--v-theme-on-surface), 0.48);

  font-size: 0.61rem;
}

.telemetry-box strong {
  display: block;

  margin-top: 4px;

  font-size: 0.79rem;
}

.mini-chart {
  position: absolute;

  left: 8px;
  right: 8px;
  bottom: 7px;

  display: flex;
  align-items: flex-end;

  gap: 2px;

  height: 25px;
}

.mini-chart span {
  flex: 1;

  max-height: 25px;

  background: rgba(var(--v-theme-primary), 0.28);

  border-radius: 2px;
}

/* ========================
   RESPONSIVE
======================== */

@media (max-width: 1250px) {
  .live-layout {
    grid-template-columns: 1fr;
  }

  .live-sidebar {
    display: grid;

    grid-template-columns: repeat(2, 1fr);
  }

  .weather-metrics {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
  }

  .page-header__right {
    width: 100%;

    justify-content: flex-start;
  }

  .last-update {
    justify-content: flex-start;
  }

  .weather-card {
    flex-direction: column;

    align-items: stretch;
  }

  .weather-divider {
    width: 100%;
    height: 1px;
  }

  .weather-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .kpi-card {
    grid-template-columns: repeat(2, 1fr);
  }

  .kpi-item {
    border-right: 0;
  }

  .live-sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .live-page {
    padding: 13px !important;
  }

  .page-header__right {
    display: grid;

    grid-template-columns: 1fr auto;
  }

  .zone-selector {
    width: 100%;
  }

  .last-update {
    grid-column: 1 / -1;
  }

  .weather-metrics {
    grid-template-columns: 1fr;
  }

  .kpi-card {
    grid-template-columns: 1fr 1fr;
  }

  .scene-footer {
    flex-direction: column;

    align-items: flex-start;
  }

  .legend {
    flex-wrap: wrap;
  }

  .scene-footer__hint {
    display: none;
  }
}
</style>
