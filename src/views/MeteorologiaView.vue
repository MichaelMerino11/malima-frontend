<template>
  <v-container fluid class="meteorologia-page pa-4 pa-md-6">
    <div class="page-header mb-5">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-weather-partly-cloudy </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Meteorología</h1>

            <v-chip
              v-if="datos"
              :color="estadoClima.color"
              variant="tonal"
              size="small"
              class="weather-status"
            >
              <v-icon start size="16">
                {{ estadoClima.icono }}
              </v-icon>

              {{ estadoClima.texto }}
            </v-chip>
          </div>

          <p class="page-subtitle">Monitoreo climático y condiciones ambientales en tiempo real</p>
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
          :disabled="zonaItems.length === 0 || actualizando"
          @update:model-value="cargar"
        />

        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="actualizando"
          :disabled="!zonaSeleccionada"
          @click="cargar"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="riesgoClimatico"
      type="warning"
      variant="tonal"
      rounded="xl"
      class="risk-alert mb-5"
    >
      <template #prepend>
        <div class="risk-alert__icon">
          <v-icon size="24"> mdi-weather-pouring </v-icon>
        </div>
      </template>

      <template #title>
        <span class="risk-alert__title"> Condiciones climáticas de riesgo </span>
      </template>

      <div class="risk-alert__content">
        <span>
          {{ textoAlerta }}
        </span>

        <v-chip size="small" color="warning" variant="flat">
          <v-icon start size="15"> mdi-greenhouse </v-icon>

          Revisar naves
        </v-chip>
      </div>
    </v-alert>

    <div v-if="zonaItems.length === 0 && !store.cargando" class="empty-state">
      <div class="empty-state__icon">
        <v-icon size="46" color="primary"> mdi-map-marker-off-outline </v-icon>
      </div>

      <h3>No hay zonas disponibles</h3>

      <p>No se encontraron Zona A o Zona B configuradas en el sistema.</p>
    </div>

    <div v-else-if="!datos && !store.cargando" class="empty-state">
      <div class="empty-state__icon">
        <v-icon size="46" color="primary"> mdi-weather-cloudy-alert </v-icon>
      </div>

      <h3>Sin datos meteorológicos</h3>

      <p>
        No hay lecturas disponibles para
        {{ zonaActualNombre }}. El sensor actualizará los datos automáticamente.
      </p>

      <v-btn
        color="primary"
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-refresh"
        @click="cargar"
      >
        Consultar nuevamente
      </v-btn>
    </div>

    <template v-if="datos">
      <v-card rounded="xl" elevation="0" class="weather-overview mb-5">
        <div class="weather-overview__main">
          <div class="current-weather">
            <div
              class="current-weather__icon"
              :class="`current-weather__icon--${estadoClima.color}`"
            >
              <v-icon size="40">
                {{ estadoClima.icono }}
              </v-icon>
            </div>

            <div class="semaforo">
              <div
                class="semaforo__luz"
                :class="{ 'semaforo__luz--activa': estadoClima.semaforo === 'rojo' }"
                style="background: #ef5350"
              />
              <div
                class="semaforo__luz"
                :class="{ 'semaforo__luz--activa': estadoClima.semaforo === 'amarillo' }"
                style="background: #ffa726"
              />
              <div
                class="semaforo__luz"
                :class="{ 'semaforo__luz--activa': estadoClima.semaforo === 'verde' }"
                style="background: #66bb6a"
              />
            </div>

            <div class="current-weather__temperature">
              <span> Temperatura actual </span>

              <div>
                {{ formatearNumero(datos.temperatura) }}

                <small> °C </small>
              </div>
            </div>
          </div>

          <div class="current-weather__info">
            <div>
              <span> Condición </span>

              <strong>
                {{ estadoClima.texto }}
              </strong>
            </div>

            <div>
              <span> Zona </span>

              <strong>
                {{ zonaActualNombre }}
              </strong>
            </div>

            <div>
              <span> Última lectura </span>

              <strong>
                {{ formatHoraCorta(datos.registrado_at) }}
              </strong>
            </div>
          </div>
        </div>

        <div class="weather-overview__status">
          <div class="sensor-status">
            <span class="sensor-dot" />

            <div>
              <strong> Sensor activo </strong>

              <span> Actualización cada 30 segundos </span>
            </div>
          </div>

          <div class="refresh-progress">
            <div class="refresh-progress__header">
              <span> Próxima actualización </span>

              <strong> {{ segundosRestantes }} s </strong>
            </div>

            <v-progress-linear v-model="progreso" color="primary" rounded height="5" />
          </div>
        </div>
      </v-card>

      <div class="metrics-grid mb-5">
        <v-card
          v-for="metrica in metricas"
          :key="metrica.label"
          rounded="xl"
          elevation="0"
          class="metric-card"
        >
          <div class="metric-card__icon" :class="`metric-card__icon--${metrica.color}`">
            <v-icon size="23">
              {{ metrica.icon }}
            </v-icon>
          </div>

          <div class="metric-card__body">
            <span class="metric-card__label">
              {{ metrica.label }}
            </span>

            <div class="metric-card__value">
              {{ metrica.value }}

              <small v-if="metrica.unit">
                {{ metrica.unit }}
              </small>
            </div>

            <v-progress-linear
              :model-value="metrica.progress"
              :color="metrica.color"
              rounded
              height="4"
              class="mt-2"
            />
          </div>

          <span class="metric-card__accent" :class="`metric-card__accent--${metrica.color}`" />
        </v-card>
      </div>

      <v-card
        rounded="xl"
        elevation="0"
        class="recommendation-card mb-5"
        :class="`recommendation-card--${recomendacion.color}`"
      >
        <div
          class="recommendation-card__icon"
          :class="`recommendation-card__icon--${recomendacion.color}`"
        >
          <v-icon size="28">
            {{ recomendacion.icono }}
          </v-icon>
        </div>

        <div class="recommendation-card__content">
          <span class="recommendation-label"> Recomendación operativa </span>

          <h3>
            {{ recomendacion.titulo }}
          </h3>

          <p>
            {{ recomendacion.texto }}
          </p>
        </div>

        <div class="recommendation-card__status">
          <v-chip :color="recomendacion.color" variant="tonal" size="small">
            <v-icon start size="15">
              {{
                recomendacion.color === 'success'
                  ? 'mdi-check-circle-outline'
                  : 'mdi-alert-circle-outline'
              }}
            </v-icon>

            {{ recomendacion.color === 'success' ? 'Condición segura' : 'Requiere atención' }}
          </v-chip>
        </div>
      </v-card>

      <div class="chart-wrapper mb-5">
        <GraficoMeteo
          :datos="historialGrafico"
          :rango="rangoGrafico"
          :cargando="cargandoGrafico"
          @cambiar-rango="cambiarRangoGrafico"
        />
      </div>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card rounded="xl" elevation="0" class="dashboard-card h-100">
            <div class="card-header">
              <div class="card-header__main">
                <div class="card-header__icon">
                  <v-icon size="20"> mdi-history </v-icon>
                </div>

                <div>
                  <h2>Historial reciente</h2>

                  <p>Últimas lecturas registradas por el sensor</p>
                </div>
              </div>

              <div class="history-actions">
                <v-chip size="small" variant="tonal" color="primary">
                  {{ historialReciente.length }}
                  registros
                </v-chip>

                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  rounded="lg"
                  prepend-icon="mdi-export-variant"
                  :disabled="historialReciente.length === 0"
                  @click="modalExportar = true"
                >
                  Exportar
                </v-btn>
              </div>
            </div>

            <v-divider />

            <div class="history-table-wrapper">
              <v-data-table
                :headers="headersHistorial"
                :items="historialReciente"
                :loading="cargandoHistorialReciente"
                density="comfortable"
                no-data-text="Sin registros disponibles"
                hide-default-footer
                :items-per-page="8"
                class="history-table"
              >
                <template #item.registrado_at="{ item }">
                  <div class="date-cell">
                    <v-icon size="15"> mdi-clock-outline </v-icon>

                    <span>
                      {{ formatFecha(item.registrado_at) }}
                    </span>
                  </div>
                </template>

                <template #item.temperatura="{ item }">
                  <div class="table-value">
                    <v-icon size="16" color="error"> mdi-thermometer </v-icon>

                    {{ formatearNumero(item.temperatura) }}°C
                  </div>
                </template>

                <template #item.humedad="{ item }">
                  <div class="table-value">
                    <v-icon size="16" color="info"> mdi-water-percent </v-icon>

                    {{ formatearNumero(item.humedad) }}%
                  </div>
                </template>

                <template #item.velocidad_viento="{ item }">
                  <div class="table-value">
                    <v-icon size="16" color="warning"> mdi-weather-windy </v-icon>

                    {{ formatearNumero(item.velocidad_viento) }}
                    km/h
                  </div>
                </template>

                <template #item.lluvia_intensidad="{ item }">
                  <div class="table-value">
                    <v-icon size="16" color="info"> mdi-weather-rainy </v-icon>
                    {{
                      item.lluvia_intensidad != null
                        ? `${formatearNumero(item.lluvia_intensidad)} mm/h`
                        : '—'
                    }}
                  </div>
                </template>

                <template #item.lluvia_acumulada="{ item }">
                  <div class="table-value">
                    <v-icon size="16" color="primary"> mdi-cup-water </v-icon>
                    {{
                      item.lluvia_acumulada != null
                        ? `${formatearNumero(item.lluvia_acumulada)} mm`
                        : '—'
                    }}
                  </div>
                </template>

                <template #item.presion_atmosferica="{ item }">
                  <div class="table-value">
                    <v-icon size="16" color="purple"> mdi-gauge </v-icon>
                    {{
                      item.presion_atmosferica != null
                        ? formatearNumero(item.presion_atmosferica)
                        : '--'
                    }}
                    hPa
                  </div>
                </template>
              </v-data-table>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card rounded="xl" elevation="0" class="dashboard-card conditions-card">
            <div class="card-header">
              <div class="card-header__main">
                <div class="card-header__icon">
                  <v-icon size="20"> mdi-clipboard-check-outline </v-icon>
                </div>

                <div>
                  <h2>Estado de condiciones</h2>

                  <p>Evaluación automática de riesgos</p>
                </div>
              </div>

              <v-chip
                :color="cantidadAlertas > 0 ? 'warning' : 'success'"
                size="small"
                variant="tonal"
              >
                {{ cantidadAlertas > 0 ? `${cantidadAlertas} alertas` : 'Normal' }}
              </v-chip>
            </div>

            <v-divider />

            <div class="conditions-list">
              <div v-for="condicion in condiciones" :key="condicion.label" class="condition-item">
                <div
                  class="condition-item__icon"
                  :class="`condition-item__icon--${condicion.color}`"
                >
                  <v-icon size="18">
                    {{ condicion.icon }}
                  </v-icon>
                </div>

                <div class="condition-item__content">
                  <div class="condition-item__title">
                    <strong>
                      {{ condicion.label }}
                    </strong>

                    <span :class="`condition-status--${condicion.color}`">
                      {{ condicion.estado }}
                    </span>
                  </div>

                  <p>
                    {{ condicion.detalle }}
                  </p>
                </div>
              </div>
            </div>
          </v-card>

          <v-card rounded="xl" elevation="0" class="dashboard-card reading-card mt-4">
            <div class="reading-card__content">
              <div class="reading-card__icon">
                <v-icon size="21"> mdi-clock-check-outline </v-icon>
              </div>

              <div>
                <span> Última lectura registrada </span>

                <strong>
                  {{ formatFecha(datos.registrado_at) }}
                </strong>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- SEPARADOR VISUAL -->
    <v-divider class="my-6" />

    <!-- SECCIÓN CONFIGURACIÓN DE LLUVIA -->
    <v-card rounded="xl" elevation="0" class="rain-config-card">
      <div class="rain-config-card__header">
        <div class="rain-config-card__title">
          <div class="section-icon section-icon--info">
            <v-icon size="21"> mdi-tune </v-icon>
          </div>
          <div>
            <h2>Configuración de lluvia</h2>
            <p>Parámetros que controlan la protección meteorológica automática del PLC</p>
          </div>
        </div>
        <v-chip color="info" variant="tonal" size="small">
          <v-icon start size="15"> mdi-chip </v-icon>
          PLC1
        </v-chip>
      </div>
      <v-divider />
      <div class="rain-config-notice">
        <div class="rain-config-notice__icon">
          <v-icon size="19"> mdi-information-outline </v-icon>
        </div>
        <div>
          <strong>Configuración operativa sensible</strong>
          <span
            >Estos parámetros afectan la lógica automática de cierre y reapertura de las naves por
            lluvia. El PLC ejecuta la protección de forma autónoma.</span
          >
        </div>
      </div>
      <div class="rain-config-grid">
        <div class="rain-config-item">
          <div class="rain-config-item__header">
            <div class="rain-config-item__icon rain-config-item__icon--primary">
              <v-icon size="19"> mdi-water-alert-outline </v-icon>
            </div>
            <div>
              <strong>Umbral de lluvia</strong>
              <span>MW34 — Valor RAW del sensor</span>
            </div>
          </div>
          <v-text-field
            v-model.number="lluviaConfig.umbral_raw"
            type="number"
            :min="1"
            :max="32766"
            suffix="RAW"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details
            prepend-inner-icon="mdi-water-alert-outline"
            class="rain-config-input"
          />
          <span class="rain-config-hint">Rango: 1 — 32766 RAW</span>
        </div>
        <div class="rain-config-item">
          <div class="rain-config-item__header">
            <div class="rain-config-item__icon rain-config-item__icon--info">
              <v-icon size="19"> mdi-timer-outline </v-icon>
            </div>
            <div>
              <strong>Confirmación de lluvia</strong>
              <span>MW35 — Tiempo continuo sobre umbral</span>
            </div>
          </div>
          <v-text-field
            v-model.number="lluviaConfig.confirmacion_min"
            type="number"
            :min="0.017"
            :max="166.65"
            :step="0.5"
            suffix="min"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details
            prepend-inner-icon="mdi-timer-outline"
            class="rain-config-input"
          />
          <span class="rain-config-hint"
            >{{ Math.round(lluviaConfig.confirmacion_min * 60) }} s — Rango: 1 — 9999 s</span
          >
        </div>
        <div class="rain-config-item">
          <div class="rain-config-item__header">
            <div class="rain-config-item__icon rain-config-item__icon--success">
              <v-icon size="19"> mdi-weather-sunny-alert </v-icon>
            </div>
            <div>
              <strong>Tiempo seco para reapertura</strong>
              <span>MW36 — Tiempo continuo bajo umbral</span>
            </div>
          </div>
          <v-text-field
            v-model.number="lluviaConfig.seco_min"
            type="number"
            :min="0.017"
            :max="166.65"
            :step="0.5"
            suffix="min"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details
            prepend-inner-icon="mdi-weather-sunny-alert"
            class="rain-config-input"
          />
          <span class="rain-config-hint"
            >{{ Math.round(lluviaConfig.seco_min * 60) }} s — Rango: 1 — 9999 s</span
          >
        </div>
      </div>
      <div class="rain-config-actions">
        <div
          v-if="lluviaConfigEstado.mensaje"
          class="rain-config-feedback"
          :class="`rain-config-feedback--${lluviaConfigEstado.color}`"
        >
          <v-icon size="18">
            {{
              lluviaConfigEstado.color === 'success'
                ? 'mdi-check-circle-outline'
                : 'mdi-alert-circle-outline'
            }}
          </v-icon>
          <span>{{ lluviaConfigEstado.mensaje }}</span>
        </div>
        <v-btn
          color="info"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-content-save-outline"
          :loading="guardandoLluvia"
          @click="guardarConfigLluvia"
        >
          Guardar configuración
        </v-btn>
      </div>
    </v-card>

    <ModalExportar v-model="modalExportar" tipo="meteorologia" :datos="historialReciente" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

import { storeToRefs } from 'pinia'

import { useMeteorologiaStore } from '../stores/meteorologia'
import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'

import GraficoMeteo from '../components/meteorologia/GraficoMeteo.vue'
import ModalExportar from '../components/shared/ModalExportar.vue'

import api from '../api/axios'

const loadingStore = useLoadingStore()

const store = useMeteorologiaStore()

const invernaderosStore = useInvernaderosStore()

const { datos } = storeToRefs(store)

const { zonas } = storeToRefs(invernaderosStore)

const zonaSeleccionada = ref<number | null>(null)

const historialGrafico = ref<any[]>([])
const historialReciente = ref<any[]>([])

const cargandoGrafico = ref(false)
const cargandoHistorialReciente = ref(false)

const actualizando = ref(false)
const modalExportar = ref(false)
const progreso = ref(100)

let solicitudHistorialId = 0

let intervalo: ReturnType<typeof setInterval> | undefined

let intervaloProg: ReturnType<typeof setInterval> | undefined

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

const zonaActualNombre = computed(() => {
  const zona = zonaItems.value.find(
    (item: any) => Number(item.id) === Number(zonaSeleccionada.value),
  )

  return zona?.nombre || 'Zona seleccionada'
})

const segundosRestantes = computed(() => {
  return Math.max(0, Math.ceil((progreso.value / 100) * 30))
})

const velocidadViento = computed(() => {
  return Number(datos.value?.velocidad_viento ?? 0)
})

const riesgoClimatico = computed(() => {
  if (!datos.value) {
    return false
  }
  return Number(datos.value.lluvia_intensidad ?? 0) > 0 || velocidadViento.value > 40
})

const textoAlerta = computed(() => {
  if (!datos.value) {
    return ''
  }
  const lluvia = Number(datos.value.lluvia_intensidad ?? 0) > 0
  const viento = velocidadViento.value > 40
  if (lluvia && viento) {
    return (
      `Se detectó lluvia activa (${formatearNumero(datos.value.lluvia_intensidad)} mm/h) ` +
      `y viento de ${formatearNumero(velocidadViento.value)} km/h. ` +
      'Se recomienda realizar el cierre preventivo de las naves.'
    )
  }
  if (lluvia) {
    return (
      `Se detectó lluvia activa con intensidad de ${formatearNumero(datos.value.lluvia_intensidad)} mm/h. ` +
      'Se recomienda realizar el cierre preventivo de las naves.'
    )
  }
  return (
    `La velocidad del viento alcanzó ${formatearNumero(velocidadViento.value)} km/h. ` +
    'Se recomienda realizar el cierre preventivo de las naves.'
  )
})

type LecturaMeteorologicaExtendida = NonNullable<typeof datos.value> & {
  condicion?: string | null
  estado_cielo?: string | null
  estado_clima?: string | null
  clima?: string | null
}

const obtenerCondicionBackend = () => {
  if (!datos.value) {
    return ''
  }

  const lectura = datos.value as LecturaMeteorologicaExtendida

  return String(
    lectura.condicion ?? lectura.estado_cielo ?? lectura.estado_clima ?? lectura.clima ?? '',
  ).trim()
}

const condicionDesdeBackend = (condicion: string) => {
  const valor = normalizarTexto(condicion)

  if (valor.includes('torment'))
    return {
      texto: condicion,
      color: 'error',
      icono: 'mdi-weather-lightning-rainy',
      semaforo: 'rojo',
    }

  if (valor.includes('lluv'))
    return { texto: condicion, color: 'info', icono: 'mdi-weather-pouring', semaforo: 'rojo' }

  if (valor.includes('parcial'))
    return {
      texto: condicion,
      color: 'info',
      icono: 'mdi-weather-partly-cloudy',
      semaforo: 'amarillo',
    }

  if (valor.includes('nubl'))
    return { texto: condicion, color: 'primary', icono: 'mdi-weather-cloudy', semaforo: 'amarillo' }

  if (valor.includes('sol') || valor.includes('despej'))
    return { texto: condicion, color: 'warning', icono: 'mdi-weather-sunny', semaforo: 'verde' }

  return {
    texto: condicion,
    color: 'primary',
    icono: 'mdi-weather-partly-cloudy',
    semaforo: 'amarillo',
  }
}

const estadoClima = computed(() => {
  if (!datos.value) {
    return {
      texto: 'Sin datos',
      color: 'primary',
      icono: 'mdi-help-circle-outline',
      semaforo: 'amarillo',
    }
  }

  /*
   * Si el backend ya entrega
   * una condición meteorológica,
   * siempre tiene prioridad.
   */
  const condicionBackend = obtenerCondicionBackend()

  if (condicionBackend) {
    return condicionDesdeBackend(condicionBackend)
  }

  /*
   * Fallback usado también en Home
   * cuando el backend no entrega
   * una condición textual.
   */

  const viento = Number(datos.value.velocidad_viento ?? 0)
  const radiacion = Number(datos.value.radiacion_solar ?? 0)
  const humedad = Number(datos.value.humedad ?? 0)
  const lluviaIntensidad = Number(datos.value.lluvia_intensidad ?? 0)

  if (viento > 40) {
    return {
      texto: 'Viento fuerte',
      color: 'warning',
      icono: 'mdi-weather-windy',
      semaforo: 'rojo',
    }
  }

  if (lluviaIntensidad > 0) {
    return { texto: 'Lluvioso', color: 'info', icono: 'mdi-weather-pouring', semaforo: 'rojo' }
  }

  if (humedad >= 85) {
    return {
      texto: 'Muy húmedo',
      color: 'primary',
      icono: 'mdi-weather-cloudy',
      semaforo: 'amarillo',
    }
  }

  if (radiacion >= 400) {
    return { texto: 'Soleado', color: 'warning', icono: 'mdi-weather-sunny', semaforo: 'verde' }
  }

  return { texto: 'Despejado', color: 'primary', icono: 'mdi-weather-sunset', semaforo: 'verde' }
})

const recomendacion = computed(() => {
  if (!datos.value) {
    return {
      titulo: 'Sin información',

      texto: 'No existen datos suficientes para generar una recomendación.',

      color: 'primary',

      icono: 'mdi-information-outline',
    }
  }

  const lluvia = Number(datos.value.lluvia_intensidad ?? 0)
  const viento = Number(datos.value.velocidad_viento ?? 0)
  
  if (lluvia > 0 || viento > 40) {
    return {
      titulo: 'Cerrar naves',

      texto:
        'Las condiciones meteorológicas actuales representan un riesgo. ' +
        'Se recomienda realizar el cierre preventivo de las naves.',

      color: 'error',

      icono: 'mdi-shield-alert-outline',
    }
  }

  return {
    titulo: 'Mantener operación normal',

    texto:
      'Las condiciones meteorológicas son favorables y no se detectan riesgos inmediatos para las naves.',

    color: 'success',

    icono: 'mdi-shield-check-outline',
  }
})

const normalizar = (valor: number, minimo: number, maximo: number) => {
  if (maximo === minimo) {
    return 0
  }

  return Math.min(100, Math.max(0, ((valor - minimo) / (maximo - minimo)) * 100))
}

const formatearNumero = (valor: number | string | null | undefined) => {
  const numero = Number(valor ?? 0)

  if (Number.isNaN(numero)) {
    return '0.0'
  }

  return numero.toFixed(1)
}

const rangoGrafico = ref('1h')

const metricas = computed(() => {
  if (!datos.value) {
    return []
  }

  const temperatura = Number(datos.value.temperatura ?? 0)

  const humedad = Number(datos.value.humedad ?? 0)

  const viento = Number(datos.value.velocidad_viento ?? 0)

  const presion = Number(datos.value.presion_atmosferica ?? 1013)

  return [
    {
      label: 'Temperatura',

      value: formatearNumero(temperatura),

      unit: '°C',

      icon: 'mdi-thermometer',

      color: temperatura > 35 ? 'error' : 'primary',

      progress: normalizar(temperatura, 0, 50),
    },

    {
      label: 'Humedad',

      value: formatearNumero(humedad),

      unit: '%',

      icon: 'mdi-water-percent',

      color: humedad > 85 ? 'warning' : 'info',

      progress: normalizar(humedad, 0, 100),
    },

    {
      label: 'Viento',

      value: formatearNumero(viento),

      unit: 'km/h',

      icon: 'mdi-weather-windy',

      color: viento > 40 ? 'error' : 'warning',

      progress: normalizar(viento, 0, 100),
    },

    {
      label: 'Int. lluvia',
      value:
        datos.value?.lluvia_intensidad != null
          ? formatearNumero(datos.value.lluvia_intensidad)
          : '--',
      unit: datos.value?.lluvia_intensidad != null ? 'mm/h' : '',
      icon: 'mdi-weather-rainy',
      color: 'info',
      progress: normalizar(Number(datos.value?.lluvia_intensidad ?? 0), 0, 50),
    },
    {
      label: 'Lluvia acum.',
      value:
        datos.value?.lluvia_acumulada != null
          ? formatearNumero(datos.value.lluvia_acumulada)
          : '--',
      unit: datos.value?.lluvia_acumulada != null ? 'mm' : '',
      icon: 'mdi-cup-water',
      color: 'primary',
      progress: normalizar(Number(datos.value?.lluvia_acumulada ?? 0), 0, 100),
    },

    {
      label: 'Presión',

      value: formatearNumero(presion),

      unit: 'hPa',

      icon: 'mdi-gauge',

      color: presion < 1000 ? 'warning' : 'primary',

      progress: normalizar(presion, 950, 1050),
    },
  ]
})

const condiciones = computed(() => {
  if (!datos.value) {
    return []
  }

  const temperaturaAlta = Number(datos.value.temperatura ?? 0) > 35

  const humedadAlta = Number(datos.value.humedad ?? 0) > 85

  const vientoFuerte = Number(datos.value.velocidad_viento ?? 0) > 40

  const presionBaja = Number(datos.value.presion_atmosferica ?? 1013) < 1000

  return [
    {
      label: 'Temperatura',

      estado: temperaturaAlta ? 'Alta' : 'Normal',

      detalle: temperaturaAlta ? 'Riesgo térmico para cultivos' : 'Dentro del rango esperado',

      color: temperaturaAlta ? 'error' : 'success',

      icon: temperaturaAlta ? 'mdi-alert-outline' : 'mdi-check',

      alerta: temperaturaAlta,
    },

    {
      label: 'Humedad',

      estado: humedadAlta ? 'Alta' : 'Normal',

      detalle: humedadAlta ? 'Mayor riesgo de hongos' : 'Nivel adecuado',

      color: humedadAlta ? 'warning' : 'success',

      icon: humedadAlta ? 'mdi-alert-outline' : 'mdi-check',

      alerta: humedadAlta,
    },

    {
      label: 'Viento',

      estado: vientoFuerte ? 'Fuerte' : 'Normal',

      detalle: vientoFuerte ? 'Se recomienda cerrar las naves' : 'Velocidad segura',

      color: vientoFuerte ? 'error' : 'success',

      icon: vientoFuerte ? 'mdi-alert-outline' : 'mdi-check',

      alerta: vientoFuerte,
    },

    {
      label: 'Lluvia',
      estado: Number(datos.value?.lluvia_intensidad ?? 0) > 0 ? 'Activa' : 'Sin lluvia',
      detalle:
        Number(datos.value?.lluvia_intensidad ?? 0) > 0
          ? `Intensidad: ${formatearNumero(datos.value?.lluvia_intensidad)} mm/h · Acumulado: ${formatearNumero(datos.value?.lluvia_acumulada)} mm`
          : `Acumulado: ${formatearNumero(datos.value?.lluvia_acumulada ?? 0)} mm`,
      color: Number(datos.value?.lluvia_intensidad ?? 0) > 0 ? 'error' : 'success',
      icon: Number(datos.value?.lluvia_intensidad ?? 0) > 0 ? 'mdi-alert-outline' : 'mdi-check',
      alerta: Number(datos.value?.lluvia_intensidad ?? 0) > 0,
    },

    {
      label: 'Presión atmosférica',

      estado: presionBaja ? 'Baja' : 'Normal',

      detalle: presionBaja ? 'Posible cambio meteorológico' : 'Presión estable',

      color: presionBaja ? 'warning' : 'success',

      icon: presionBaja ? 'mdi-alert-outline' : 'mdi-check',

      alerta: presionBaja,
    },
  ]
})

const cantidadAlertas = computed(() => {
  return condiciones.value.filter((condicion) => condicion.alerta).length
})

const cambiarRangoGrafico = async (rango: string) => {
  rangoGrafico.value = rango

  if (!zonaSeleccionada.value) {
    return
  }

  await cargarHistorial(Number(zonaSeleccionada.value), rango, true)
}

const headersHistorial = [
  { title: 'Fecha', key: 'registrado_at' },
  { title: 'Temp.', key: 'temperatura' },
  { title: 'Humedad', key: 'humedad' },
  { title: 'Viento', key: 'velocidad_viento' },
  { title: 'Int. lluvia', key: 'lluvia_intensidad' },
  { title: 'Lluvia acum.', key: 'lluvia_acumulada' },
  { title: 'Presión', key: 'presion_atmosferica' },
]

const formatFecha = (fecha: string) => {
  if (!fecha) {
    return '--'
  }

  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleString('es-EC', {
    day: '2-digit',

    month: '2-digit',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit',

    hour12: false,
  })
}

const formatHoraCorta = (fecha: string) => {
  if (!fecha) {
    return '--'
  }

  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',

    minute: '2-digit',

    hour12: false,
  })
}

const cargarHistorial = async (zonaId: number, rango = '1h', mostrarCarga = false) => {
  const solicitudId = ++solicitudHistorialId

  if (mostrarCarga) {
    cargandoGrafico.value = true
  }

  try {
    const { data } = await api.get(`/meteorologia/historial/${zonaId}`, {
      params: { rango },
    })

    if (solicitudId !== solicitudHistorialId) {
      return
    }

    historialGrafico.value = data.ok ? (data.data ?? []) : []
  } catch (error) {
    if (solicitudId !== solicitudHistorialId) {
      return
    }

    console.error('Error cargando historial meteorológico:', error)

    historialGrafico.value = []
  } finally {
    if (solicitudId === solicitudHistorialId) {
      cargandoGrafico.value = false
    }
  }
}

const cargarHistorialReciente = async (zonaId: number) => {
  const mostrarLoading = historialReciente.value.length === 0

  if (mostrarLoading) {
    cargandoHistorialReciente.value = true
  }

  try {
    const { data } = await api.get(`/meteorologia/historial/${zonaId}`, {
      params: {
        limit: 20,
      },
    })

    historialReciente.value = data.ok ? (data.data ?? []) : []
  } catch (error) {
    console.error('Error cargando historial reciente:', error)

    historialReciente.value = []
  } finally {
    if (mostrarLoading) {
      cargandoHistorialReciente.value = false
    }
  }
}

const cargar = async () => {
  if (actualizando.value || !zonaSeleccionada.value) {
    return
  }

  actualizando.value = true

  const zonaId = Number(zonaSeleccionada.value)

  try {
    await Promise.all([
      store.cargarUltimoDato(zonaId),

      cargarHistorial(zonaId, rangoGrafico.value),

      cargarHistorialReciente(zonaId),
    ])

    progreso.value = 100
  } catch (error) {
    console.error('Error cargando meteorología:', error)
  } finally {
    actualizando.value = false
  }
}

// --- Configuración de lluvia ---
const lluviaConfig = reactive({
  umbral_raw: 3,
  confirmacion_min: 0.5, // 30s
  seco_min: 10, // 600s
})

const guardandoLluvia = ref(false)
const lluviaConfigEstado = reactive({ mensaje: '', color: 'success' })

const guardarConfigLluvia = async () => {
  const tiempo_confirmacion_s = Math.round(lluviaConfig.confirmacion_min * 60)
  const tiempo_seco_s = Math.round(lluviaConfig.seco_min * 60)

  if (lluviaConfig.umbral_raw < 1 || lluviaConfig.umbral_raw > 32766) {
    lluviaConfigEstado.mensaje = 'Umbral debe estar entre 1 y 32766 RAW'
    lluviaConfigEstado.color = 'error'
    return
  }
  if (tiempo_confirmacion_s < 1 || tiempo_confirmacion_s > 9999) {
    lluviaConfigEstado.mensaje = 'Confirmación debe estar entre 1 y 9999 segundos'
    lluviaConfigEstado.color = 'error'
    return
  }
  if (tiempo_seco_s < 1 || tiempo_seco_s > 9999) {
    lluviaConfigEstado.mensaje = 'Tiempo seco debe estar entre 1 y 9999 segundos'
    lluviaConfigEstado.color = 'error'
    return
  }

  guardandoLluvia.value = true
  lluviaConfigEstado.mensaje = ''
  try {
    const { data } = await api.post('/control/meteorologia', {
      lluvia_umbral_raw: lluviaConfig.umbral_raw,
      tiempo_confirmacion_lluvia_s: tiempo_confirmacion_s,
      tiempo_seco_reapertura_s: tiempo_seco_s,
    })
    if (data.ok) {
      lluviaConfigEstado.mensaje = `Configuración aplicada — CMD ${data.command_id}`
      lluviaConfigEstado.color = 'success'
    } else {
      lluviaConfigEstado.mensaje = data.mensaje ?? 'Error al guardar'
      lluviaConfigEstado.color = 'error'
    }
  } catch {
    lluviaConfigEstado.mensaje = 'Error de comunicación con el servidor'
    lluviaConfigEstado.color = 'error'
  } finally {
    guardandoLluvia.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando meteorología...')

  try {
    await invernaderosStore.cargarZonas()

    const primeraZona = zonaItems.value[0]

    if (primeraZona) {
      zonaSeleccionada.value = Number(primeraZona.id)

      await cargar()
    }

    intervalo = setInterval(() => {
      if (zonaSeleccionada.value) {
        cargar()
      }
    }, 30000)

    intervaloProg = setInterval(() => {
      progreso.value = Math.max(0, progreso.value - 100 / 30)
    }, 1000)
  } finally {
    loadingStore.ocultar()
  }
})

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo)
  }

  if (intervaloProg) {
    clearInterval(intervaloProg)
  }
})
</script>

<style scoped>
.meteorologia-page {
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

  font-size: 0.84rem;

  color: rgba(var(--v-theme-on-surface), 0.56);
}

.weather-status {
  font-weight: 600;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zone-selector {
  width: 210px;
}

.zone-selector :deep(.v-field__input) {
  font-size: 0.84rem;
}

.zone-selector :deep(.v-field-label) {
  font-size: 0.8rem;
}

.risk-alert {
  border: 1px solid rgba(var(--v-theme-warning), 0.18);
}

.risk-alert__icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: rgba(var(--v-theme-warning), 0.12);
}

.risk-alert__title {
  font-size: 0.9rem;
  font-weight: 700;
}

.risk-alert__content {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  font-size: 0.8rem;
  line-height: 1.5;
}

.weather-overview {
  display: flex;
  align-items: stretch;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  background: linear-gradient(
    120deg,
    rgba(var(--v-theme-primary), 0.05),
    rgb(var(--v-theme-surface)) 42%
  );
}

.weather-overview__main {
  flex: 1;

  display: flex;
  align-items: center;

  gap: 30px;

  padding: 20px 22px;
}

.current-weather {
  display: flex;
  align-items: center;

  gap: 14px;
}

.current-weather__icon {
  width: 66px;
  height: 66px;

  flex: 0 0 66px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 19px;
}

.current-weather__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);
}

.current-weather__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.1);
}

.current-weather__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.11);
}

.current-weather__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.1);
}

.current-weather__icon--info {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.1);
}

.current-weather__temperature > span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.current-weather__temperature > div {
  margin-top: 2px;

  font-size: 2.25rem;
  font-weight: 760;
  line-height: 1.1;

  letter-spacing: -0.04em;
}

.current-weather__temperature small {
  margin-left: 2px;

  font-size: 0.85rem;
  font-weight: 550;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.current-weather__info {
  flex: 1;

  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 14px;
}

.current-weather__info > div {
  min-width: 0;

  padding-left: 14px;

  border-left: 1px solid rgba(var(--v-border-color), 0.5);
}

.current-weather__info span {
  display: block;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.47);
}

.current-weather__info strong {
  display: block;

  margin-top: 4px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.8rem;
  font-weight: 650;
}

.weather-overview__status {
  width: 270px;
  flex: 0 0 270px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  gap: 14px;

  padding: 18px 20px;

  border-left: 1px solid rgba(var(--v-border-color), 0.5);

  background: rgba(var(--v-theme-on-surface), 0.018);
}

.sensor-status {
  display: flex;
  align-items: center;

  gap: 9px;
}

.sensor-dot {
  width: 9px;
  height: 9px;

  flex: 0 0 9px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));

  animation: sensorPulse 1.8s ease-in-out infinite;
}

.sensor-status div {
  display: flex;
  flex-direction: column;
}

.sensor-status strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.sensor-status span {
  margin-top: 2px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.46);
}

.refresh-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 6px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.47);
}

.refresh-progress__header strong {
  font-weight: 650;

  color: rgba(var(--v-theme-on-surface), 0.72);
}

.metrics-grid {
  display: grid;

  grid-template-columns: repeat(6, minmax(0, 1fr));

  gap: 12px;
}

.metric-card {
  position: relative;

  min-width: 0;
  min-height: 112px;

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

.metric-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 7px 24px rgba(0, 0, 0, 0.05) !important;
}

.metric-card__icon {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.metric-card__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.metric-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.metric-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.metric-card__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.metric-card__icon--info {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.metric-card__body {
  min-width: 0;
  flex: 1;
}

.metric-card__label {
  display: block;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.metric-card__value {
  margin-top: 3px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 1.18rem;
  font-weight: 730;
  line-height: 1.15;
}

.metric-card__value small {
  font-size: 0.68rem;
  font-weight: 500;

  color: rgba(var(--v-theme-on-surface), 0.47);
}

.metric-card__accent {
  position: absolute;

  right: 0;
  top: 25px;
  bottom: 25px;

  width: 3px;

  border-radius: 4px 0 0 4px;
}

.metric-card__accent--primary {
  background: rgb(var(--v-theme-primary));
}

.metric-card__accent--success {
  background: rgb(var(--v-theme-success));
}

.metric-card__accent--error {
  background: rgb(var(--v-theme-error));
}

.metric-card__accent--warning {
  background: rgb(var(--v-theme-warning));
}

.metric-card__accent--info {
  background: rgb(var(--v-theme-info));
}

.recommendation-card {
  min-height: 98px;

  display: flex;
  align-items: center;

  gap: 14px;

  padding: 17px 19px;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.recommendation-card--success {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-success), 0.055),
    rgb(var(--v-theme-surface)) 45%
  );
}

.recommendation-card--error {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-error), 0.055),
    rgb(var(--v-theme-surface)) 45%
  );
}

.recommendation-card--primary {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-primary), 0.055),
    rgb(var(--v-theme-surface)) 45%
  );
}

.recommendation-card__icon {
  width: 48px;
  height: 48px;

  flex: 0 0 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;
}

.recommendation-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.1);
}

.recommendation-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.1);
}

.recommendation-card__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.1);
}

.recommendation-card__content {
  min-width: 0;
  flex: 1;
}

.recommendation-label {
  display: block;

  margin-bottom: 3px;

  font-size: 0.7rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.05em;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.recommendation-card h3 {
  margin: 0;

  font-size: 0.9rem;
  font-weight: 700;
}

.recommendation-card p {
  max-width: 760px;

  margin: 4px 0 0;

  font-size: 0.76rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.54);
}

.recommendation-card__status {
  flex-shrink: 0;
}

.chart-wrapper {
  overflow: hidden;

  border-radius: 16px;
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

  gap: 10px;
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

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.49);
}

.history-actions {
  display: flex;
  align-items: center;

  gap: 7px;
}

.history-table-wrapper {
  overflow-x: auto;
}

.history-table {
  min-width: 650px;
}

.history-table :deep(th) {
  font-size: 0.72rem !important;
  font-weight: 650 !important;
}

.history-table :deep(td) {
  font-size: 0.76rem !important;
}

.date-cell,
.table-value {
  display: flex;
  align-items: center;

  gap: 5px;

  font-size: 0.76rem;
}

.date-cell {
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.conditions-list {
  padding: 8px 13px;
}

.condition-item {
  min-height: 64px;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 9px 3px;

  border-bottom: 1px solid rgba(var(--v-border-color), 0.4);
}

.condition-item:last-child {
  border-bottom: 0;
}

.condition-item__icon {
  width: 34px;
  height: 34px;

  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.condition-item__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.condition-item__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.condition-item__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.condition-item__content {
  min-width: 0;
  flex: 1;
}

.condition-item__title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;
}

.condition-item__title strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.condition-item__title span {
  flex-shrink: 0;

  font-size: 0.7rem;
  font-weight: 650;
}

.condition-status--success {
  color: rgb(var(--v-theme-success));
}

.condition-status--warning {
  color: rgb(var(--v-theme-warning));
}

.condition-status--error {
  color: rgb(var(--v-theme-error));
}

.condition-item p {
  margin: 3px 0 0;

  font-size: 0.7rem;
  line-height: 1.4;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.reading-card {
  padding: 14px 16px;
}

.reading-card__content {
  display: flex;
  align-items: center;

  gap: 11px;
}

.reading-card__icon {
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

.reading-card__content > div:last-child {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.reading-card span {
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.49);
}

.reading-card strong {
  margin-top: 2px;

  font-size: 0.76rem;
  font-weight: 650;
}

.empty-state {
  min-height: 390px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 40px 20px;

  text-align: center;
}

.empty-state__icon {
  width: 82px;
  height: 82px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 14px;

  border-radius: 50%;

  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 420px;

  margin: 6px 0 18px;

  font-size: 0.78rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

@keyframes sensorPulse {
  0%,
  100% {
    opacity: 1;

    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.3);
  }

  50% {
    opacity: 0.6;

    box-shadow: 0 0 0 5px rgba(var(--v-theme-success), 0);
  }
}

@media (max-width: 1263px) {
  .metrics-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .weather-overview__main {
    gap: 18px;
  }

  .weather-overview__status {
    width: 230px;
    flex-basis: 230px;
  }
}

@media (max-width: 959px) {
  .page-header {
    align-items: flex-start;
  }

  .weather-overview {
    flex-direction: column;
  }

  .weather-overview__status {
    width: 100%;
    flex-basis: auto;

    flex-direction: row;
    align-items: center;

    border-left: 0;

    border-top: 1px solid rgba(var(--v-border-color), 0.5);
  }

  .sensor-status,
  .refresh-progress {
    flex: 1;
  }
}

@media (max-width: 700px) {
  .meteorologia-page {
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
    font-size: 0.78rem;
  }

  .page-header__actions {
    width: 100%;
  }

  .zone-selector {
    flex: 1;
    width: auto;
  }

  .risk-alert__content {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-overview__main {
    flex-direction: column;
    align-items: stretch;

    padding: 16px;
  }

  .current-weather__info {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .current-weather__info > div:first-child {
    padding-left: 0;
    border-left: 0;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 8px;
  }

  .metric-card {
    min-height: 94px;

    padding: 12px;

    gap: 8px;
  }

  .metric-card__icon {
    width: 35px;
    height: 35px;

    flex-basis: 35px;
  }

  .metric-card__value {
    font-size: 1rem;
  }

  .recommendation-card {
    align-items: flex-start;
  }

  .recommendation-card__status {
    display: none;
  }

  .history-actions > .v-chip {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-header__actions {
    flex-direction: column;
  }

  .zone-selector,
  .page-header__actions .v-btn {
    width: 100%;
  }

  .current-weather__info {
    grid-template-columns: 1fr;

    gap: 8px;
  }

  .current-weather__info > div {
    padding: 7px 0 0;

    border-left: 0;

    border-top: 1px solid rgba(var(--v-border-color), 0.4);
  }

  .current-weather__info > div:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .weather-overview__status {
    flex-direction: column;
    align-items: stretch;
  }

  .metrics-grid {
    grid-template-columns:
      1fr
      1fr;
  }

  .metric-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .recommendation-card {
    padding: 14px;
  }

  .recommendation-card__icon {
    width: 42px;
    height: 42px;

    flex-basis: 42px;
  }

  .card-header {
    align-items: flex-start;
  }
}

.semaforo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 7px;
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.semaforo__luz {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  opacity: 0.12;
  transition:
    opacity 0.8s ease,
    box-shadow 0.8s ease;
}

.semaforo__luz--activa {
  opacity: 1;
}

.rain-config-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.rain-config-card__header {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
}

.rain-config-card__title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.rain-config-card__title h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.rain-config-card__title p {
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.section-icon--info {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.rain-config-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 16px 16px 0;
  padding: 11px 13px;
  border-radius: 12px;
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.065);
}

.rain-config-notice__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba(var(--v-theme-info), 0.1);
}

.rain-config-notice > div:last-child {
  display: flex;
  flex-direction: column;
}

.rain-config-notice strong {
  font-size: 0.78rem;
  font-weight: 650;
}

.rain-config-notice span {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.rain-config-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
}

.rain-config-item {
  padding: 15px;
  border: 1px solid rgba(var(--v-border-color), 0.6);
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.018);
}

.rain-config-item__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}

.rain-config-item__icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.rain-config-item__icon--primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.rain-config-item__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.rain-config-item__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.rain-config-item__header > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.rain-config-item__header strong {
  font-size: 0.82rem;
  font-weight: 650;
}

.rain-config-item__header span {
  margin-top: 3px;
  font-family: monospace;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.rain-config-input {
  width: 100%;
}

.rain-config-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.46);
}

.rain-config-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 16px;
  border-top: 1px solid rgba(var(--v-border-color), 0.5);
}

.rain-config-feedback {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 550;
}

.rain-config-feedback--success {
  color: rgb(var(--v-theme-success));
}
.rain-config-feedback--error {
  color: rgb(var(--v-theme-error));
}

@media (max-width: 959px) {
  .rain-config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
