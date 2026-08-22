<template>
  <v-container fluid class="alarmas-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__content">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-alarm-light-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Alarmas y fallas</h1>

            <v-chip
              v-if="resumen.activas > 0"
              color="error"
              variant="tonal"
              size="small"
              class="status-chip"
            >
              <v-icon start size="15"> mdi-alert-circle </v-icon>

              {{ resumen.activas }}
              {{ resumen.activas === 1 ? 'pendiente' : 'pendientes' }}
            </v-chip>

            <v-chip v-else color="success" variant="tonal" size="small" class="status-chip">
              <v-icon start size="15"> mdi-check-circle </v-icon>

              Todo en orden
            </v-chip>
          </div>

          <p class="page-subtitle">
            Monitoreo y gestión de alertas operativas de las naves, equipos y condiciones
            ambientales.
          </p>
        </div>
      </div>

      <div class="page-header__actions">
        <div v-if="ultimaActualizacion" class="last-update">
          <v-icon size="15"> mdi-clock-outline </v-icon>

          <span> Actualizado {{ ultimaActualizacion }} </span>
        </div>

        <v-btn
          v-if="resumen.activas > 0"
          color="error"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-check-all"
          :loading="resolviendoTodas"
          :disabled="cargando || resolviendoTodas"
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
          :disabled="resolviendoTodas"
          @click="cargar"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <v-row class="mb-5">
      <v-col v-for="item in indicadores" :key="item.label" cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="stat-card">
          <div class="stat-card__icon" :class="`stat-card__icon--${item.color}`">
            <v-icon size="25">
              {{ item.icon }}
            </v-icon>
          </div>

          <div class="stat-card__content">
            <span class="stat-card__label">
              {{ item.label }}
            </span>

            <strong class="stat-card__value">
              {{ item.value }}
            </strong>

            <span class="stat-card__description">
              {{ item.description }}
            </span>
          </div>

          <span class="stat-card__accent" :class="`stat-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <v-card class="main-card" rounded="xl" elevation="0">
      <div class="alarm-toolbar">
        <div class="alarm-toolbar__title">
          <div class="section-icon">
            <v-icon size="21"> mdi-format-list-bulleted </v-icon>
          </div>

          <div>
            <h2>Registro de alarmas</h2>

            <span>
              {{ alarmasFiltradas.length }}
              {{ alarmasFiltradas.length === 1 ? 'registro encontrado' : 'registros encontrados' }}
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

      <div class="filter-status">
        <div class="filter-status__main">
          <div class="filter-status__icon">
            <v-icon size="17"> mdi-greenhouse </v-icon>
          </div>

          <div>
            <strong>
              {{ zonaFiltroNombre ? zonaFiltroNombre : 'Zona A y Zona B' }}
            </strong>

            <span>
              {{ zonaFiltroNombre ? distribucionFiltro : '14 naves operativas' }}
            </span>
          </div>
        </div>

        <div class="filter-status__count">
          <strong>
            {{ alarmasFiltradas.length }}
          </strong>

          <span> de {{ alarmasNormalizadas.length }} alarmas </span>
        </div>
      </div>

      <v-divider />

      <div v-if="cargando && alarmas.length === 0" class="pa-4">
        <div v-for="i in 4" :key="i" class="alarm-skeleton">
          <v-skeleton-loader type="avatar, list-item-two-line" class="w-100" />
        </div>
      </div>

      <div v-else-if="alarmasFiltradas.length === 0" class="empty-state">
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
          v-for="alarma in alarmasFiltradas"
          :key="alarma.id"
          class="alarm-item"
          :class="{
            'alarm-item--active': normalizarTexto(alarma.estado) === 'activa',

            'alarm-item--resolved': normalizarTexto(alarma.estado) === 'resuelta',
          }"
        >
          <span
            class="alarm-severity-line"
            :class="
              normalizarTexto(alarma.estado) === 'activa'
                ? `alarm-severity-line--${colorTipo(alarma.tipo)}`
                : 'alarm-severity-line--resolved'
            "
          />

          <div
            class="alarm-item__icon"
            :class="
              normalizarTexto(alarma.estado) === 'activa'
                ? `alarm-item__icon--${colorTipo(alarma.tipo)}`
                : 'alarm-item__icon--resolved'
            "
          >
            <v-icon size="23">
              {{
                normalizarTexto(alarma.estado) === 'activa' ? iconTipo(alarma.tipo) : 'mdi-check'
              }}
            </v-icon>
          </div>

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
                  :color="normalizarTexto(alarma.estado) === 'activa' ? 'error' : 'success'"
                  variant="tonal"
                  class="alarm-state-chip"
                >
                  <span
                    class="alarm-state-dot"
                    :class="{
                      'alarm-state-dot--active': normalizarTexto(alarma.estado) === 'activa',

                      'alarm-state-dot--resolved': normalizarTexto(alarma.estado) === 'resuelta',
                    }"
                  />

                  {{ normalizarTexto(alarma.estado) === 'activa' ? 'Activa' : 'Resuelta' }}
                </v-chip>
              </div>
            </div>

            <div class="alarm-item__meta">
              <span class="alarm-meta">
                <v-icon size="15"> mdi-map-marker-outline </v-icon>

                {{ alarma.zona_nombre || 'Zona no identificada' }}
              </span>

              <span v-if="alarma.__numero_nave" class="alarm-meta">
                <v-icon size="15"> mdi-greenhouse </v-icon>

                Nave {{ alarma.__numero_nave }}
              </span>

              <span class="alarm-meta">
                <v-icon size="15"> mdi-clock-outline </v-icon>

                {{ formatFecha(alarma.created_at) }}
              </span>

              <span v-if="alarma.resuelta_at" class="alarm-meta alarm-meta--resolved">
                <v-icon size="15"> mdi-check-circle-outline </v-icon>

                Resuelta
                {{ formatFecha(alarma.resuelta_at) }}
              </span>
            </div>
          </div>

          <div class="alarm-item__action">
            <v-tooltip
              v-if="normalizarTexto(alarma.estado) === 'activa'"
              text="Marcar como resuelta"
              location="top"
            >
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  color="success"
                  variant="tonal"
                  icon
                  size="small"
                  :loading="resolviendoId === alarma.id"
                  :disabled="resolviendoId !== null || resolviendoTodas"
                  @click="resolver(alarma.id)"
                >
                  <v-icon size="19"> mdi-check </v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <div v-else class="resolved-indicator">
              <v-icon size="20" color="success"> mdi-check-circle </v-icon>
            </div>
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

const resolviendoId = ref<number | null>(null)

const resolviendoTodas = ref(false)

const ultimaActualizacion = ref('')

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
    .filter((zona: any) => Boolean(obtenerLetraZona(zona)))
    .map((zona: any) => ({
      ...zona,

      nombre: obtenerLetraZona(zona) === 'A' ? 'Zona A' : 'Zona B',
    }))
    .sort((a: any, b: any) => String(a.nombre).localeCompare(String(b.nombre)))
})

const zonaFiltro = computed(() => {
  if (!filtros.zona_id) {
    return null
  }

  return zonaItems.value.find((zona: any) => Number(zona.id) === Number(filtros.zona_id)) ?? null
})

const zonaFiltroLetra = computed<'A' | 'B' | null>(() => {
  return obtenerLetraZona(zonaFiltro.value)
})

const zonaFiltroNombre = computed(() => {
  if (zonaFiltroLetra.value === 'A') {
    return 'Zona A'
  }

  if (zonaFiltroLetra.value === 'B') {
    return 'Zona B'
  }

  return ''
})

const distribucionFiltro = computed(() => {
  if (zonaFiltroLetra.value === 'A') {
    return 'Naves 1 · 3 · 5 · 7 · 9 · 11 · 13'
  }

  if (zonaFiltroLetra.value === 'B') {
    return 'Naves 2 · 4 · 6 · 8 · 10 · 12 · 14'
  }

  return ''
})

const numeroNaveAlarma = (alarma: any): number | null => {
  const candidatos = [
    alarma?.numero_nave,
    alarma?.nave_numero,
    alarma?.numeroNave,

    alarma?.galpon_numero,
    alarma?.numero_galpon,

    alarma?.invernadero_numero,
    alarma?.numero_invernadero,

    alarma?.nave_nombre,
    alarma?.galpon_nombre,
    alarma?.invernadero_nombre,
  ]

  for (const candidato of candidatos) {
    if (candidato === null || candidato === undefined) {
      continue
    }

    if (typeof candidato === 'number') {
      if (Number.isFinite(candidato) && candidato >= NAVE_MIN && candidato <= NAVE_MAX) {
        return candidato
      }

      continue
    }

    const coincidencia = String(candidato).match(/\d+/)

    if (!coincidencia) {
      continue
    }

    const numero = Number(coincidencia[0])

    if (Number.isFinite(numero) && numero >= NAVE_MIN && numero <= NAVE_MAX) {
      return numero
    }
  }

  /*
   * Si la alarma únicamente trae el
   * número dentro del mensaje, buscamos
   * específicamente expresiones como:
   *
   * Galpón 3
   * Invernadero 8
   * Nave 11
   *
   * No extraemos cualquier número porque
   * el mensaje podría contener 38 °C,
   * 70% de humedad, etc.
   */
  const mensaje = String(alarma?.mensaje ?? '')

  const coincidenciaMensaje = mensaje.match(/(?:nave|galp[oó]n|invernadero)\s*#?\s*(\d{1,2})/i)

  if (coincidenciaMensaje) {
    const numero = Number(coincidenciaMensaje[1])

    if (numero >= NAVE_MIN && numero <= NAVE_MAX) {
      return numero
    }
  }

  return null
}

const letraZonaAlarma = (alarma: any): 'A' | 'B' | null => {
  const numero = numeroNaveAlarma(alarma)

  if (numero !== null) {
    return numero % 2 !== 0 ? 'A' : 'B'
  }

  /*
   * Intentamos resolver por zona_id
   * utilizando únicamente A/B.
   */
  if (alarma?.zona_id) {
    const zona = zonaItems.value.find((item: any) => Number(item.id) === Number(alarma.zona_id))

    const letra = obtenerLetraZona(zona)

    if (letra) {
      return letra
    }
  }

  const nombre = normalizarTexto(alarma?.zona_nombre)

  if (nombre === 'a' || nombre.includes('zona a')) {
    return 'A'
  }

  if (nombre === 'b' || nombre.includes('zona b')) {
    return 'B'
  }

  return null
}

const nombreZonaAlarma = (alarma: any) => {
  const letra = letraZonaAlarma(alarma)

  if (letra) {
    return `Zona ${letra}`
  }

  return 'Zona no identificada'
}

const normalizarMensaje = (mensaje: string | null | undefined) => {
  if (!mensaje) {
    return 'Alarma detectada por el sistema'
  }

  return String(mensaje)
    .replace(/\bgalpones\b/gi, 'naves')
    .replace(/\bgalp[oó]n\b/gi, 'nave')
    .replace(/\binvernaderos\b/gi, 'naves')
    .replace(/\binvernadero\b/gi, 'nave')
    .replace(/\btinkerboard\b/gi, 'microcontrolador')
    .replace(/\btinker board\b/gi, 'microcontrolador')
}

const alarmasNormalizadas = computed(() => {
  return alarmas.value
    .map((alarma) => {
      const numeroNave = numeroNaveAlarma(alarma)

      return {
        ...alarma,

        mensaje: normalizarMensaje(alarma.mensaje),

        zona_nombre: nombreZonaAlarma(alarma),

        __numero_nave: numeroNave,

        __zona_letra: letraZonaAlarma(alarma),
      }
    })
    .sort((a, b) => {
      const fechaA = new Date(a.created_at ?? 0).getTime()

      const fechaB = new Date(b.created_at ?? 0).getTime()

      return fechaB - fechaA
    })
})

const alarmasFiltradas = computed(() => {
  let resultado = [...alarmasNormalizadas.value]

  if (filtros.estado !== 'Todos') {
    resultado = resultado.filter(
      (alarma) => normalizarTexto(alarma.estado) === normalizarTexto(filtros.estado),
    )
  }

  if (zonaFiltroLetra.value) {
    resultado = resultado.filter((alarma) => alarma.__zona_letra === zonaFiltroLetra.value)
  }

  return resultado
})

const resumen = computed(() => {
  const activas = alarmasNormalizadas.value.filter(
    (alarma) => normalizarTexto(alarma.estado) === 'activa',
  ).length

  const resueltas = alarmasNormalizadas.value.filter(
    (alarma) => normalizarTexto(alarma.estado) === 'resuelta',
  ).length

  return {
    activas,
    resueltas,

    total: alarmasNormalizadas.value.length,
  }
})

const indicadores = computed(() => [
  {
    label: 'Alarmas activas',

    value: resumen.value.activas,

    description: 'Requieren atención',

    icon: 'mdi-alert-circle-outline',

    color: 'error',
  },

  {
    label: 'Resueltas',

    value: resumen.value.resueltas,

    description: 'Incidencias atendidas',

    icon: 'mdi-check-circle-outline',

    color: 'success',
  },

  {
    label: 'Total registradas',

    value: resumen.value.total,

    description: 'Historial acumulado',

    icon: 'mdi-bell-outline',

    color: 'primary',
  },
])

const hayFiltrosActivos = computed(() => {
  return filtros.estado !== 'Todos' || filtros.zona_id !== null
})

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje

  snackbar.color = color

  snackbar.visible = true
}

const colorTipo = (tipo: string) => {
  switch (normalizarTexto(tipo)) {
    case 'temperatura_alta':
      return 'error'

    case 'viento_fuerte':
      return 'warning'

    case 'lluvia_inminente':
      return 'info'

    case 'humedad_alta':
      return 'primary'

    case 'variador_error':
    case 'error_variador':
      return 'error'

    case 'comunicacion_perdida':
    case 'microcontrolador_desconectado':
    case 'tinker_desconectado':
      return 'warning'

    default:
      return 'primary'
  }
}

const labelTipo = (tipo: string) => {
  switch (normalizarTexto(tipo)) {
    case 'temperatura_alta':
      return 'Temperatura'

    case 'viento_fuerte':
      return 'Viento'

    case 'lluvia_inminente':
      return 'Lluvia'

    case 'humedad_alta':
      return 'Humedad'

    case 'variador_error':
    case 'error_variador':
      return 'Variador'

    case 'comunicacion_perdida':
      return 'Comunicación'

    case 'microcontrolador_desconectado':
    case 'tinker_desconectado':
      return 'Microcontrolador'

    default:
      return tipo || 'Sistema'
  }
}

const iconTipo = (tipo: string) => {
  switch (normalizarTexto(tipo)) {
    case 'temperatura_alta':
      return 'mdi-thermometer-high'

    case 'viento_fuerte':
      return 'mdi-weather-windy'

    case 'lluvia_inminente':
      return 'mdi-weather-pouring'

    case 'humedad_alta':
      return 'mdi-water-percent'

    case 'variador_error':
    case 'error_variador':
      return 'mdi-engine-off-outline'

    case 'comunicacion_perdida':
      return 'mdi-access-point-off'

    case 'microcontrolador_desconectado':
    case 'tinker_desconectado':
      return 'mdi-chip'

    default:
      return 'mdi-alert-outline'
  }
}

const fechaValida = (fecha: string) => {
  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
    return null
  }

  return valor
}

const formatFecha = (fecha: string) => {
  if (!fecha) {
    return '—'
  }

  const valor = fechaValida(fecha)

  if (!valor) {
    return '—'
  }

  return valor.toLocaleString('es-EC', {
    day: '2-digit',

    month: 'short',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit',

    hour12: false,
  })
}

const limpiarFiltros = () => {
  filtros.estado = 'Todos'

  filtros.zona_id = null
}

const actualizarHora = () => {
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
    hour: '2-digit',

    minute: '2-digit',

    hour12: false,
  })
}

const cargar = async () => {
  if (cargando.value) {
    return
  }

  cargando.value = true

  try {
    /*
     * Cargamos todas las alarmas y
     * aplicamos los filtros en frontend.
     *
     * Mientras el backend conserve
     * asociaciones antiguas con Zona C/D,
     * esto permite reorganizar las alarmas:
     *
     * Zona A -> naves impares
     * Zona B -> naves pares
     */
    const { data } = await api.get('/alarmas')

    if (data?.ok) {
      alarmas.value = Array.isArray(data.data) ? data.data : []
    } else {
      alarmas.value = []
    }

    actualizarHora()
  } catch (error) {
    console.error('Error cargando alarmas:', error)

    alarmas.value = []

    mostrarSnackbar('Error cargando alarmas', 'error')
  } finally {
    cargando.value = false
  }
}

const resolver = async (id: number) => {
  if (resolviendoId.value !== null || resolviendoTodas.value) {
    return
  }

  resolviendoId.value = id

  try {
    const { data } = await api.patch(`/alarmas/${id}/resolver`)

    if (data?.ok === false) {
      throw new Error(data?.message || 'No fue posible resolver la alarma')
    }

    mostrarSnackbar('Alarma resuelta correctamente')

    await cargar()
  } catch (error) {
    console.error('Error resolviendo alarma:', error)

    mostrarSnackbar('Error resolviendo la alarma', 'error')
  } finally {
    resolviendoId.value = null
  }
}

const resolverTodas = async () => {
  if (resolviendoTodas.value || resumen.value.activas === 0) {
    return
  }

  resolviendoTodas.value = true

  try {
    const { data } = await api.patch('/alarmas/resolver-todas')

    if (data?.ok === false) {
      throw new Error(data?.message || 'No fue posible resolver las alarmas')
    }

    mostrarSnackbar('Todas las alarmas fueron resueltas')

    await cargar()
  } catch (error) {
    console.error('Error resolviendo las alarmas:', error)

    mostrarSnackbar('Error resolviendo las alarmas', 'error')
  } finally {
    resolviendoTodas.value = false
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

  font-size: 1.4rem;
  font-weight: 750;
  line-height: 1.3;

  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 4px 0 0;

  font-size: 0.875rem;
  line-height: 1.45;

  color: rgba(var(--v-theme-on-surface), 0.6);
}

.status-chip {
  font-weight: 600;
}

.page-header__actions {
  display: flex;
  align-items: center;

  gap: 10px;
}

.last-update {
  display: flex;
  align-items: center;

  gap: 5px;

  margin-right: 2px;

  font-size: 0.74rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.stat-card {
  position: relative;

  min-height: 110px;

  display: flex;
  align-items: center;

  gap: 14px;

  padding: 17px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.055) !important;
}

.stat-card__icon {
  width: 46px;
  height: 46px;

  flex: 0 0 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;
}

.stat-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.stat-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.stat-card__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.stat-card__content {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.stat-card__label {
  font-size: 0.76rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.stat-card__value {
  margin-top: 2px;

  font-size: 1.6rem;
  font-weight: 750;
  line-height: 1.1;
}

.stat-card__description {
  margin-top: 3px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.stat-card__accent {
  position: absolute;

  top: 22px;
  right: 0;
  bottom: 22px;

  width: 3px;

  border-radius: 4px 0 0 4px;
}

.stat-card__accent--error {
  background: rgb(var(--v-theme-error));
}

.stat-card__accent--success {
  background: rgb(var(--v-theme-success));
}

.stat-card__accent--primary {
  background: rgb(var(--v-theme-primary));
}

.main-card {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.alarm-toolbar {
  min-height: 84px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 15px 18px;
}

.alarm-toolbar__title {
  flex-shrink: 0;

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

.alarm-toolbar__title h2 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.alarm-toolbar__title span {
  display: block;

  margin-top: 3px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

.alarm-toolbar__filters {
  display: flex;
  align-items: center;

  gap: 9px;
}

.filter-field {
  width: 200px;
}

.filter-field :deep(.v-field__input) {
  font-size: 0.84rem;
}

.filter-field :deep(.v-field-label) {
  font-size: 0.8rem;
}

.filter-field :deep(.v-select__selection-text) {
  font-size: 0.84rem;
}

.filter-status {
  min-height: 58px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 9px 18px;

  background: rgba(var(--v-theme-primary), 0.025);
}

.filter-status__main {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 9px;
}

.filter-status__icon {
  width: 34px;
  height: 34px;

  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.08);
}

.filter-status__main > div:last-child {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.filter-status__main strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.filter-status__main span {
  margin-top: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.filter-status__count {
  display: flex;
  align-items: baseline;

  gap: 4px;

  flex-shrink: 0;
}

.filter-status__count strong {
  font-size: 0.8rem;
  font-weight: 700;
}

.filter-status__count span {
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.alarm-list {
  padding: 8px 14px 14px;
}

.alarm-item {
  position: relative;

  min-height: 88px;

  display: flex;
  align-items: center;

  gap: 13px;

  margin-top: 8px;

  padding: 13px 13px 13px 16px;

  overflow: hidden;

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

  border-color: rgba(var(--v-theme-primary), 0.22);

  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.045);
}

.alarm-item--active {
  background: linear-gradient(90deg, rgba(var(--v-theme-error), 0.035), transparent 43%);
}

.alarm-item--resolved {
  opacity: 0.78;
}

.alarm-severity-line {
  position: absolute;

  top: 15px;
  left: 0;
  bottom: 15px;

  width: 3px;

  border-radius: 0 4px 4px 0;
}

.alarm-severity-line--error {
  background: rgb(var(--v-theme-error));
}

.alarm-severity-line--warning {
  background: rgb(var(--v-theme-warning));
}

.alarm-severity-line--info {
  background: rgb(var(--v-theme-info));
}

.alarm-severity-line--primary {
  background: rgb(var(--v-theme-primary));
}

.alarm-severity-line--resolved {
  background: rgb(var(--v-theme-success));
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

.alarm-item__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.alarm-item__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.alarm-item__icon--info {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.alarm-item__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.alarm-item__icon--resolved {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.alarm-item__content {
  min-width: 0;
  flex: 1;
}

.alarm-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;
}

.alarm-item__message {
  min-width: 0;

  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.45;
}

.alarm-item__chips {
  display: flex;
  align-items: center;

  gap: 7px;

  flex-shrink: 0;
}

.alarm-type-chip {
  font-size: 0.72rem;
  font-weight: 550;
}

.alarm-state-chip {
  font-size: 0.72rem;
  font-weight: 600;
}

.alarm-state-dot {
  width: 6px;
  height: 6px;

  margin-right: 6px;

  border-radius: 50%;
}

.alarm-state-dot--active {
  background: rgb(var(--v-theme-error));
}

.alarm-state-dot--resolved {
  background: rgb(var(--v-theme-success));
}

.alarm-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  gap: 7px 16px;

  margin-top: 8px;
}

.alarm-meta {
  display: inline-flex;
  align-items: center;

  gap: 4px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.54);
}

.alarm-meta--resolved {
  color: rgb(var(--v-theme-success));
}

.alarm-item__action {
  min-width: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.resolved-indicator {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: rgba(var(--v-theme-success), 0.06);
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

  font-size: 0.95rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 390px;

  margin: 6px 0 18px;

  font-size: 0.78rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.54);
}

.alarm-skeleton {
  min-height: 78px;

  display: flex;
  align-items: center;

  margin-bottom: 8px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), 0.45);

  border-radius: 14px;
}

@media (max-width: 1050px) {
  .page-header {
    align-items: flex-start;
  }

  .last-update {
    display: none;
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
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;

    gap: 15px;
  }

  .page-header__content {
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
    font-size: 0.8rem;
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions .v-btn {
    flex: 1;
  }

  .stat-card {
    min-height: 92px;

    padding: 13px;

    gap: 10px;
  }

  .stat-card__icon {
    width: 40px;
    height: 40px;

    flex-basis: 40px;
  }

  .stat-card__value {
    font-size: 1.35rem;
  }

  .alarm-toolbar {
    padding: 14px;
  }

  .alarm-toolbar__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-field {
    width: 100%;
  }

  .filter-status {
    padding: 9px 14px;
  }

  .alarm-item {
    align-items: flex-start;

    padding: 13px 12px 13px 15px;
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
  .status-chip {
    display: none;
  }

  .page-header__actions {
    display: grid;

    grid-template-columns:
      1fr
      1fr;
  }

  .page-header__actions .v-btn {
    width: 100%;
  }

  .filter-status {
    align-items: flex-start;
  }

  .filter-status__count {
    display: none;
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
    padding-right: 37px;
  }
}
</style>