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
            :color="conexionMicrocontrolador ? 'success' : 'error'"
            variant="tonal"
            size="small"
            class="connection-chip"
          >
            <span
              class="connection-dot"
              :class="{
                'connection-dot--online': conexionMicrocontrolador,

                'connection-dot--offline': !conexionMicrocontrolador,
              }"
            />

            {{
              conexionMicrocontrolador
                ? 'Microcontrolador conectado'
                : 'Microcontrolador desconectado'
            }}
          </v-chip>

          <div class="update-status">
            <v-icon size="15"> mdi-clock-outline </v-icon>

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
              <div
                class="weather-main__icon"
                :class="`weather-main__icon--${condicionClima.color}`"
              >
                <v-icon size="42">
                  {{ condicionClima.icono }}
                </v-icon>
              </div>

              <div class="weather-temperature">
                <span> Temperatura actual </span>

                <div class="temperature-value">
                  {{ formatearNumero(meteo.temperatura) }}

                  <small>°C</small>
                </div>
              </div>

              <div class="weather-condition">
                <span class="weather-condition__label"> Condición actual </span>

                <strong>
                  {{ condicionClima.texto }}
                </strong>

                <small>
                  {{ condicionClima.descripcion }}
                </small>
              </div>
            </div>

            <div class="sensor-status">
              <div class="sensor-status__main">
                <span class="sensor-dot" />

                <div>
                  <strong> Sensor en línea </strong>

                  <span> Recepción de datos activa </span>
                </div>
              </div>

              <v-icon size="18" color="success"> mdi-access-point </v-icon>
            </div>

            <div class="weather-grid">
              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--info">
                  <v-icon size="19"> mdi-water-percent </v-icon>
                </div>

                <div>
                  <span> Humedad </span>

                  <strong> {{ formatearNumero(meteo.humedad) }}% </strong>
                </div>
              </div>

              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--warning">
                  <v-icon size="19"> mdi-weather-windy </v-icon>
                </div>

                <div>
                  <span> Viento </span>

                  <strong>
                    {{ formatearNumero(meteo.velocidad_viento) }}

                    <small> km/h </small>
                  </strong>
                </div>
              </div>

              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--primary">
                  <v-icon size="19"> mdi-white-balance-sunny </v-icon>
                </div>

                <div>
                  <span> Radiación solar </span>

                  <strong>
                    {{ formatearNumero(meteo.radiacion_solar) }}

                    <small> W/m² </small>
                  </strong>
                </div>
              </div>

              <div class="weather-metric">
                <div class="weather-metric__icon weather-metric__icon--primary">
                  <v-icon size="19"> mdi-gauge </v-icon>
                </div>

                <div>
                  <span> Presión </span>

                  <strong>
                    {{
                      meteo.presion_atmosferica != null
                        ? formatearNumero(meteo.presion_atmosferica)
                        : '--'
                    }}

                    <small> hPa </small>
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

                <div
                  class="rain-card__icon"
                  :class="{
                    'rain-card__icon--danger': probabilidadLluvia > 60,
                  }"
                >
                  <v-icon :color="probabilidadLluvia > 60 ? 'error' : 'primary'" size="23">
                    {{
                      probabilidadLluvia > 60
                        ? 'mdi-weather-pouring'
                        : probabilidadLluvia > 35
                          ? 'mdi-weather-rainy'
                          : 'mdi-weather-cloudy'
                    }}
                  </v-icon>
                </div>
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

            <p>No fue posible obtener información del microcontrolador.</p>
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

                <p>Actividad reciente de las naves</p>
              </div>
            </div>

            <v-chip v-if="ultimosEventos.length > 0" size="x-small" variant="tonal" color="primary">
              {{ ultimosEventos.length }}
              recientes
            </v-chip>
          </div>

          <v-divider />

          <div v-if="ultimosEventos.length === 0" class="events-empty">
            <div class="empty-state__icon">
              <v-icon size="36" color="primary"> mdi-history </v-icon>
            </div>

            <h3>Sin eventos recientes</h3>

            <p>La actividad de las naves aparecerá aquí.</p>
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
                    {{ nombreNaveEvento(evento.invernadero_nombre) }}
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
                    :color="
                      evento.resultado === 'exitoso'
                        ? 'success'
                        : evento.resultado === 'pendiente'
                          ? 'warning'
                          : 'error'
                    "
                    variant="tonal"
                  >
                    {{ labelResultado(evento.resultado) }}
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
import { computed, onMounted, onUnmounted, ref } from 'vue'

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

const conexionMicrocontrolador = ref(false)

const actualizando = ref(false)

const ultimaActualizacion = ref('')

const zonaClimaActual = ref('Zona A')

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

const numeroNave = (nave: any): number | null => {
  const candidatos = [
    nave?.numero,
    nave?.numero_nave,
    nave?.numeroNave,
    nave?.galpon_numero,
    nave?.numero_galpon,
    nave?.codigo,
    nave?.nombre,
  ]

  for (const candidato of candidatos) {
    if (candidato === undefined || candidato === null) {
      continue
    }

    if (typeof candidato === 'number') {
      return Number.isFinite(candidato) ? candidato : null
    }

    const coincidencia = String(candidato).match(/\d+/)

    if (coincidencia) {
      const numero = Number(coincidencia[0])

      if (Number.isFinite(numero)) {
        return numero
      }
    }
  }

  return null
}

const esNaveOperativa = (nave: any) => {
  const numero = numeroNave(nave)

  return numero !== null && numero >= NAVE_MIN && numero <= NAVE_MAX
}

const zonaAOriginal = computed(() => {
  return zonas.value.find((zona) => obtenerLetraZona(zona) === 'A')
})

const zonaBOriginal = computed(() => {
  return zonas.value.find((zona) => obtenerLetraZona(zona) === 'B')
})

const navesFuente = computed(() => {
  const mapa = new Map<number, any>()

  for (const zona of zonas.value) {
    for (const nave of zona.invernaderos ?? []) {
      if (!esNaveOperativa(nave)) {
        continue
      }

      const numero = numeroNave(nave)

      if (numero === null) {
        continue
      }

      const existente = mapa.get(numero)

      if (!existente) {
        mapa.set(numero, nave)

        continue
      }

      const estadoExistente = normalizarTexto(existente.estado)

      const estadoNuevo = normalizarTexto(nave.estado)

      if (!estadoExistente && estadoNuevo) {
        mapa.set(numero, nave)
      }
    }
  }

  return Array.from(mapa.entries())
    .sort(([numeroA], [numeroB]) => numeroA - numeroB)
    .map(([, nave]) => nave)
})

const zonasOperativas = computed(() => {
  const resultado: any[] = []

  if (zonaAOriginal.value) {
    resultado.push({
      ...zonaAOriginal.value,

      nombre: 'Zona A',

      invernaderos: navesFuente.value.filter((nave) => {
        const numero = numeroNave(nave)

        return numero !== null && numero % 2 !== 0
      }),
    })
  }

  if (zonaBOriginal.value) {
    resultado.push({
      ...zonaBOriginal.value,

      nombre: 'Zona B',

      invernaderos: navesFuente.value.filter((nave) => {
        const numero = numeroNave(nave)

        return numero !== null && numero % 2 === 0
      }),
    })
  }

  return resultado
})

const navesOperativas = computed(() => {
  return zonasOperativas.value.flatMap((zona) => zona.invernaderos ?? [])
})

const obtenerModoNave = (nave: any) => {
  return normalizarTexto(
    nave?.modo ?? nave?.modo_operacion ?? nave?.modo_origen ?? nave?.modo_control,
  )
}

const resumen = computed(() => {
  const naves = navesOperativas.value

  const abiertos = naves.filter((nave) => normalizarTexto(nave.estado) === 'abierto').length

  const enMovimiento = naves.filter(
    (nave) => normalizarTexto(nave.estado) === 'en_movimiento',
  ).length

  const cerrados = naves.filter((nave) => {
    const estado = normalizarTexto(nave.estado)

    return estado !== 'abierto' && estado !== 'en_movimiento'
  }).length

  const automaticos = naves.filter((nave) => {
    const modo = obtenerModoNave(nave)

    return modo === 'automatico' || modo === 'automatica'
  }).length

  const locales = naves.filter((nave) => obtenerModoNave(nave) === 'local').length

  const remotos = naves.filter((nave) => obtenerModoNave(nave) === 'remoto').length

  return {
    total: naves.length,

    abiertos,

    cerrados,

    en_movimiento: enMovimiento,

    en_automatico: automaticos,

    en_remoto: remotos,

    en_local: locales,
  }
})

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

const obtenerCondicionBackend = () => {
  const valor =
    meteo.value?.condicion ??
    meteo.value?.estado_cielo ??
    meteo.value?.estado_clima ??
    meteo.value?.clima

  return String(valor ?? '').trim()
}

const obtenerConfigCondicion = (texto: string) => {
  const normalizado = normalizarTexto(texto)

  if (normalizado.includes('torment')) {
    return {
      texto,
      descripcion: 'Condiciones de tormenta',
      icono: 'mdi-weather-lightning-rainy',
      color: 'error',
    }
  }

  if (normalizado.includes('lluv')) {
    return {
      texto,
      descripcion: 'Precipitaciones presentes',
      icono: 'mdi-weather-pouring',
      color: 'info',
    }
  }

  if (normalizado.includes('nubl')) {
    return {
      texto,
      descripcion: 'Cobertura nubosa',
      icono: 'mdi-weather-cloudy',
      color: 'neutral',
    }
  }

  if (normalizado.includes('parcial')) {
    return {
      texto,
      descripcion: 'Nubosidad variable',
      icono: 'mdi-weather-partly-cloudy',
      color: 'info',
    }
  }

  if (normalizado.includes('sol') || normalizado.includes('despej')) {
    return {
      texto,
      descripcion: 'Condiciones despejadas',
      icono: 'mdi-weather-sunny',
      color: 'warning',
    }
  }

  return {
    texto,
    descripcion: 'Condición registrada por el sensor',
    icono: 'mdi-weather-partly-cloudy',
    color: 'primary',
  }
}

const condicionClima = computed(() => {
  if (!meteo.value) {
    return {
      texto: 'Sin información',

      descripcion: 'No hay datos meteorológicos',

      icono: 'mdi-weather-cloudy-alert',

      color: 'neutral',
    }
  }

  const condicionBackend = obtenerCondicionBackend()

  if (condicionBackend) {
    return obtenerConfigCondicion(condicionBackend)
  }

  const lluvia = Number(meteo.value?.probabilidad_lluvia ?? 0)

  const radiacion = Number(meteo.value?.radiacion_solar ?? 0)

  const humedad = Number(meteo.value?.humedad ?? 0)

  if (lluvia >= 75) {
    return {
      texto: 'Lluvioso',

      descripcion: 'Alta probabilidad de lluvia',

      icono: 'mdi-weather-pouring',

      color: 'info',
    }
  }

  if (lluvia >= 50) {
    return {
      texto: 'Nublado',

      descripcion: 'Condiciones mayormente nubladas',

      icono: 'mdi-weather-cloudy',

      color: 'neutral',
    }
  }

  if (lluvia >= 25 || humedad >= 85) {
    return {
      texto: 'Parcialmente nublado',

      descripcion: 'Nubosidad variable',

      icono: 'mdi-weather-partly-cloudy',

      color: 'info',
    }
  }

  if (radiacion >= 400) {
    return {
      texto: 'Soleado',

      descripcion: 'Condiciones despejadas',

      icono: 'mdi-weather-sunny',

      color: 'warning',
    }
  }

  return {
    texto: 'Despejado',

    descripcion: 'Condiciones estables',

    icono: 'mdi-weather-sunset',

    color: 'primary',
  }
})

const indicadoresResumen = computed(() => [
  {
    label: 'Naves',

    value: resumen.value.total,

    icon: 'mdi-greenhouse',

    color: 'primary',

    rotating: false,
  },

  {
    label: 'Abiertas',

    value: resumen.value.abiertos,

    icon: 'mdi-arrow-up-circle-outline',

    color: 'success',

    rotating: false,
  },

  {
    label: 'Cerradas',

    value: resumen.value.cerrados,

    icon: 'mdi-arrow-down-circle-outline',

    color: 'error',

    rotating: false,
  },

  {
    label: 'En movimiento',

    value: resumen.value.en_movimiento,

    icon: 'mdi-cog-outline',

    color: 'warning',

    rotating: true,
  },

  {
    label: 'Automático',

    value: resumen.value.en_automatico,

    icon: 'mdi-robot-outline',

    color: 'info',

    rotating: false,
  },

  {
    label: 'Local',

    value: resumen.value.en_local,

    icon: 'mdi-hand-back-right-outline',

    color: 'secondary',

    rotating: false,
  },
])

const accionesRapidas = computed(() => {
  const acciones = [
    {
      title: 'Dashboard',

      subtitle: 'Estado de las naves',

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

const nombreNaveEvento = (nombre: string | null | undefined) => {
  if (!nombre) {
    return 'Nave'
  }

  return nombre.replace(/galp[oó]n/gi, 'Nave').replace(/invernadero/gi, 'Nave')
}

const obtenerZonaClima = () => {
  const zonaA = zonaAOriginal.value

  if (zonaA) {
    return zonaA
  }

  const zonaB = zonaBOriginal.value

  if (zonaB) {
    return zonaB
  }

  return zonas.value[0] ?? null
}

const actualizarHora = () => {
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
    hour: '2-digit',

    minute: '2-digit',

    hour12: false,
  })
}

const cargar = async () => {
  if (actualizando.value) {
    return
  }

  actualizando.value = true

  try {
    await invernaderosStore.cargarZonas()

    await Promise.all(zonas.value.map((zona) => invernaderosStore.cargarEstadoZona(zona.id)))

    const zonaClima = obtenerZonaClima()

    const zonaId = zonaClima?.id ?? 1

    zonaClimaActual.value =
      obtenerLetraZona(zonaClima) === 'A'
        ? 'Zona A'
        : obtenerLetraZona(zonaClima) === 'B'
          ? 'Zona B'
          : (zonaClima?.nombre ?? 'Zona principal')

    const [meteoResult, eventosResult] = await Promise.allSettled([
      api.get(`/tinker/ultimo-estado/${zonaId}`),

      api.get('/zonas/eventos?limit=5'),
    ])

    if (
      meteoResult.status === 'fulfilled' &&
      meteoResult.value.data.ok &&
      meteoResult.value.data.data?.meteorologia
    ) {
      meteo.value = meteoResult.value.data.data.meteorologia

      conexionMicrocontrolador.value = true
    } else {
      meteo.value = null

      conexionMicrocontrolador.value = false
    }

    if (eventosResult.status === 'fulfilled' && eventosResult.value.data.ok) {
      ultimosEventos.value = eventosResult.value.data.data ?? []
    } else {
      ultimosEventos.value = []
    }

    actualizarHora()
  } catch (error) {
    console.error('Error cargando Home:', error)

    conexionMicrocontrolador.value = false
  } finally {
    actualizando.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando sistema...')

  try {
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

  font-size: 0.74rem;
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

  font-size: 0.8rem;

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

  font-size: 0.74rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
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

  font-size: 0.78rem;

  color: rgba(var(--v-theme-on-surface), 0.54);
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
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 11px;
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

  font-size: 0.95rem;
  font-weight: 700;
}

.card-header p {
  margin: 2px 0 0;

  font-size: 0.74rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
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

  background: linear-gradient(
    120deg,
    rgba(var(--v-theme-primary), 0.055),
    rgba(var(--v-theme-primary), 0.02)
  );
}

.weather-main__icon {
  width: 64px;
  height: 64px;

  flex: 0 0 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 18px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);
}

.weather-main__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);
}

.weather-main__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.11);
}

.weather-main__icon--info {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.1);
}

.weather-main__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.weather-main__icon--neutral {
  color: rgba(var(--v-theme-on-surface), 0.62);

  background: rgba(var(--v-theme-on-surface), 0.07);
}

.weather-temperature {
  min-width: 110px;
}

.weather-temperature > span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

.temperature-value {
  margin-top: 2px;

  font-size: 2rem;
  font-weight: 750;
  line-height: 1.1;

  letter-spacing: -0.035em;
}

.temperature-value small {
  margin-left: 2px;

  font-size: 0.82rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.56);
}

.weather-condition {
  min-width: 0;

  margin-left: auto;

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  text-align: right;
}

.weather-condition__label {
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.weather-condition strong {
  margin-top: 3px;

  font-size: 0.9rem;
  font-weight: 700;

  color: rgb(var(--v-theme-on-surface));
}

.weather-condition small {
  max-width: 150px;

  margin-top: 2px;

  font-size: 0.7rem;
  line-height: 1.35;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.sensor-status {
  min-height: 52px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-top: 11px;

  padding: 9px 11px;

  border-radius: 11px;

  background: rgba(var(--v-theme-success), 0.05);
}

.sensor-status__main {
  display: flex;
  align-items: center;

  gap: 9px;
}

.sensor-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));

  box-shadow: 0 0 0 4px rgba(var(--v-theme-success), 0.08);

  animation: sensorPulse 2s ease-in-out infinite;
}

.sensor-status__main > div {
  display: flex;
  flex-direction: column;
}

.sensor-status strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.sensor-status span {
  margin-top: 1px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.weather-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 9px;

  margin-top: 11px;
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
  width: 35px;
  height: 35px;

  flex: 0 0 35px;

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
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.weather-metric strong {
  margin-top: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.82rem;
  font-weight: 700;
}

.weather-metric small {
  font-size: 0.68rem;
  font-weight: 500;

  color: rgba(var(--v-theme-on-surface), 0.47);
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

.rain-card__header > div:first-child {
  display: flex;
  flex-direction: column;
}

.rain-card__header span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.rain-card__header strong {
  margin-top: 1px;

  font-size: 0.9rem;
  font-weight: 700;
}

.rain-card__icon {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: rgba(var(--v-theme-primary), 0.07);
}

.rain-card__icon--danger {
  background: rgba(var(--v-theme-error), 0.07);
}

.quick-actions {
  display: flex;
  flex-direction: column;

  gap: 7px;

  padding: 12px;
}

.quick-action {
  min-height: 58px;

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
  font-size: 0.78rem;
  font-weight: 650;
}

.quick-action__content span {
  margin-top: 2px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.quick-action__arrow {
  color: rgba(var(--v-theme-on-surface), 0.35);
}

.events-list {
  padding: 8px 12px;
}

.event-item {
  min-height: 64px;

  display: flex;
  align-items: center;

  gap: 10px;

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

  font-size: 0.78rem;
  font-weight: 650;
}

.event-item__top > span {
  flex-shrink: 0;

  font-size: 0.68rem;

  color: rgba(var(--v-theme-on-surface), 0.45);
}

.event-item__bottom {
  margin-top: 4px;
}

.event-action {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.52);
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

  font-size: 0.86rem;
  font-weight: 700;
}

.empty-state p,
.events-empty p {
  max-width: 280px;

  margin: 5px 0 0;

  font-size: 0.75rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
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

@keyframes sensorPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@media (max-width: 1100px) {
  .weather-main {
    flex-wrap: wrap;
  }

  .weather-condition {
    width: 100%;

    margin-left: 77px;

    align-items: flex-start;

    text-align: left;
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
    font-size: 0.68rem;
  }

  .welcome-text h1 {
    font-size: 1.22rem;
  }

  .welcome-date {
    margin-top: 5px;

    font-size: 0.74rem;
  }

  .welcome-status {
    width: 100%;

    justify-content: space-between;
  }

  .summary-card {
    min-height: 84px;

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
    font-size: 0.72rem;
  }

  .card-header {
    min-height: 68px;

    padding: 13px 14px;
  }

  .card-header p {
    font-size: 0.7rem;
  }

  .weather-content {
    padding: 13px;
  }

  .weather-main {
    padding: 14px;
  }

  .weather-main__icon {
    width: 54px;
    height: 54px;

    flex-basis: 54px;
  }

  .temperature-value {
    font-size: 1.7rem;
  }

  .weather-condition {
    width: 100%;

    margin-left: 0;

    padding-top: 4px;
  }

  .weather-grid {
    gap: 7px;
  }

  .weather-metric {
    padding: 9px;
  }

  .weather-metric__icon {
    width: 31px;
    height: 31px;

    flex-basis: 31px;
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

  .connection-chip {
    max-width: 260px;
  }
}
</style>