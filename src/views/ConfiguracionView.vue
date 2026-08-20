<template>
  <v-container fluid class="config-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-cog-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Configuración</h1>

            <v-chip
              v-if="cantidadCambios > 0"
              color="warning"
              variant="tonal"
              size="small"
              class="pending-chip"
            >
              <v-icon start size="15"> mdi-content-save-alert-outline </v-icon>

              {{ cantidadCambios }}
              {{ cantidadCambios === 1 ? 'cambio pendiente' : 'cambios pendientes' }}
            </v-chip>
          </div>

          <p class="page-subtitle">
            Administra los parámetros de conexión, automatización y alertas del sistema
          </p>
        </div>
      </div>

      <div class="page-header__actions">
        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="cargando"
          @click="cargar"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <v-row class="mb-5">
      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div class="summary-card__icon summary-card__icon--primary">
            <v-icon size="23"> mdi-tune-variant </v-icon>
          </div>

          <div class="summary-card__content">
            <strong>
              {{ configuraciones.length }}
            </strong>

            <span> Parámetros configurados </span>
          </div>

          <span class="summary-card__accent summary-card__accent--primary" />
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div class="summary-card__icon summary-card__icon--info">
            <v-icon size="23"> mdi-developer-board </v-icon>
          </div>

          <div class="summary-card__content">
            <strong>
              {{ tinkerConfigs.length }}
            </strong>

            <span> Parámetros TinkerBoard </span>
          </div>

          <span class="summary-card__accent summary-card__accent--info" />
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div class="summary-card__icon summary-card__icon--warning">
            <v-icon size="23"> mdi-alert-outline </v-icon>
          </div>

          <div class="summary-card__content">
            <strong>
              {{ umbralConfigs.length }}
            </strong>

            <span> Umbrales de alerta </span>
          </div>

          <span class="summary-card__accent summary-card__accent--warning" />
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div
            class="summary-card__icon"
            :class="
              cantidadCambios > 0 ? 'summary-card__icon--warning' : 'summary-card__icon--success'
            "
          >
            <v-icon size="23">
              {{
                cantidadCambios > 0 ? 'mdi-content-save-alert-outline' : 'mdi-check-circle-outline'
              }}
            </v-icon>
          </div>

          <div class="summary-card__content">
            <strong>
              {{ cantidadCambios }}
            </strong>

            <span> Cambios sin guardar </span>
          </div>

          <span
            class="summary-card__accent"
            :class="
              cantidadCambios > 0
                ? 'summary-card__accent--warning'
                : 'summary-card__accent--success'
            "
          />
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="config-card mb-5">
      <div class="config-card__header">
        <div class="config-card__title">
          <div class="section-icon">
            <v-icon size="21"> mdi-developer-board </v-icon>
          </div>

          <div>
            <h2>Conexión con TinkerBoard</h2>

            <p>Parámetros utilizados para la comunicación y automatización del controlador</p>
          </div>
        </div>

        <v-chip color="info" variant="tonal" size="small">
          <v-icon start size="15"> mdi-access-point </v-icon>

          Comunicación
        </v-chip>
      </div>

      <v-divider />

      <div class="config-grid">
        <div
          v-for="config in tinkerConfigs"
          :key="config.clave"
          class="config-item"
          :class="{
            'config-item--modified': estaModificado(config),
          }"
        >
          <div class="config-item__header">
            <div
              class="config-item__icon"
              :class="`config-item__icon--${metadataConfig(config.clave).color}`"
            >
              <v-icon size="19">
                {{ metadataConfig(config.clave).icon }}
              </v-icon>
            </div>

            <div class="config-item__title">
              <div class="d-flex align-center ga-2">
                <strong>
                  {{ config.descripcion }}
                </strong>

                <v-chip
                  v-if="estaModificado(config)"
                  color="warning"
                  variant="tonal"
                  size="x-small"
                >
                  Modificado
                </v-chip>
              </div>

              <span>
                {{ config.clave }}
              </span>
            </div>
          </div>

          <div class="config-item__field">
            <v-text-field
              v-model="config.valor"
              :type="metadataConfig(config.clave).type"
              :suffix="metadataConfig(config.clave).suffix"
              :prepend-inner-icon="metadataConfig(config.clave).inputIcon"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details
              class="config-input"
              @keydown.enter="guardar(config.clave, config.valor)"
            />

            <v-tooltip
              :text="estaModificado(config) ? 'Guardar cambio' : 'Sin cambios pendientes'"
              location="top"
            >
              <template #activator="{ props }">
                <span v-bind="props">
                  <v-btn
                    icon
                    color="primary"
                    variant="tonal"
                    rounded="lg"
                    :loading="guardando === config.clave"
                    :disabled="!estaModificado(config) || guardando !== null"
                    @click="guardar(config.clave, config.valor)"
                  >
                    <v-icon size="19"> mdi-content-save-outline </v-icon>
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
    </v-card>

    <v-card rounded="xl" elevation="0" class="config-card">
      <div class="config-card__header">
        <div class="config-card__title">
          <div class="section-icon section-icon--warning">
            <v-icon size="21"> mdi-alert-outline </v-icon>
          </div>

          <div>
            <h2>Umbrales de alerta</h2>

            <p>Valores utilizados para detectar condiciones meteorológicas de riesgo</p>
          </div>
        </div>

        <v-chip color="warning" variant="tonal" size="small">
          <v-icon start size="15"> mdi-shield-alert-outline </v-icon>

          Monitoreo
        </v-chip>
      </div>

      <v-divider />

      <div v-if="umbralConfigs.length > 0" class="threshold-notice">
        <div class="threshold-notice__icon">
          <v-icon size="19"> mdi-information-outline </v-icon>
        </div>

        <div>
          <strong> Configuración sensible </strong>

          <span> Los cambios en estos valores afectan la generación automática de alertas. </span>
        </div>
      </div>

      <div class="config-grid config-grid--thresholds">
        <div
          v-for="config in umbralConfigs"
          :key="config.clave"
          class="config-item"
          :class="{
            'config-item--modified': estaModificado(config),
          }"
        >
          <div class="config-item__header">
            <div class="config-item__icon config-item__icon--warning">
              <v-icon size="19">
                {{ iconoUmbral(config.clave) }}
              </v-icon>
            </div>

            <div class="config-item__title">
              <div class="d-flex align-center ga-2">
                <strong>
                  {{ config.descripcion }}
                </strong>

                <v-chip
                  v-if="estaModificado(config)"
                  color="warning"
                  variant="tonal"
                  size="x-small"
                >
                  Modificado
                </v-chip>
              </div>

              <span>
                {{ config.clave }}
              </span>
            </div>
          </div>

          <div class="config-item__field">
            <v-text-field
              v-model="config.valor"
              type="number"
              :suffix="unidadUmbral(config.clave)"
              :prepend-inner-icon="iconoUmbral(config.clave)"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details
              class="config-input"
              @keydown.enter="guardar(config.clave, config.valor)"
            />

            <v-tooltip
              :text="estaModificado(config) ? 'Guardar cambio' : 'Sin cambios pendientes'"
              location="top"
            >
              <template #activator="{ props }">
                <span v-bind="props">
                  <v-btn
                    icon
                    color="warning"
                    variant="tonal"
                    rounded="lg"
                    :loading="guardando === config.clave"
                    :disabled="!estaModificado(config) || guardando !== null"
                    @click="guardar(config.clave, config.valor)"
                  >
                    <v-icon size="19"> mdi-content-save-outline </v-icon>
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
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
      <div class="snackbar-content">
        <v-icon size="20">
          {{ snackbar.color === 'error' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
        </v-icon>

        <span>
          {{ snackbar.mensaje }}
        </span>
      </div>

      <template #actions>
        <v-btn icon size="small" variant="text" @click="snackbar.visible = false">
          <v-icon size="17"> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import api from '../api/axios'
import { useLoadingStore } from '../stores/loading'

const loadingStore = useLoadingStore()

interface Configuracion {
  id: number
  clave: string
  valor: string
  descripcion: string
}

const configuraciones = ref<Configuracion[]>([])
const valoresOriginales = ref<Record<string, string>>({})

const guardando = ref<string | null>(null)
const cargando = ref(false)

const snackbar = reactive({
  visible: false,
  mensaje: '',
  color: 'success',
})

const tinkerConfigs = computed(() =>
  configuraciones.value.filter((config) =>
    [
      'tinkerboard_url',
      'tinkerboard_endpoint_comando',
      'tinkerboard_timeout',
      'automatizacion_intervalo',
    ].includes(config.clave),
  ),
)

const umbralConfigs = computed(() =>
  configuraciones.value.filter((config) => config.clave.startsWith('umbral_')),
)

const cantidadCambios = computed(
  () => configuraciones.value.filter((config) => estaModificado(config)).length,
)

const estaModificado = (config: Configuracion) => {
  return String(config.valor ?? '') !== String(valoresOriginales.value[config.clave] ?? '')
}

const metadataConfig = (clave: string) => {
  if (clave === 'tinkerboard_url') {
    return {
      icon: 'mdi-server-network-outline',
      inputIcon: 'mdi-link-variant',
      color: 'primary',
      type: 'text',
      suffix: undefined,
    }
  }

  if (clave === 'tinkerboard_endpoint_comando') {
    return {
      icon: 'mdi-api',
      inputIcon: 'mdi-api',
      color: 'info',
      type: 'text',
      suffix: undefined,
    }
  }

  if (clave === 'tinkerboard_timeout') {
    return {
      icon: 'mdi-timer-outline',
      inputIcon: 'mdi-timer-outline',
      color: 'warning',
      type: 'number',
      suffix: 'ms',
    }
  }

  if (clave === 'automatizacion_intervalo') {
    return {
      icon: 'mdi-update',
      inputIcon: 'mdi-clock-outline',
      color: 'success',
      type: 'number',
      suffix: 's',
    }
  }

  return {
    icon: 'mdi-tune-variant',
    inputIcon: 'mdi-tune-variant',
    color: 'primary',
    type: 'text',
    suffix: undefined,
  }
}

const iconoUmbral = (clave: string) => {
  const key = clave.toLowerCase()

  if (key.includes('temperatura')) {
    return 'mdi-thermometer'
  }

  if (key.includes('humedad')) {
    return 'mdi-water-percent'
  }

  if (key.includes('viento')) {
    return 'mdi-weather-windy'
  }

  if (key.includes('lluvia')) {
    return 'mdi-weather-rainy'
  }

  if (key.includes('presion')) {
    return 'mdi-gauge'
  }

  if (key.includes('radiacion')) {
    return 'mdi-white-balance-sunny'
  }

  return 'mdi-alert-outline'
}

const unidadUmbral = (clave: string) => {
  const key = clave.toLowerCase()

  if (key.includes('temperatura')) {
    return '°C'
  }

  if (key.includes('humedad') || key.includes('lluvia')) {
    return '%'
  }

  if (key.includes('viento')) {
    return 'km/h'
  }

  if (key.includes('presion')) {
    return 'hPa'
  }

  if (key.includes('radiacion')) {
    return 'W/m²'
  }

  return undefined
}

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.visible = true
}

const cargar = async () => {
  if (cargando.value) {
    return
  }

  cargando.value = true

  try {
    const { data } = await api.get('/configuracion')

    if (data.ok) {
      configuraciones.value = data.data ?? []

      valoresOriginales.value = Object.fromEntries(
        configuraciones.value.map((config) => [config.clave, String(config.valor ?? '')]),
      )
    } else {
      configuraciones.value = []
    }
  } catch (error) {
    console.error('Error cargando configuración:', error)

    mostrarSnackbar('Error cargando configuración', 'error')
  } finally {
    cargando.value = false
  }
}

const guardar = async (clave: string, valor: string) => {
  if (guardando.value !== null) {
    return
  }

  guardando.value = clave

  try {
    const { data } = await api.patch(`/configuracion/${clave}`, {
      valor,
    })

    if (data.ok) {
      valoresOriginales.value[clave] = String(valor ?? '')

      mostrarSnackbar('Configuración guardada correctamente')
    } else {
      mostrarSnackbar(data.mensaje ?? 'No fue posible guardar la configuración', 'error')
    }
  } catch (error) {
    console.error('Error guardando configuración:', error)

    mostrarSnackbar('Error guardando configuración', 'error')
  } finally {
    guardando.value = null
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando configuración...')

  try {
    await cargar()
  } finally {
    loadingStore.ocultar()
  }
})
</script>

<style scoped>
.config-page {
  max-width: 1500px;
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
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.pending-chip {
  font-weight: 600;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-card {
  position: relative;
  min-height: 94px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 24px rgba(0, 0, 0, 0.05) !important;
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

.summary-card__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.summary-card__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.summary-card__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.summary-card__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.summary-card__content strong {
  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-card__content span {
  margin-top: 4px;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.summary-card__accent {
  position: absolute;
  top: 21px;
  right: 0;
  bottom: 21px;
  width: 3px;
  border-radius: 4px 0 0 4px;
}

.summary-card__accent--primary {
  background: rgb(var(--v-theme-primary));
}

.summary-card__accent--info {
  background: rgb(var(--v-theme-info));
}

.summary-card__accent--warning {
  background: rgb(var(--v-theme-warning));
}

.summary-card__accent--success {
  background: rgb(var(--v-theme-success));
}

.config-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.config-card__header {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
}

.config-card__title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.section-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.section-icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.config-card__title h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.config-card__title p {
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
}

.config-item {
  min-width: 0;
  padding: 15px;
  border: 1px solid rgba(var(--v-border-color), 0.6);
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.018);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.config-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.config-item--modified {
  border-color: rgba(var(--v-theme-warning), 0.3);
  background: rgba(var(--v-theme-warning), 0.025);
}

.config-item__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}

.config-item__icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.config-item__icon--primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.config-item__icon--info {
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.09);
}

.config-item__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.config-item__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.config-item__title {
  min-width: 0;
  flex: 1;
}

.config-item__title strong {
  display: block;
  font-size: 0.82rem;
  font-weight: 650;
}

.config-item__title > span {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.config-item__field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-input {
  min-width: 0;
  flex: 1;
}

.config-input :deep(.v-field__input) {
  min-height: 44px;
  font-size: 0.84rem;
}

.config-input :deep(.v-field__prepend-inner) {
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.threshold-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 16px 0;
  padding: 11px 13px;
  border-radius: 12px;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.065);
}

.threshold-notice__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba(var(--v-theme-warning), 0.1);
}

.threshold-notice > div:last-child {
  display: flex;
  flex-direction: column;
}

.threshold-notice strong {
  font-size: 0.78rem;
  font-weight: 650;
}

.threshold-notice span {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 959px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .config-page {
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
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

  .page-header__actions .v-btn {
    width: 100%;
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
  }

  .summary-card__content strong {
    font-size: 1.2rem;
  }

  .summary-card__content span {
    font-size: 0.72rem;
  }

  .config-card__header {
    align-items: flex-start;
  }

  .config-card__title p {
    font-size: 0.7rem;
  }

  .config-grid {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .pending-chip {
    margin-top: 3px;
  }

  .config-card__header > .v-chip {
    display: none;
  }

  .config-item {
    padding: 13px;
  }

  .config-item__field {
    align-items: stretch;
  }

  .config-item__field > span {
    display: flex;
  }

  .threshold-notice {
    align-items: flex-start;
    margin: 12px 12px 0;
  }
}
</style>