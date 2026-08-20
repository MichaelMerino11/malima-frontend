<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-9" align="center">
      <v-col>
        <div class="d-flex align-center" style="gap: 16px">
          <img src="/logo_malima_icono.png" height="56" style="object-fit: contain" />
          <div>
            <h1 class="text-h4 font-weight-bold text-primary mb-1">
              Bienvenido, {{ authStore.usuario?.nombre ?? 'Operador' }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis mb-0">
              {{ fechaActual }} — Sistema de Automatización de Invernaderos
            </p>
          </div>
        </div>
      </v-col>

      <v-col cols="auto">
        <v-chip
          :color="conexionTinker ? 'success' : 'error'"
          variant="tonal"
          :prepend-icon="conexionTinker ? 'mdi-wifi' : 'mdi-wifi-off'"
          :class="!conexionTinker ? 'pulsing' : ''"
        >
          {{ conexionTinker ? 'TinkerBoard conectada' : 'TinkerBoard desconectada' }}
        </v-chip>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" sm="4" md="2">
        <v-card
          rounded="lg"
          elevation="2"
          class="pa-3 text-center fade-in"
          color="primary"
          variant="tonal"
        >
          <v-icon size="28" color="primary">mdi-greenhouse</v-icon>
          <p class="text-h5 font-weight-bold mt-1">{{ resumen.total }}</p>
          <p class="text-caption text-medium-emphasis">Galpones</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card
          rounded="lg"
          elevation="2"
          class="pa-3 text-center fade-in"
          color="success"
          variant="tonal"
        >
          <v-icon size="28" color="success">mdi-arrow-up-circle</v-icon>
          <p class="text-h5 font-weight-bold mt-1 text-success">{{ resumen.abiertos }}</p>
          <p class="text-caption text-medium-emphasis">Abiertos</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card
          rounded="lg"
          elevation="2"
          class="pa-3 text-center fade-in"
          color="error"
          variant="tonal"
        >
          <v-icon size="28" color="error">mdi-arrow-down-circle</v-icon>
          <p class="text-h5 font-weight-bold mt-1 text-error">{{ resumen.cerrados }}</p>
          <p class="text-caption text-medium-emphasis">Cerrados</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card
          rounded="lg"
          elevation="2"
          class="pa-3 text-center fade-in"
          color="warning"
          variant="tonal"
        >
          <v-icon size="28" color="warning" :class="resumen.en_movimiento > 0 ? 'rotating' : ''"
            >mdi-loading</v-icon
          >
          <p class="text-h5 font-weight-bold mt-1 text-warning">{{ resumen.en_movimiento }}</p>
          <p class="text-caption text-medium-emphasis">En movimiento</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card
          rounded="lg"
          elevation="2"
          class="pa-3 text-center fade-in"
          color="info"
          variant="tonal"
        >
          <v-icon size="28" color="info">mdi-robot</v-icon>
          <p class="text-h5 font-weight-bold mt-1 text-info">{{ resumen.en_automatico }}</p>
          <p class="text-caption text-medium-emphasis">Automático</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card
          rounded="lg"
          elevation="2"
          class="pa-3 text-center"
          color="secondary"
          variant="tonal"
        >
          <v-icon size="28" color="secondary">mdi-hand-back-right</v-icon>
          <p class="text-h5 font-weight-bold mt-1">{{ resumen.en_local }}</p>
          <p class="text-caption text-medium-emphasis">Local</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title class="d-flex align-center gap-2 pa-4">
            <v-icon color="primary">mdi-weather-partly-cloudy</v-icon>
            <span class="text-body-1 font-weight-bold">Clima actual</span>
            <v-spacer />
            <v-chip size="x-small" variant="tonal" color="primary">{{ zonaClimaActual }}</v-chip>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <div v-if="meteo" class="d-flex flex-column gap-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-2">
                  <v-icon color="error">mdi-thermometer</v-icon>
                  <span class="text-body-2">Temperatura</span>
                </div>
                <span class="font-weight-bold">{{ meteo.temperatura }}°C</span>
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-2">
                  <v-icon color="info">mdi-water-percent</v-icon>
                  <span class="text-body-2">Humedad</span>
                </div>
                <span class="font-weight-bold">{{ meteo.humedad }}%</span>
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-2">
                  <v-icon color="warning">mdi-weather-windy</v-icon>
                  <span class="text-body-2">Viento</span>
                </div>
                <span class="font-weight-bold">{{ meteo.velocidad_viento }} km/h</span>
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-2">
                  <v-icon color="amber">mdi-weather-sunny</v-icon>
                  <span class="text-body-2">Radiación solar</span>
                </div>
                <span class="font-weight-bold">{{ meteo.radiacion_solar }} W/m²</span>
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-2">
                  <v-icon color="blue">mdi-weather-rainy</v-icon>
                  <span class="text-body-2"
                    >Probabilidad
                    <details></details>
                    lluvia</span
                  >
                </div>
                <v-chip
                  size="small"
                  :color="(meteo.probabilidad_lluvia ?? 0) > 60 ? 'error' : 'success'"
                  variant="tonal"
                >
                  {{ meteo.probabilidad_lluvia ?? 0 }}%
                </v-chip>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <v-icon size="40" color="grey-lighten-2">mdi-weather-cloudy</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">Sin datos del sensor</p>
            </div>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              to="/meteorologia"
              append-icon="mdi-arrow-right"
            >
              Ver meteorología completa
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title class="d-flex align-center gap-2 pa-4">
            <v-icon color="primary">mdi-lightning-bolt</v-icon>
            <span class="text-body-1 font-weight-bold">Accesos rápidos</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="6">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  color="primary"
                  class="pa-3 text-center"
                  hover
                  to="/dashboard"
                >
                  <v-icon size="28" color="primary">mdi-view-dashboard</v-icon>
                  <p class="text-caption font-weight-medium mt-1">Dashboard</p>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  color="info"
                  class="pa-3 text-center"
                  hover
                  to="/meteorologia"
                >
                  <v-icon size="28" color="info">mdi-weather-partly-cloudy</v-icon>
                  <p class="text-caption font-weight-medium mt-1">Meteorología</p>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  color="warning"
                  class="pa-3 text-center"
                  hover
                  to="/eventos"
                >
                  <v-icon size="28" color="warning">mdi-history</v-icon>
                  <p class="text-caption font-weight-medium mt-1">Historial</p>
                </v-card>
              </v-col>
              <v-col cols="6" v-if="authStore.isAdmin">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  color="success"
                  class="pa-3 text-center"
                  hover
                  to="/usuarios"
                >
                  <v-icon size="28" color="success">mdi-account-group</v-icon>
                  <p class="text-caption font-weight-medium mt-1">Usuarios</p>
                </v-card>
              </v-col>
              <v-col cols="6" v-if="authStore.isAdmin">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  color="secondary"
                  class="pa-3 text-center"
                  hover
                  to="/configuracion"
                >
                  <v-icon size="28" color="secondary">mdi-cog</v-icon>
                  <p class="text-caption font-weight-medium mt-1">Configuración</p>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  color="error"
                  class="pa-3 text-center"
                  hover
                  to="/perfil"
                >
                  <v-icon size="28" color="error">mdi-account-circle</v-icon>
                  <p class="text-caption font-weight-medium mt-1">Mi perfil</p>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title class="d-flex align-center gap-2 pa-4">
            <v-icon color="primary">mdi-history</v-icon>
            <span class="text-body-1 font-weight-bold">Últimos eventos</span>
          </v-card-title>
          <v-divider />
          <v-list lines="two" class="pa-2">
            <template v-if="ultimosEventos.length === 0">
              <v-list-item>
                <v-list-item-title class="text-body-2 text-medium-emphasis text-center">
                  Sin eventos recientes
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item
                v-for="evento in ultimosEventos"
                :key="evento.id"
                rounded="lg"
                class="mb-1"
              >
                <template #prepend>
                  <v-icon
                    :color="
                      evento.accion === 'abrir'
                        ? 'success'
                        : evento.accion === 'cerrar'
                          ? 'error'
                          : 'warning'
                    "
                    size="20"
                  >
                    {{
                      evento.accion === 'abrir'
                        ? 'mdi-arrow-up-circle'
                        : evento.accion === 'cerrar'
                          ? 'mdi-arrow-down-circle'
                          : 'mdi-stop-circle'
                    }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{
                  evento.invernadero_nombre
                }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ evento.accion }} — {{ formatHora(evento.created_at) }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip
                    size="x-small"
                    :color="evento.resultado === 'exitoso' ? 'success' : 'error'"
                    variant="tonal"
                  >
                    {{ evento.resultado }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-list>
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              to="/eventos"
              append-icon="mdi-arrow-right"
            >
              Ver historial completo
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'
import api from '../api/axios'

const loadingStore = useLoadingStore()
const authStore = useAuthStore()
const invernaderosStore = useInvernaderosStore()

const meteo = ref<any>(null)
const ultimosEventos = ref<any[]>([])
const conexionTinker = ref(false)
const zonaClimaActual = ref('Zona A')

const resumen = reactive({
  total: 0,
  abiertos: 0,
  cerrados: 0,
  en_movimiento: 0,
  en_automatico: 0,
  en_remoto: 0,
  en_local: 0,
})

let intervalo: ReturnType<typeof setInterval>

const fechaActual = computed(() => {
  return new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

const formatHora = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const cargar = async () => {
  try {
    // Resumen
    const res = await api.get('/zonas/resumen')
    if (res.data.ok) Object.assign(resumen, res.data.data)

    // Clima zona 1
    const meteoRes = await api.get('/tinker/ultimo-estado/1')
    if (meteoRes.data.ok && meteoRes.data.data.meteorologia) {
      meteo.value = meteoRes.data.data.meteorologia
      conexionTinker.value = true
    } else {
      conexionTinker.value = false
    }

    // Últimos 5 eventos
    const eventosRes = await api.get('/zonas/eventos?limit=5')
    if (eventosRes.data.ok) ultimosEventos.value = eventosRes.data.data
  } catch {
    conexionTinker.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando sistema...')
  await cargar()
  loadingStore.ocultar()
  intervalo = setInterval(cargar, 30000)
})

onUnmounted(() => {
  clearInterval(intervalo)
})
</script>

<style scoped>
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
</style>
