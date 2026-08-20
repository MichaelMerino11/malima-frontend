<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-2" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Meteorología</h1>
        <p class="text-body-2 text-medium-emphasis">Monitoreo climático en tiempo real</p>
      </v-col>
      <v-col cols="auto" class="d-flex align-center gap-3">
        <v-chip
          v-if="datos"
          class="text-h6 font-weight-bold mr-4"
          :color="estadoClima.color"
          variant="tonal"
          :prepend-icon="estadoClima.icono"
          size="large"
        >
          {{ estadoClima.texto }}
        </v-chip>

        <v-select
          v-model="zonaSeleccionada"
          :items="zonaItems"
          item-title="nombre"
          item-value="id"
          label="Zona"
          density="compact"
          variant="outlined"
          hide-details
          style="min-width: 140px"
          @update:model-value="cargar"
        />
      </v-col>
    </v-row>

    <!-- Alerta lluvia -->
    <v-row v-if="datos?.probabilidad_lluvia && datos.probabilidad_lluvia > 60" class="mb-2">
      <v-col>
        <v-alert
          type="warning"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-weather-rainy"
          title="⚠️ Alerta de lluvia"
          :text="`Probabilidad de lluvia: ${datos.probabilidad_lluvia}%. Se recomienda cerrar los invernaderos inmediatamente.`"
        />
      </v-col>
    </v-row>

    <!-- Sin datos -->
    <v-row v-if="!datos && !store.cargando">
      <v-col>
        <v-alert
          type="info"
          variant="tonal"
          rounded="lg"
          text="No hay datos meteorológicos disponibles para esta zona. El sensor enviará datos automáticamente."
        />
      </v-col>
    </v-row>

    <template v-if="datos">
      <!-- Tarjetas métricas principales -->
      <v-row class="mb-2">
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="2" class="pa-3 text-center h-100">
            <v-icon size="32" color="error">mdi-thermometer</v-icon>
            <p class="text-h5 font-weight-bold mt-1">{{ datos.temperatura }}°C</p>
            <p class="text-caption text-medium-emphasis">Temperatura</p>
            <v-progress-linear
              :model-value="(datos.temperatura / 50) * 100"
              color="error"
              rounded
              height="4"
              class="mt-2"
            />
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="2" class="pa-3 text-center h-100">
            <v-icon size="32" color="info">mdi-water-percent</v-icon>
            <p class="text-h5 font-weight-bold mt-1">{{ datos.humedad }}%</p>
            <p class="text-caption text-medium-emphasis">Humedad</p>
            <v-progress-linear
              :model-value="datos.humedad"
              color="info"
              rounded
              height="4"
              class="mt-2"
            />
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="2" class="pa-3 text-center h-100">
            <v-icon size="32" color="warning">mdi-weather-windy</v-icon>
            <p class="text-h5 font-weight-bold mt-1">
              {{ datos.velocidad_viento }} <span class="text-caption">km/h</span>
            </p>
            <p class="text-caption text-medium-emphasis">Viento</p>
            <v-progress-linear
              :model-value="(datos.velocidad_viento / 100) * 100"
              color="warning"
              rounded
              height="4"
              class="mt-2"
            />
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="2" class="pa-3 text-center h-100">
            <v-icon size="32" color="amber">mdi-weather-sunny</v-icon>
            <p class="text-h5 font-weight-bold mt-1">
              {{ datos.radiacion_solar }} <span class="text-caption">W/m²</span>
            </p>
            <p class="text-caption text-medium-emphasis">Radiación solar</p>
            <v-progress-linear
              :model-value="(datos.radiacion_solar / 1000) * 100"
              color="amber"
              rounded
              height="4"
              class="mt-2"
            />
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="2" class="pa-3 text-center h-100">
            <v-icon size="32" color="blue">mdi-weather-rainy</v-icon>
            <p class="text-h5 font-weight-bold mt-1">{{ datos.probabilidad_lluvia ?? 0 }}%</p>
            <p class="text-caption text-medium-emphasis">Probabilidad de lluvia</p>
            <v-progress-linear
              :model-value="datos.probabilidad_lluvia ?? 0"
              :color="(datos.probabilidad_lluvia ?? 0) > 60 ? 'error' : 'blue'"
              rounded
              height="4"
              class="mt-2"
            />
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="2" class="pa-3 text-center h-100">
            <v-icon size="32" color="purple">mdi-gauge</v-icon>
            <p class="font-weight-bold mt-1" :class="mobile ? 'text-h6' : 'text-h5'">
              {{ datos?.presion_atmosferica ?? '--' }} <span class="text-body-2">hPa</span>
            </p>
            <p class="text-body-2 text-medium-emphasis">Presión atmosférica</p>
            <v-progress-linear
              :model-value="((datos?.presion_atmosferica ?? 1013) / 1100) * 100"
              color="purple"
              rounded
              height="4"
              class="mt-2"
            />
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card
            rounded="lg"
            elevation="2"
            class="pa-3 text-center h-100"
            :color="recomendacion.color"
            variant="tonal"
          >
            <v-icon size="32" :color="recomendacion.iconoColor">{{ recomendacion.icono }}</v-icon>
            <p class="text-body-2 font-weight-bold mt-1">{{ recomendacion.titulo }}</p>
            <p class="text-caption text-medium-emphasis">{{ recomendacion.texto }}</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráfico -->
      <v-row class="mb-2">
        <v-col cols="12">
          <GraficoMeteo :datos="historial" />
        </v-col>
      </v-row>

      <!-- Historial y detalles -->
      <v-row>
        <!-- Historial -->
        <v-col cols="12" md="8">
          <v-card rounded="lg" elevation="2">
            <v-card-title class="d-flex align-center gap-2 pa-4">
              <v-icon color="primary">mdi-history</v-icon>
              <span class="text-body-1 font-weight-bold">Historial reciente</span>
              <v-spacer />
              <v-chip size="small" variant="tonal" color="primary">
                Últimos {{ historial.length }} registros
              </v-chip>
            </v-card-title>
            <v-divider />
            <v-data-table
              :headers="headersHistorial"
              :items="historial"
              :loading="cargandoHistorial"
              density="compact"
              no-data-text="Sin registros disponibles"
              hide-default-footer
              :items-per-page="8"
            >
              <template #item.registrado_at="{ item }">
                <span class="text-caption">{{ formatFecha(item.registrado_at) }}</span>
              </template>
              <template #item.temperatura="{ item }">
                <v-chip size="x-small" color="error" variant="tonal"
                  >{{ item.temperatura }}°C</v-chip
                >
              </template>
              <template #item.humedad="{ item }">
                <v-chip size="x-small" color="info" variant="tonal">{{ item.humedad }}%</v-chip>
              </template>
              <template #item.velocidad_viento="{ item }">
                <span class="text-caption">{{ item.velocidad_viento }} km/h</span>
              </template>
              <template #item.probabilidad_lluvia="{ item }">
                <v-chip
                  size="x-small"
                  :color="item.probabilidad_lluvia > 60 ? 'error' : 'success'"
                  variant="tonal"
                >
                  {{ item.probabilidad_lluvia ?? 0 }}%
                </v-chip>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- Panel lateral -->
        <v-col cols="12" md="4">
          <!-- Última actualización -->
          <v-card rounded="lg" elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center gap-2 pa-4">
              <v-icon color="primary">mdi-clock-outline</v-icon>
              <span class="text-body-1 font-weight-bold">Última lectura</span>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <p class="text-h6 font-weight-bold text-primary">
                {{ formatFecha(datos.registrado_at) }}
              </p>
              <p class="text-caption text-medium-emphasis mt-1">
                Actualización automática cada 30 segundos
              </p>
              <v-progress-linear
                v-model="progreso"
                color="primary"
                rounded
                height="4"
                class="mt-3"
              />
            </v-card-text>
          </v-card>

          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-export"
            block
            @click="modalExportar = true"
          >
            Exportar
          </v-btn>

          <!-- Resumen de condiciones -->
          <v-card rounded="lg" elevation="2">
            <v-card-title class="d-flex align-center gap-2 pa-4">
              <v-icon color="primary">mdi-clipboard-check</v-icon>
              <span class="text-body-1 font-weight-bold">Condiciones</span>
            </v-card-title>
            <v-divider />
            <v-list density="compact" class="pa-2">
              <v-list-item>
                <template #prepend>
                  <v-icon :color="datos.temperatura > 35 ? 'error' : 'success'" size="20">
                    {{ datos.temperatura > 35 ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">Temperatura</v-list-item-title>
                <v-list-item-subtitle>
                  {{ datos.temperatura > 35 ? 'Alta — riesgo para cultivos' : 'Normal' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <template #prepend>
                  <v-icon :color="datos.humedad > 85 ? 'warning' : 'success'" size="20">
                    {{ datos.humedad > 85 ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">Humedad</v-list-item-title>
                <v-list-item-subtitle>
                  {{ datos.humedad > 85 ? 'Alta — posible hongos' : 'Normal' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <template #prepend>
                  <v-icon :color="datos.velocidad_viento > 40 ? 'error' : 'success'" size="20">
                    {{ datos.velocidad_viento > 40 ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">Viento</v-list-item-title>
                <v-list-item-subtitle>
                  {{ datos.velocidad_viento > 40 ? 'Fuerte — cerrar invernaderos' : 'Normal' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <template #prepend>
                  <v-icon
                    :color="(datos.probabilidad_lluvia ?? 0) > 60 ? 'error' : 'success'"
                    size="20"
                  >
                    {{
                      (datos.probabilidad_lluvia ?? 0) > 60
                        ? 'mdi-alert-circle'
                        : 'mdi-check-circle'
                    }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">Lluvia</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    (datos.probabilidad_lluvia ?? 0) > 60
                      ? 'Inminente — cerrar invernaderos'
                      : 'Sin riesgo'
                  }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <template #prepend>
                  <v-icon
                    :color="(datos?.presion_atmosferica ?? 1013) < 1000 ? 'warning' : 'success'"
                    size="20"
                  >
                    {{
                      (datos?.presion_atmosferica ?? 1013) < 1000
                        ? 'mdi-alert-circle'
                        : 'mdi-check-circle'
                    }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">Presión atmosférica</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    (datos?.presion_atmosferica ?? 1013) < 1000
                      ? 'Baja — posible tormenta'
                      : 'Normal'
                  }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <ModalExportar v-model="modalExportar" tipo="meteorologia" :datos="historial" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useMeteorologiaStore } from '../stores/meteorologia'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'
import GraficoMeteo from '../components/meteorologia/GraficoMeteo.vue'
import api from '../api/axios'
import { useExportar } from '../composables/useExportar'
import ModalExportar from '../components/meteorologia/../shared/ModalExportar.vue'
import { useLoadingStore } from '../stores/loading'

const loadingStore = useLoadingStore()
const modalExportar = ref(false)
const { exportarExcel, exportarPDF } = useExportar()

const store = useMeteorologiaStore()
const invernaderosStore = useInvernaderosStore()
const { datos } = storeToRefs(store)
const { zonas } = storeToRefs(invernaderosStore)
const { mobile } = useDisplay()

const zonaSeleccionada = ref(1)
const zonaItems = computed(() => zonas.value)
const historial = ref<any[]>([])
const cargandoHistorial = ref(false)
const progreso = ref(100)

let intervalo: ReturnType<typeof setInterval>
let intervaloProg: ReturnType<typeof setInterval>

const headersHistorial = [
  { title: 'Fecha', key: 'registrado_at' },
  { title: 'Temp.', key: 'temperatura' },
  { title: 'Humedad', key: 'humedad' },
  { title: 'Viento', key: 'velocidad_viento' },
  { title: 'Lluvia', key: 'probabilidad_lluvia' },
]

const estadoClima = computed(() => {
  if (!datos.value) return { texto: 'Sin datos', color: 'grey', icono: 'mdi-help-circle' }
  const p = datos.value.probabilidad_lluvia ?? 0
  const v = datos.value.velocidad_viento
  const r = datos.value.radiacion_solar

  if (p > 60) return { texto: 'Lluvia inminente', color: 'error', icono: 'mdi-weather-rainy' }
  if (v > 40) return { texto: 'Viento fuerte', color: 'warning', icono: 'mdi-weather-windy' }
  if (r > 400) return { texto: 'Soleado', color: 'amber', icono: 'mdi-weather-sunny' }
  if (r > 150)
    return { texto: 'Parcialmente nublado', color: 'info', icono: 'mdi-weather-partly-cloudy' }
  return { texto: 'Nublado', color: 'grey', icono: 'mdi-weather-cloudy' }
})

const recomendacion = computed(() => {
  if (!datos.value)
    return { titulo: 'Sin datos', texto: '', color: 'grey', icono: 'mdi-help', iconoColor: 'grey' }
  const p = datos.value.probabilidad_lluvia ?? 0
  const v = datos.value.velocidad_viento

  if (p > 60 || v > 40)
    return {
      titulo: 'Cerrar invernaderos',
      texto: 'Condiciones de riesgo detectadas',
      color: 'error',
      icono: 'mdi-arrow-down-circle',
      iconoColor: 'error',
    }
  return {
    titulo: 'Condiciones favorables',
    texto: 'Puede mantener invernaderos abiertos',
    color: 'success',
    icono: 'mdi-arrow-up-circle',
    iconoColor: 'success',
  }
})

const cargar = async () => {
  await store.cargarUltimoDato(zonaSeleccionada.value)
  await cargarHistorial()
  progreso.value = 100
}

const cargarHistorial = async () => {
  cargandoHistorial.value = true
  try {
    const { data } = await api.get(`/meteorologia/historial/${zonaSeleccionada.value}`)
    if (data.ok) historial.value = data.data
  } catch {
    historial.value = []
  } finally {
    cargandoHistorial.value = false
  }
}

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const exportarMeteoExcel = () => {
  const datos = historial.value.map((d: any) => ({
    Fecha: formatFecha(d.registrado_at),
    'Temperatura (°C)': d.temperatura,
    'Humedad (%)': d.humedad,
    'Viento (km/h)': d.velocidad_viento,
    'Radiación solar (W/m²)': d.radiacion_solar,
    'Prob. lluvia (%)': d.probabilidad_lluvia ?? 0,
  }))
  exportarExcel(datos, 'meteorologia-malima', 'Meteorología')
}

const exportarMeteoPDF = () => {
  const headers = [
    'Fecha',
    'Temp. (°C)',
    'Humedad (%)',
    'Viento (km/h)',
    'Radiación (W/m²)',
    'Lluvia (%)',
  ]
  const rows = historial.value.map((d: any) => [
    formatFecha(d.registrado_at),
    d.temperatura,
    d.humedad,
    d.velocidad_viento,
    d.radiacion_solar,
    d.probabilidad_lluvia ?? 0,
  ])
  exportarPDF('Datos Meteorológicos', headers, rows, 'meteorologia-malima')
}

onMounted(async () => {
  loadingStore.mostrar('Cargando meteorología...')
  await invernaderosStore.cargarZonas()
  zonaSeleccionada.value = zonas.value[0]?.id ?? 1
  await cargar()
  loadingStore.ocultar()
  intervalo = setInterval(cargar, 30000)
  intervaloProg = setInterval(() => {
    progreso.value = Math.max(0, progreso.value - 100 / 30)
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervalo)
  clearInterval(intervaloProg)
})
</script>
