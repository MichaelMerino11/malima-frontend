<template>
  <v-container fluid class="dashboard-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-view-dashboard-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Dashboard</h1>

            <v-chip
              :color="resumen.en_movimiento > 0 ? 'warning' : 'success'"
              variant="tonal"
              size="small"
              class="system-status"
            >
              <span
                class="status-dot"
                :class="resumen.en_movimiento > 0 ? 'status-dot--warning' : 'status-dot--success'"
              />

              {{
                resumen.en_movimiento > 0
                  ? `${resumen.en_movimiento} en movimiento`
                  : 'Sistema estable'
              }}
            </v-chip>
          </div>

          <p class="page-subtitle">Monitoreo general del estado operativo de las naves</p>
        </div>
      </div>

      <div class="page-header__actions">
        <div v-if="ultimaActualizacion" class="last-update">
          <v-icon size="15"> mdi-clock-outline </v-icon>

          <span> Actualizado {{ ultimaActualizacion }} </span>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="actualizando"
          @click="cargarTodo"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <v-row class="mb-4">
      <v-col v-for="item in indicadores" :key="item.label" cols="6" sm="4" lg="2">
        <v-card rounded="xl" elevation="0" class="summary-card">
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

          <div class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <div class="section-header">
      <div class="section-header__title">
        <div class="section-icon">
          <v-icon size="20"> mdi-greenhouse </v-icon>
        </div>

        <div>
          <h2>Zonas de operación</h2>

          <p>Distribución y estado en tiempo real de las naves</p>
        </div>
      </div>

      <div class="section-header__status">
        <v-chip color="primary" variant="tonal" size="small">
          <v-icon start size="14"> mdi-map-marker-multiple-outline </v-icon>

          {{ zonasOperativas.length }}
          {{ zonasOperativas.length === 1 ? 'zona' : 'zonas' }}
        </v-chip>

        <v-chip color="secondary" variant="tonal" size="small">
          <v-icon start size="14"> mdi-greenhouse </v-icon>

          {{ resumen.total }} naves
        </v-chip>
      </div>
    </div>

    <v-row v-if="actualizando && zonasOperativas.length === 0">
      <v-col v-for="i in 2" :key="i" cols="12" md="6">
        <v-skeleton-loader type="heading, paragraph, list-item-three-line" class="zone-skeleton" />
      </v-col>
    </v-row>

    <div v-else-if="zonasOperativas.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <v-icon size="42" color="primary"> mdi-greenhouse-off </v-icon>
      </div>

      <h3>No hay zonas disponibles</h3>

      <p>No se encontraron Zona A o Zona B configuradas en el sistema.</p>

      <v-btn
        color="primary"
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-refresh"
        @click="cargarTodo"
      >
        Volver a consultar
      </v-btn>
    </div>

    <v-row v-else align="stretch">
      <v-col v-for="zona in zonasOperativas" :key="zona.id" cols="12" md="6">
        <v-card rounded="xl" elevation="0" class="zone-card">
          <div class="zone-card__header">
            <div class="zone-title">
              <div class="zone-title__icon">
                <v-icon size="22"> mdi-greenhouse </v-icon>
              </div>

              <div class="zone-title__text">
                <div class="d-flex align-center ga-2">
                  <h3>
                    {{ zona.nombre }}
                  </h3>

                  <span
                    class="zone-online-dot"
                    :class="{
                      'zone-online-dot--movement': conteoZona(zona, 'en_movimiento') > 0,
                    }"
                  />
                </div>

                <span>
                  {{ totalZona(zona) }}
                  {{ totalZona(zona) === 1 ? 'nave registrada' : 'naves registradas' }}
                  ·
                  {{ descripcionDistribucion(zona) }}
                </span>
              </div>
            </div>

            <div class="zone-actions">
              <v-tooltip text="Abrir todas las naves" location="top">
                <template #activator="{ props: tooltipProps }">
                  <span v-bind="tooltipProps">
                    <v-btn
                      color="success"
                      variant="tonal"
                      rounded="lg"
                      size="small"
                      :icon="mobile"
                      disabled
                      @click="abrirZona(zona.id)"
                    >
                      <v-icon v-if="mobile" size="18"> mdi-arrow-up </v-icon>

                      <template v-else>
                        <v-icon start size="17"> mdi-arrow-up </v-icon>

                        Abrir todo
                      </template>
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>

              <v-tooltip text="Cerrar todas las naves" location="top">
                <template #activator="{ props: tooltipProps }">
                  <span v-bind="tooltipProps">
                    <v-btn
                      color="error"
                      variant="tonal"
                      rounded="lg"
                      size="small"
                      :icon="mobile"
                      disabled
                      @click="cerrarZona(zona.id)"
                    >
                      <v-icon v-if="mobile" size="18"> mdi-arrow-down </v-icon>

                      <template v-else>
                        <v-icon start size="17"> mdi-arrow-down </v-icon>

                        Cerrar todo
                      </template>
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>
            </div>
          </div>

          <div class="distribution-banner">
            <div
              class="distribution-banner__icon"
              :class="
                letraZona(zona) === 'A'
                  ? 'distribution-banner__icon--a'
                  : 'distribution-banner__icon--b'
              "
            >
              <v-icon size="19"> mdi-sitemap-outline </v-icon>
            </div>

            <div class="distribution-banner__content">
              <span> Distribución de naves </span>

              <strong>
                {{
                  letraZona(zona) === 'A'
                    ? '1 · 3 · 5 · 7 · 9 · 11 · 13'
                    : '2 · 4 · 6 · 8 · 10 · 12 · 14'
                }}
              </strong>
            </div>

            <v-chip
              :color="letraZona(zona) === 'A' ? 'primary' : 'info'"
              variant="tonal"
              size="x-small"
            >
              {{ letraZona(zona) === 'A' ? 'Impares' : 'Pares' }}
            </v-chip>
          </div>

          <div class="zone-summary">
            <div class="zone-summary__item">
              <span class="zone-summary__label"> Abiertas </span>

              <div class="zone-summary__value text-success">
                <v-icon size="17"> mdi-arrow-up-circle-outline </v-icon>

                {{ conteoZona(zona, 'abierto') }}
              </div>
            </div>

            <div class="zone-summary__divider" />

            <div class="zone-summary__item">
              <span class="zone-summary__label"> Cerradas </span>

              <div class="zone-summary__value text-error">
                <v-icon size="17"> mdi-arrow-down-circle-outline </v-icon>

                {{ conteoCerrados(zona) }}
              </div>
            </div>

            <div class="zone-summary__divider" />

            <div class="zone-summary__item">
              <span class="zone-summary__label"> En movimiento </span>

              <div class="zone-summary__value text-warning">
                <v-icon
                  size="17"
                  :class="{
                    rotating: conteoZona(zona, 'en_movimiento') > 0,
                  }"
                >
                  mdi-cog-outline
                </v-icon>

                {{ conteoZona(zona, 'en_movimiento') }}
              </div>
            </div>
          </div>

          <div class="zone-progress">
            <div class="zone-progress__header">
              <span> Naves abiertas </span>

              <strong> {{ porcentajeAbiertos(zona) }}% </strong>
            </div>

            <v-progress-linear
              :model-value="porcentajeAbiertos(zona)"
              color="success"
              height="6"
              rounded
            />
          </div>

          <v-divider />

          <div v-if="zona.invernaderos?.length" class="greenhouses-grid">
            <v-card
              v-for="nave in zona.invernaderos"
              :key="nave.id"
              :to="`/zona/${zona.id}`"
              elevation="0"
              rounded="lg"
              class="greenhouse-card"
              :class="`greenhouse-card--${estadoClase(nave.estado)}`"
            >
              <span
                class="greenhouse-card__status"
                :class="`greenhouse-card__status--${estadoClase(nave.estado)}`"
              />

              <div
                class="greenhouse-card__icon"
                :class="`greenhouse-card__icon--${estadoClase(nave.estado)}`"
              >
                <v-icon
                  size="21"
                  :class="{
                    rotating: nave.estado === 'en_movimiento',
                  }"
                >
                  {{ iconoEstado(nave.estado) }}
                </v-icon>
              </div>

              <div class="greenhouse-card__content">
                <strong>
                  {{ nombreNave(nave) }}
                </strong>

                <div class="greenhouse-card__state">
                  <span class="state-dot" :class="`state-dot--${estadoClase(nave.estado)}`" />

                  {{ labelEstado(nave.estado) }}
                </div>
              </div>

              <div class="greenhouse-number">
                {{ numeroNave(nave) }}
              </div>

              <v-icon size="17" class="greenhouse-card__arrow"> mdi-chevron-right </v-icon>
            </v-card>
          </div>

          <div v-else class="zone-empty">
            <v-icon size="34" color="medium-emphasis"> mdi-greenhouse-off </v-icon>

            <span> No hay naves disponibles </span>
          </div>

          <v-divider />

          <div class="zone-card__footer">
            <span class="zone-footer-status">
              <v-icon size="15" color="success"> mdi-access-point </v-icon>

              Monitoreo activo
            </span>

            <v-btn
              variant="text"
              color="primary"
              size="small"
              :to="`/zona/${zona.id}`"
              append-icon="mdi-arrow-right"
            >
              Ver detalle
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'

import { useInvernaderosStore } from '../stores/invernaderos'
import { useLoadingStore } from '../stores/loading'
import { useSocket } from '../composables/useSocket'

const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()

const loadingStore = useLoadingStore()

const store = useInvernaderosStore()

const { zonas } = storeToRefs(store)

const { mobile } = useDisplay()

const actualizando = ref(false)

const ultimaActualizacion = ref('')

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
    if (candidato === null || candidato === undefined) {
      continue
    }

    if (typeof candidato === 'number') {
      return Number.isFinite(candidato) ? candidato : null
    }

    const texto = String(candidato)

    const coincidencia = texto.match(/\d+/)

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

const nombreNave = (nave: any) => {
  const numero = numeroNave(nave)

  if (numero !== null) {
    return `Nave ${numero}`
  }

  const nombre = String(nave?.nombre ?? '').trim()

  if (nombre) {
    return nombre.replace(/galp[oó]n/gi, 'Nave')
  }

  return 'Nave'
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

const letraZona = (zona: any) => {
  return obtenerLetraZona(zona) ?? ''
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

      /*
       * Si la misma nave aparece
       * accidentalmente en más de
       * una zona, conservamos una
       * sola instancia.
       *
       * Priorizamos la que tenga
       * un estado conocido.
       */
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

  const zonaA = zonaAOriginal.value

  const zonaB = zonaBOriginal.value

  if (zonaA) {
    resultado.push({
      ...zonaA,

      nombre: 'Zona A',

      invernaderos: navesFuente.value.filter((nave) => {
        const numero = numeroNave(nave)

        return numero !== null && numero % 2 !== 0
      }),
    })
  }

  if (zonaB) {
    resultado.push({
      ...zonaB,

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

    en_local: locales,

    en_remoto: remotos,
  }
})

const indicadores = computed(() => [
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

const estadoClase = (estado: string) => {
  const valor = normalizarTexto(estado)

  if (valor === 'abierto') {
    return 'success'
  }

  if (valor === 'en_movimiento') {
    return 'warning'
  }

  return 'error'
}

const iconoEstado = (estado: string) => {
  const valor = normalizarTexto(estado)

  if (valor === 'abierto') {
    return 'mdi-arrow-up'
  }

  if (valor === 'en_movimiento') {
    return 'mdi-cog-outline'
  }

  return 'mdi-arrow-down'
}

const labelEstado = (estado: string) => {
  const valor = normalizarTexto(estado)

  if (valor === 'abierto') {
    return 'Abierta'
  }

  if (valor === 'en_movimiento') {
    return 'En movimiento'
  }

  if (valor === 'cerrado') {
    return 'Cerrada'
  }

  return estado || 'Desconocido'
}

const totalZona = (zona: any) => {
  return zona.invernaderos?.length ?? 0
}

const conteoZona = (zona: any, estado: string) => {
  return (
    zona.invernaderos?.filter(
      (nave: any) => normalizarTexto(nave.estado) === normalizarTexto(estado),
    ).length ?? 0
  )
}

const conteoCerrados = (zona: any) => {
  return (
    zona.invernaderos?.filter((nave: any) => {
      const estado = normalizarTexto(nave.estado)

      return estado !== 'abierto' && estado !== 'en_movimiento'
    }).length ?? 0
  )
}

const porcentajeAbiertos = (zona: any) => {
  const total = totalZona(zona)

  if (!total) {
    return 0
  }

  return Math.round((conteoZona(zona, 'abierto') / total) * 100)
}

const descripcionDistribucion = (zona: any) => {
  return letraZona(zona) === 'A' ? 'números impares' : 'números pares'
}

const abrirZona = async (zonaId: number) => {
  await store.enviarComandoZona(zonaId, 'abrir')

  await store.cargarEstadoZona(zonaId)
}

const cerrarZona = async (zonaId: number) => {
  await store.enviarComandoZona(zonaId, 'cerrar')

  await store.cargarEstadoZona(zonaId)
}

const actualizarHora = () => {
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-EC', {
    hour: '2-digit',

    minute: '2-digit',

    hour12: false,
  })
}

const cargarTodo = async () => {
  if (actualizando.value) {
    return
  }

  actualizando.value = true

  try {
    /*
     * Todavía cargamos todas las zonas
     * existentes en backend.
     *
     * Esto permite recuperar el estado
     * de las Naves 1-14 aunque actualmente
     * algunas estén asociadas erróneamente
     * a Zona C o Zona D.
     */
    await store.cargarZonas()

    await Promise.all(zonas.value.map((zona) => store.cargarEstadoZona(zona.id)))

    actualizarHora()
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    actualizando.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando naves...')

  try {
    await cargarTodo()

    /*
     * Nos mantenemos suscritos a las
     * zonas existentes del backend.
     *
     * Mientras se corrige la BD, esto
     * evita perder actualizaciones de
     * una nave que todavía pertenezca
     * a C o D.
     */
    for (const zona of zonas.value) {
      unirseAZona(zona.id)
    }

    escuchar('estado-actualizado', async (data) => {
      if (data?.zona_id) {
        await store.cargarEstadoZona(data.zona_id)
      }

      actualizarHora()
    })

    intervalo = setInterval(cargarTodo, 30000)
  } finally {
    loadingStore.ocultar()
  }
})

onUnmounted(() => {
  dejarDeEscuchar('estado-actualizado')

  if (intervalo) {
    clearInterval(intervalo)
  }
})
</script>

<style scoped>
.dashboard-page {
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

  font-size: 0.875rem;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.system-status {
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;

  margin-right: 7px;

  border-radius: 50%;
}

.status-dot--success {
  background: rgb(var(--v-theme-success));
}

.status-dot--warning {
  background: rgb(var(--v-theme-warning));

  animation: statusPulse 1.5s ease-in-out infinite;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 0.75rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.summary-card {
  position: relative;

  min-height: 94px;

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
  line-height: 1.1;
}

.summary-card__content span {
  margin-top: 4px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.78rem;

  color: rgba(var(--v-theme-on-surface), 0.54);
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

.section-header {
  min-height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-top: 7px;
  margin-bottom: 7px;
}

.section-header__title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.section-header__status {
  display: flex;
  align-items: center;
  gap: 7px;
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

.section-header h2 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.section-header p {
  margin: 3px 0 0;

  font-size: 0.75rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-card {
  height: 100%;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.zone-card:hover {
  transform: translateY(-1px);

  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05) !important;
}

.zone-card__header {
  min-height: 78px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 14px;

  padding: 14px 16px;
}

.zone-title {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 10px;
}

.zone-title__icon {
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

.zone-title__text {
  min-width: 0;
}

.zone-title__text h3 {
  margin: 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.9rem;
  font-weight: 700;
}

.zone-title__text > span {
  display: block;

  margin-top: 3px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-online-dot {
  width: 7px;
  height: 7px;

  flex: 0 0 7px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));
}

.zone-online-dot--movement {
  background: rgb(var(--v-theme-warning));

  animation: statusPulse 1.4s ease-in-out infinite;
}

.zone-actions {
  display: flex;
  align-items: center;

  gap: 6px;
}

.distribution-banner {
  display: flex;
  align-items: center;

  gap: 9px;

  margin: 0 16px 12px;

  padding: 10px 11px;

  border-radius: 11px;

  background: rgba(var(--v-theme-primary), 0.035);
}

.distribution-banner__icon {
  width: 33px;
  height: 33px;

  flex: 0 0 33px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.distribution-banner__icon--a {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.distribution-banner__icon--b {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.distribution-banner__content {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;
}

.distribution-banner__content span {
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.distribution-banner__content strong {
  margin-top: 2px;

  font-size: 0.76rem;
  font-weight: 650;

  letter-spacing: 0.015em;
}

.zone-summary {
  display: flex;
  align-items: center;

  margin: 0 16px;

  padding: 11px 12px;

  border-radius: 12px;

  background: rgba(var(--v-theme-on-surface), 0.028);
}

.zone-summary__item {
  flex: 1;
  min-width: 0;

  text-align: center;
}

.zone-summary__label {
  display: block;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-summary__value {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 4px;

  margin-top: 4px;

  font-size: 0.82rem;
  font-weight: 700;
}

.zone-summary__divider {
  width: 1px;
  height: 29px;

  background: rgba(var(--v-theme-on-surface), 0.09);
}

.zone-progress {
  padding: 13px 16px 16px;
}

.zone-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-bottom: 7px;
}

.zone-progress__header span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-progress__header strong {
  font-size: 0.75rem;
  font-weight: 700;
}

.greenhouses-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 8px;

  padding: 13px;
}

.greenhouse-card {
  position: relative;

  min-width: 0;
  min-height: 70px;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 9px 8px 9px 11px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), 0.45);

  background: rgb(var(--v-theme-surface));

  transition:
    transform 0.17s ease,
    border-color 0.17s ease,
    background-color 0.17s ease;
}

.greenhouse-card:hover {
  transform: translateY(-1px);

  border-color: rgba(var(--v-theme-primary), 0.2);

  background: rgba(var(--v-theme-primary), 0.025);
}

.greenhouse-card--warning {
  background: rgba(var(--v-theme-warning), 0.025);
}

.greenhouse-card__status {
  position: absolute;

  top: 13px;
  bottom: 13px;
  left: 0;

  width: 3px;

  border-radius: 0 4px 4px 0;
}

.greenhouse-card__status--success {
  background: rgb(var(--v-theme-success));
}

.greenhouse-card__status--warning {
  background: rgb(var(--v-theme-warning));
}

.greenhouse-card__status--error {
  background: rgb(var(--v-theme-error));
}

.greenhouse-card__icon {
  width: 36px;
  height: 36px;

  flex: 0 0 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.greenhouse-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.greenhouse-card__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.greenhouse-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.greenhouse-card__content {
  min-width: 0;
  flex: 1;
}

.greenhouse-card__content strong {
  display: block;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.78rem;
  font-weight: 650;
}

.greenhouse-card__state {
  display: flex;
  align-items: center;

  gap: 5px;

  margin-top: 4px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.state-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;
}

.state-dot--success {
  background: rgb(var(--v-theme-success));
}

.state-dot--warning {
  background: rgb(var(--v-theme-warning));
}

.state-dot--error {
  background: rgb(var(--v-theme-error));
}

.greenhouse-number {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 27px;
  height: 27px;

  padding: 0 5px;

  border-radius: 8px;

  font-size: 0.7rem;
  font-weight: 700;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.06);
}

.greenhouse-card__arrow {
  flex-shrink: 0;

  color: rgba(var(--v-theme-on-surface), 0.3);
}

.zone-empty {
  min-height: 135px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 20px;

  font-size: 0.76rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-card__footer {
  min-height: 52px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 6px 10px 6px 16px;
}

.zone-footer-status {
  display: flex;
  align-items: center;

  gap: 5px;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.empty-state {
  min-height: 330px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 35px 20px;

  text-align: center;
}

.empty-state__icon {
  width: 76px;
  height: 76px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 13px;

  border-radius: 50%;

  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;

  font-size: 0.9rem;
  font-weight: 700;
}

.empty-state p {
  margin: 5px 0 18px;

  font-size: 0.78rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.zone-skeleton {
  min-height: 400px;

  border: 1px solid rgba(var(--v-border-color), 0.4);

  border-radius: 16px;
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

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@media (min-width: 1500px) {
  .greenhouses-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .greenhouses-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 959px) {
  .page-header {
    align-items: flex-start;
  }

  .last-update {
    display: none;
  }

  .greenhouses-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .dashboard-page {
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
    font-size: 0.8rem;
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions .v-btn {
    margin-left: auto;
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

  .section-header {
    min-height: 60px;
  }

  .section-header p {
    display: none;
  }

  .section-header__status .v-chip:last-child {
    display: none;
  }

  .zone-card__header {
    padding: 12px;
  }

  .distribution-banner {
    margin: 0 12px 11px;
  }

  .zone-summary {
    margin: 0 12px;
  }

  .zone-progress {
    padding: 12px 12px 14px;
  }

  .greenhouses-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    padding: 11px;
  }
}

@media (max-width: 480px) {
  .system-status {
    display: none;
  }

  .zone-title__text h3 {
    max-width: 130px;
  }

  .zone-card__header {
    align-items: flex-start;
  }

  .distribution-banner__content strong {
    font-size: 0.7rem;
  }

  .distribution-banner .v-chip {
    display: none;
  }

  .zone-summary__label {
    font-size: 0.67rem;
  }

  .greenhouses-grid {
    grid-template-columns: 1fr;
  }

  .zone-card__footer {
    padding-left: 12px;
  }
}
</style>
