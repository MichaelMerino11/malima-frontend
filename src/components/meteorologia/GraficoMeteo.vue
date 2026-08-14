<template>
  <v-card rounded="lg" elevation="2">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center justify-space-between pa-4 flex-wrap gap-2">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary"> mdi-chart-line </v-icon>

        <span class="text-body-1 font-weight-bold"> Tendencia climática </span>
      </div>

      <v-btn-toggle
        v-model="metricaActiva"
        mandatory
        density="compact"
        variant="outlined"
        color="primary"
      >
        <v-btn value="temperatura" size="small"> Temp. </v-btn>

        <v-btn value="humedad" size="small"> Humedad </v-btn>

        <v-btn value="velocidad_viento" size="small"> Viento </v-btn>

        <v-btn value="radiacion_solar" size="small"> Radiación </v-btn>
      </v-btn-toggle>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4">
      <!-- SIN DATOS -->
      <div v-if="datosOrdenados.length === 0" class="text-center py-8">
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

interface DatoMeteo {
  registrado_at: string
  temperatura: number
  humedad: number
  velocidad_viento: number
  radiacion_solar: number
  probabilidad_lluvia: number
}

type MetricaKey = 'temperatura' | 'humedad' | 'velocidad_viento' | 'radiacion_solar'

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
}

/* =========================================================
 * HELPERS
 * ======================================================= */

const formatHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
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

  const labels = registros.map((dato) => formatHora(dato.registrado_at))

  const valores = registros.map((dato) => {
    const valor = Number(dato[metrica])

    return Number.isFinite(valor) ? valor : 0
  })

  /*
   * Calculamos un rango Y dinámico.
   *
   * Esto evita que una temperatura de 20.0 - 20.5 °C
   * se vea aplastada contra el gráfico.
   */
  const minValor = valores.length > 0 ? Math.min(...valores) : 0

  const maxValor = valores.length > 0 ? Math.max(...valores) : 1

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
</style>
