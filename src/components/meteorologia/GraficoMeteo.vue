<template>
  <v-card rounded="lg" elevation="2">
    <!-- HEADER -->
    <v-card-title
      class="chart-header d-flex align-center justify-space-between pa-4 flex-wrap gap-2"
    >
      <div class="d-flex align-center gap-2">
        <v-icon color="primary"> mdi-chart-line </v-icon>
        <span class="text-body-1 font-weight-bold"> Tendencia climática </span>
      </div>

      <div class="chart-controls">
        <!-- RANGO DE TIEMPO -->
        <div class="chart-control-group">
          <div class="chart-control-label">
            <v-icon size="15"> mdi-clock-outline </v-icon>

            <span>Rango</span>
          </div>

          <v-btn-toggle
            v-model="rangoActivo"
            mandatory
            density="compact"
            variant="outlined"
            color="primary"
            class="chart-toggle"
          >
            <v-btn value="1h" size="small">1h</v-btn>
            <v-btn value="6h" size="small">6h</v-btn>
            <v-btn value="24h" size="small">24h</v-btn>
            <v-btn value="7d" size="small">7d</v-btn>
            <v-btn value="30d" size="small">30d</v-btn>
          </v-btn-toggle>
        </div>

        <!-- SEPARADOR -->
        <div class="chart-control-divider"></div>

        <!-- VARIABLE -->
        <div class="chart-control-group">
          <div class="chart-control-label">
            <v-icon size="15"> mdi-chart-line </v-icon>

            <span>Variable</span>
          </div>

          <v-btn-toggle
            v-model="metricaActiva"
            mandatory
            density="compact"
            variant="outlined"
            color="primary"
            class="chart-toggle"
          >
            <v-btn value="temperatura" size="small"> Temp. </v-btn>

            <v-btn value="presion_atmosferica" size="small"> Presión </v-btn>

            <v-btn value="humedad" size="small"> Humedad </v-btn>

            <v-btn value="velocidad_viento" size="small"> Viento </v-btn>

            <v-btn value="radiacion_solar" size="small"> Radiación </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4 position-relative">
      <!-- OVERLAY DE CARGA -->
      <v-overlay :model-value="cargando" contained persistent class="align-center justify-center">
        <div class="text-center">
          <v-progress-circular indeterminate color="primary" size="32" width="3" />

          <div class="text-caption mt-2">Cargando período...</div>
        </div>
      </v-overlay>

      <!-- SIN DATOS -->
      <div v-if="datosOrdenados.length === 0 && !cargando" class="text-center py-8">
        <v-icon size="48" color="grey-lighten-2"> mdi-chart-line-variant </v-icon>

        <p class="text-body-2 text-medium-emphasis mt-2">
          Sin datos suficientes para mostrar gráfico
        </p>
      </div>

      <!-- GRÁFICO -->
      <VChart v-else class="grafico-meteo" :option="chartOption" autoresize />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import VChart from 'vue-echarts'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'

import { GridComponent, TooltipComponent } from 'echarts/components'

import type { EChartsOption } from 'echarts'

/* =========================================================
 * ECHARTS
 * ======================================================= */

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

/* =========================================================
 * TIPOS
 * ======================================================= */

type ValorMeteo = number | string | null

interface DatoMeteo {
  registrado_at: string
  temperatura: ValorMeteo
  humedad: ValorMeteo
  velocidad_viento: ValorMeteo
  radiacion_solar: ValorMeteo
  probabilidad_lluvia: ValorMeteo
  presion_atmosferica: ValorMeteo
}

type MetricaKey =
  | 'temperatura'
  | 'humedad'
  | 'velocidad_viento'
  | 'radiacion_solar'
  | 'presion_atmosferica'

interface MetricaConfig {
  label: string
  color: string
  unidad: string
  decimales: number
}

/* =========================================================
 * PROPS
 * ======================================================= */

const props = defineProps<{
  datos: DatoMeteo[]
  rango: string
  cargando?: boolean
}>()

/* =========================================================
 * ESTADO
 * ======================================================= */

const metricaActiva = ref<MetricaKey>('temperatura')

/* =========================================================
 * CONFIGURACIÓN DE MÉTRICAS
 * ======================================================= */

const config: Record<MetricaKey, MetricaConfig> = {
  temperatura: {
    label: 'Temperatura',
    color: '#D32F2F',
    unidad: '°C',
    decimales: 1,
  },

  humedad: {
    label: 'Humedad',
    color: '#0288D1',
    unidad: '%',
    decimales: 1,
  },

  velocidad_viento: {
    label: 'Viento',
    color: '#F57C00',
    unidad: 'km/h',
    decimales: 1,
  },

  radiacion_solar: {
    label: 'Radiación solar',
    color: '#F9A825',
    unidad: 'W/m²',
    decimales: 0,
  },

  presion_atmosferica: {
    label: 'Presión',
    color: '#7B1FA2',
    unidad: 'hPa',
    decimales: 1,
  },
}

const emit = defineEmits<{
  (e: 'cambiarRango', rango: string): void
}>()

const rangoActivo = computed({
  get: () => props.rango,

  set: (value: string) => {
    emit('cambiarRango', value)
  },
})

/* =========================================================
 * HELPERS
 * ======================================================= */

const formatHora = (fecha: string, rango: string) => {
  const date = new Date(fecha)

  switch (rango) {
    case '1h':
    case '6h':
      return date.toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

    case '24h':
      return date.toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

    case '7d':
    case '30d':
      return (
        date.toLocaleDateString('es-EC', {
          day: '2-digit',
          month: '2-digit',
        }) +
        ' ' +
        date.toLocaleTimeString('es-EC', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )

    default:
      return ''
  }
}

const formatValor = (valor: number, cfg: MetricaConfig) => {
  const numero = Number(valor).toFixed(cfg.decimales)

  if (cfg.unidad === '°C' || cfg.unidad === '%') {
    return `${numero}${cfg.unidad}`
  }

  return `${numero} ${cfg.unidad}`
}

/* =========================================================
 * DATOS ORDENADOS
 * ======================================================= */

/*
 * No dependemos de que el backend devuelva ASC o DESC.
 * Siempre ordenamos cronológicamente.
 */
const datosOrdenados = computed(() => {
  return [...props.datos]
    .filter((dato) => dato?.registrado_at)
    .sort((a, b) => new Date(a.registrado_at).getTime() - new Date(b.registrado_at).getTime())
})

/* =========================================================
 * OPCIONES DEL GRÁFICO
 * ======================================================= */

const chartOption = computed<EChartsOption>(() => {
  const metrica = metricaActiva.value
  const cfg = config[metrica]

  const registros = datosOrdenados.value

  const labels = registros.map((dato) => formatHora(dato.registrado_at, rangoActivo.value))

  const valores = registros.map((dato) => {
    const raw = dato[metrica]

    if (raw === null || raw === undefined || raw === '') {
      return null
    }

    const valor = Number(raw)

    return Number.isFinite(valor) ? valor : null
  })

  const valoresNumericos = valores.filter((valor): valor is number => typeof valor === 'number')

  const minValor = valoresNumericos.length > 0 ? Math.min(...valoresNumericos) : 0

  const maxValor = valoresNumericos.length > 0 ? Math.max(...valoresNumericos) : 1

  /*
   * Calculamos un rango Y dinámico.
   *
   * Esto evita que una temperatura de 20.0 - 20.5 °C
   * se vea aplastada contra el gráfico.
   */

  const rango = maxValor - minValor

  const margen = rango > 0 ? rango * 0.15 : Math.max(Math.abs(maxValor) * 0.05, 1)

  const minimoEje = minValor - margen
  const maximoEje = maxValor + margen

  return {
    animation: true,

    animationDuration: 450,

    animationDurationUpdate: 450,

    animationEasing: 'cubicOut',

    animationEasingUpdate: 'cubicOut',

    grid: {
      top: 20,
      right: 20,
      bottom: 45,
      left: 70,
    },

    /* =====================================================
     * TOOLTIP
     * =================================================== */

    tooltip: {
      trigger: 'axis',

      backgroundColor: 'rgba(255, 255, 255, 0.97)',

      borderColor: '#E0E0E0',

      borderWidth: 1,

      padding: [8, 12],

      textStyle: {
        color: '#424242',
        fontSize: 12,
      },

      axisPointer: {
        type: 'line',

        lineStyle: {
          color: cfg.color,
          width: 1,
          opacity: 0.35,
        },
      },

      valueFormatter: (value) => {
        return formatValor(Number(value), cfg)
      },
    },

    /* =====================================================
     * EJE X
     * =================================================== */

    xAxis: {
      type: 'category',

      boundaryGap: false,

      data: labels,

      axisTick: {
        show: false,
      },

      axisLine: {
        lineStyle: {
          color: '#E0E0E0',
        },
      },

      axisLabel: {
        color: '#757575',
        fontSize: 10,

        hideOverlap: true,

        margin: 12,
      },
    },

    /* =====================================================
     * EJE Y
     * =================================================== */

    yAxis: {
      type: 'value',

      min: minimoEje,

      max: maximoEje,

      splitNumber: 4,

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: '#757575',

        fontSize: 10,

        formatter: (value: number) => {
          return formatValor(value, cfg)
        },
      },

      splitLine: {
        lineStyle: {
          color: '#EEEEEE',
          width: 1,
        },
      },
    },

    /* =====================================================
     * SERIE
     * =================================================== */

    series: [
      {
        name: cfg.label,

        type: 'line',

        data: valores,

        smooth: 0.25,

        symbol: 'circle',

        symbolSize: 6,

        showSymbol: valores.length <= 40,

        itemStyle: {
          color: cfg.color,
        },

        lineStyle: {
          color: cfg.color,
          width: 2.5,
        },

        areaStyle: {
          color: cfg.color,
          opacity: 0.1,
        },

        emphasis: {
          focus: 'series',

          itemStyle: {
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },

          lineStyle: {
            width: 3,
          },
        },
      },
    ],
  }
})
</script>

<script lang="ts">
export default {
  name: 'GraficoMeteo',
}
</script>

<style scoped>
.grafico-meteo {
  width: 100%;
  height: 280px;
}

.chart-controls {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;

  gap: 14px;

  flex-wrap: wrap;
}

.chart-control-group {
  display: flex;
  flex-direction: column;

  gap: 5px;
}

.chart-control-label {
  display: flex;
  align-items: center;

  gap: 5px;

  padding-left: 2px;

  font-size: 0.68rem;
  line-height: 1;

  font-weight: 650;

  color: rgba(var(--v-theme-on-surface), 0.52);
}

.chart-control-label .v-icon {
  color: rgb(var(--v-theme-primary));
}

.chart-control-divider {
  width: 1px;
  height: 36px;

  align-self: flex-end;

  margin-bottom: 1px;

  background: rgba(var(--v-border-color), 0.7);
}

.chart-toggle {
  border-radius: 7px;
}

.chart-header {
  white-space: normal;
  overflow: visible;
}

@media (max-width: 900px) {
  .chart-controls {
    width: 100%;

    justify-content: flex-start;

    gap: 10px;
  }

  .chart-control-divider {
    display: none;
  }
}

@media (max-width: 600px) {
  .chart-control-group {
    width: 100%;
  }

  .chart-toggle {
    width: 100%;

    overflow-x: auto;
  }
}
</style>
