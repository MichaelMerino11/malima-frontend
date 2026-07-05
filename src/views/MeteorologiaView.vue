<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Meteorología</h1>
        <p class="text-body-2 text-medium-emphasis">Datos en tiempo real del sensor de campo</p>
      </v-col>
      <v-col cols="auto">
        <v-select
          v-model="zonaSeleccionada"
          :items="zonaItems"
          item-title="nombre"
          item-value="id"
          label="Zona"
          density="compact"
          variant="outlined"
          hide-details
          style="min-width: 160px"
          @update:model-value="cargar"
        />
      </v-col>
    </v-row>

    <!-- Tarjetas de métricas -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="pa-4 text-center">
          <v-icon size="36" color="error">mdi-thermometer</v-icon>
          <p class="text-h5 font-weight-bold mt-2">{{ datos?.temperatura ?? '--' }}°C</p>
          <p class="text-body-2 text-medium-emphasis">Temperatura</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="pa-4 text-center">
          <v-icon size="36" color="info">mdi-water-percent</v-icon>
          <p class="text-h5 font-weight-bold mt-2">{{ datos?.humedad ?? '--' }}%</p>
          <p class="text-body-2 text-medium-emphasis">Humedad</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="pa-4 text-center">
          <v-icon size="36" color="warning">mdi-weather-windy</v-icon>
          <p class="text-h5 font-weight-bold mt-2">{{ datos?.velocidad_viento ?? '--' }} km/h</p>
          <p class="text-body-2 text-medium-emphasis">Viento</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="pa-4 text-center">
          <v-icon size="36" color="amber">mdi-weather-sunny</v-icon>
          <p class="text-h5 font-weight-bold mt-2">{{ datos?.radiacion_solar ?? '--' }} W/m²</p>
          <p class="text-body-2 text-medium-emphasis">Radiación solar</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Alerta de lluvia -->
    <v-row v-if="datos?.probabilidad_lluvia && datos.probabilidad_lluvia > 60">
      <v-col>
        <v-alert
          type="warning"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-weather-rainy"
          title="Alerta de lluvia"
          :text="`Probabilidad de lluvia: ${datos.probabilidad_lluvia}%. Se recomienda cerrar los invernaderos.`"
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

    <!-- Última actualización -->
    <v-row v-if="datos">
      <v-col>
        <p class="text-caption text-medium-emphasis">
          <v-icon size="14">mdi-clock-outline</v-icon>
          Última actualización: {{ formatFecha(datos.registrado_at) }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMeteorologiaStore } from '../stores/meteorologia'
import { useInvernaderosStore } from '../stores/invernaderos'
import { storeToRefs } from 'pinia'

const store = useMeteorologiaStore()
const invernaderosStore = useInvernaderosStore()
const { datos } = storeToRefs(store)
const { zonas } = storeToRefs(invernaderosStore)

const zonaSeleccionada = ref(1)
const zonaItems = computed(() => zonas.value)

let intervalo: ReturnType<typeof setInterval>

const cargar = async () => {
  await store.cargarUltimoDato(zonaSeleccionada.value)
}

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  await cargar()
  intervalo = setInterval(cargar, 30000) // refresca cada 30 segundos
})

onUnmounted(() => {
  clearInterval(intervalo)
})
</script>
