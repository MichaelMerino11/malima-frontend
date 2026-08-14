<template>
  <v-card rounded="lg" elevation="2">
    <v-card-title class="d-flex align-center justify-space-between pa-4 flex-wrap gap-2">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary">mdi-chart-line</v-icon>
        <span class="text-body-1 font-weight-bold">Tendencia climática</span>
      </div>
      <v-btn-toggle
        v-model="metricaActiva"
        mandatory
        density="compact"
        variant="outlined"
        color="primary"
      >
        <v-btn value="temperatura" size="small">Temp.</v-btn>
        <v-btn value="humedad" size="small">Humedad</v-btn>
        <v-btn value="velocidad_viento" size="small">Viento</v-btn>
        <v-btn value="radiacion_solar" size="small">Radiación</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <div v-if="datos.length === 0" class="text-center py-8">
        <v-icon size="48" color="grey-lighten-2">mdi-chart-line-variant</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-2">
          Sin datos suficientes para mostrar gráfico
        </p>
      </div>
      <div v-else ref="contenedorRef" style="width: 100%; height: 280px" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'

interface DatoMeteo {
  registrado_at: string
  temperatura: number
  humedad: number
  velocidad_viento: number
  radiacion_solar: number
  probabilidad_lluvia: number
}

interface MetricaConfig {
  label: string
  color: string
  unidad: string
}

const props = defineProps<{ datos: DatoMeteo[] }>()
const contenedorRef = ref<HTMLDivElement | null>(null)
const metricaActiva = ref<string>('temperatura')
let svgEl: SVGSVGElement | null = null

const config: Record<string, MetricaConfig> = {
  temperatura: { label: 'Temperatura', color: '#D32F2F', unidad: '°C' },
  humedad: { label: 'Humedad', color: '#0288D1', unidad: '%' },
  velocidad_viento: { label: 'Viento', color: '#F57C00', unidad: ' km/h' },
  radiacion_solar: { label: 'Radiación solar', color: '#F9A825', unidad: ' W/m²' },
}

const formatHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const renderSVG = async () => {
  await nextTick()
  if (!contenedorRef.value || props.datos.length === 0) return

  const contenedor = contenedorRef.value
  if (svgEl) contenedor.removeChild(svgEl)

  const W = contenedor.clientWidth || 800
  const H = 280
  const pad = { top: 20, right: 20, bottom: 40, left: 55 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const datosOrdenados = [...props.datos].reverse()
  const cfg = config[metricaActiva.value] as MetricaConfig
  const valores = datosOrdenados.map((d) => Number(d[metricaActiva.value as keyof DatoMeteo]))
  const labels = datosOrdenados.map((d) => formatHora(d.registrado_at))

  const minV = Math.min(...valores) * 0.95
  const maxV = Math.max(...valores) * 1.05
  const rangoV = maxV - minV || 1

  const xPos = (i: number) => pad.left + (i / (valores.length - 1)) * innerW
  const yPos = (v: number) => pad.top + innerH - ((v - minV) / rangoV) * innerH

  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', String(H))
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

  // Área rellena
  const areaPoints = [
    `${xPos(0)},${pad.top + innerH}`,
    ...valores.map((v, i) => `${xPos(i)},${yPos(v)}`),
    `${xPos(valores.length - 1)},${pad.top + innerH}`,
  ].join(' ')

  const area = document.createElementNS(ns, 'polygon')
  area.setAttribute('points', areaPoints)
  area.setAttribute('fill', cfg.color + '22')
  svg.appendChild(area)

  // Línea
  const linePoints = valores.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ')
  const line = document.createElementNS(ns, 'polyline')
  line.setAttribute('points', linePoints)
  line.setAttribute('fill', 'none')
  line.setAttribute('stroke', cfg.color)
  line.setAttribute('stroke-width', '2')
  line.setAttribute('stroke-linejoin', 'round')
  svg.appendChild(line)

  // Puntos
  valores.forEach((v, i) => {
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', String(xPos(i)))
    circle.setAttribute('cy', String(yPos(v)))
    circle.setAttribute('r', '3')
    circle.setAttribute('fill', cfg.color)
    svg.appendChild(circle)
  })

  // Eje Y — 5 líneas
  for (let t = 0; t <= 4; t++) {
    const v = minV + (rangoV * t) / 4
    const y = yPos(v)

    const gridLine = document.createElementNS(ns, 'line')
    gridLine.setAttribute('x1', String(pad.left))
    gridLine.setAttribute('x2', String(pad.left + innerW))
    gridLine.setAttribute('y1', String(y))
    gridLine.setAttribute('y2', String(y))
    gridLine.setAttribute('stroke', '#e0e0e0')
    gridLine.setAttribute('stroke-width', '1')
    svg.appendChild(gridLine)

    const text = document.createElementNS(ns, 'text')
    text.setAttribute('x', String(pad.left - 6))
    text.setAttribute('y', String(y + 4))
    text.setAttribute('text-anchor', 'end')
    text.setAttribute('font-size', '10')
    text.setAttribute('fill', '#888')
    text.textContent = `${v.toFixed(1)}${cfg.unidad}`
    svg.appendChild(text)
  }

  // Eje X — máximo 8 etiquetas
  const paso = Math.max(1, Math.floor(labels.length / 8))
  labels.forEach((label, i) => {
    if (i % paso !== 0 && i !== labels.length - 1) return
    const text = document.createElementNS(ns, 'text')
    text.setAttribute('x', String(xPos(i)))
    text.setAttribute('y', String(H - 8))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('font-size', '10')
    text.setAttribute('fill', '#888')
    text.textContent = label
    svg.appendChild(text)
  })

  svgEl = svg
  contenedor.appendChild(svg)
}

watch(
  () => props.datos,
  async (newDatos) => {
    if (newDatos.length > 0) {
      await nextTick()
      setTimeout(renderSVG, 150)
    }
  },
  { deep: true, immediate: true },
)

watch(metricaActiva, renderSVG)

onMounted(async () => {
  await nextTick()
  setTimeout(renderSVG, 300)
})

onUnmounted(() => {
  if (svgEl && contenedorRef.value) {
    contenedorRef.value.removeChild(svgEl)
  }
})
</script>

<script lang="ts">
export default { name: 'GraficoMeteo' }
</script>