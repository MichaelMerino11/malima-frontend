<template>
  <v-container fluid class="zona-page pa-4 pa-md-6">
    <div class="page-header mb-5">
      <div class="page-header__main">
        <v-btn icon size="small" variant="tonal" color="primary" to="/dashboard" class="back-btn">
          <v-icon size="19"> mdi-arrow-left </v-icon>

          <v-tooltip activator="parent" location="bottom"> Volver al dashboard </v-tooltip>
        </v-btn>

        <div class="page-header__icon">
          <v-icon size="26"> mdi-greenhouse </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">
              {{ zonaActualNombre }}
            </h1>

            <v-chip
              :color="estadoGeneralZona.color"
              variant="tonal"
              size="small"
              class="zone-status-chip"
            >
              <span
                class="zone-status-dot"
                :class="`zone-status-dot--${estadoGeneralZona.color}`"
              />

              {{ estadoGeneralZona.texto }}
            </v-chip>
          </div>

          <p class="page-subtitle">Control individual y monitoreo de las naves</p>
        </div>
      </div>

      <div class="page-header__actions">
        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="actualizando"
          @click="cargarZona"
        >
          Actualizar
        </v-btn>

        <v-tooltip
          text="Disponible cuando la distribución de zonas esté actualizada en el backend"
          location="bottom"
        >
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              <v-btn
                color="success"
                variant="tonal"
                rounded="lg"
                prepend-icon="mdi-arrow-up"
                disabled
              >
                Abrir todo
              </v-btn>
            </span>
          </template>
        </v-tooltip>

        <v-tooltip
          text="Disponible cuando la distribución de zonas esté actualizada en el backend"
          location="bottom"
        >
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              <v-btn
                color="error"
                variant="tonal"
                rounded="lg"
                prepend-icon="mdi-arrow-down"
                disabled
              >
                Cerrar todo
              </v-btn>
            </span>
          </template>
        </v-tooltip>
      </div>
    </div>

    <v-card v-if="zonaActualLetra" rounded="xl" elevation="0" class="distribution-card mb-5">
      <div class="distribution-card__main">
        <div
          class="distribution-card__icon"
          :class="
            zonaActualLetra === 'A' ? 'distribution-card__icon--a' : 'distribution-card__icon--b'
          "
        >
          <v-icon size="20"> mdi-sitemap-outline </v-icon>
        </div>

        <div class="distribution-card__content">
          <span> Distribución de {{ zonaActualNombre }} </span>

          <strong>
            {{ distribucionActual }}
          </strong>
        </div>
      </div>

      <v-chip :color="zonaActualLetra === 'A' ? 'primary' : 'info'" variant="tonal" size="small">
        <v-icon start size="15"> mdi-greenhouse </v-icon>

        {{ zonaActualLetra === 'A' ? 'Naves impares' : 'Naves pares' }}
      </v-chip>
    </v-card>

    <v-row class="mb-4">
      <v-col v-for="item in resumenEstado" :key="item.label" cols="6" md="3">
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

          <span class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="modes-overview mb-5">
      <div class="modes-overview__title">
        <div class="modes-overview__icon">
          <v-icon size="20"> mdi-tune-variant </v-icon>
        </div>

        <div>
          <strong> Modos de operación </strong>

          <span> Distribución actual de las naves </span>
        </div>
      </div>

      <div class="modes-overview__items">
        <div class="mode-summary">
          <div class="mode-summary__icon mode-summary__icon--primary">
            <v-icon size="17"> mdi-robot-outline </v-icon>
          </div>

          <div>
            <strong>
              {{ conteoModo('automatico') }}
            </strong>

            <span> Automático </span>
          </div>
        </div>

        <div class="mode-summary">
          <div class="mode-summary__icon mode-summary__icon--info">
            <v-icon size="17"> mdi-access-point </v-icon>
          </div>

          <div>
            <strong>
              {{ conteoModo('remoto') }}
            </strong>

            <span> Remoto </span>
          </div>
        </div>

        <div class="mode-summary">
          <div class="mode-summary__icon mode-summary__icon--warning">
            <v-icon size="17"> mdi-hand-back-right-outline </v-icon>
          </div>

          <div>
            <strong>
              {{ conteoModo('local') }}
            </strong>

            <span> Local </span>
          </div>
        </div>
      </div>
    </v-card>

    <div class="section-header mb-2">
      <div class="section-header__main">
        <div class="section-header__icon">
          <v-icon size="20"> mdi-view-grid-outline </v-icon>
        </div>

        <div>
          <h2>Naves de la zona</h2>

          <p>Administra individualmente el modo y estado de cada nave</p>
        </div>
      </div>

      <v-chip color="primary" variant="tonal" size="small">
        {{ naves.length }}
        {{ naves.length === 1 ? 'nave' : 'naves' }}
      </v-chip>
    </div>

    <v-row v-if="actualizando && naves.length === 0">
      <v-col v-for="i in 7" :key="i" cols="12" sm="6" lg="4" xl="3">
        <v-skeleton-loader
          type="heading, list-item-two-line, actions"
          class="greenhouse-skeleton"
        />
      </v-col>
    </v-row>

    <div v-else-if="!zonaActualLetra" class="empty-state">
      <div class="empty-state__icon">
        <v-icon size="44" color="warning"> mdi-map-marker-alert-outline </v-icon>
      </div>

      <h3>Zona no disponible</h3>

      <p>Esta vista solamente está disponible para Zona A y Zona B.</p>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-arrow-left"
        rounded="lg"
        to="/dashboard"
      >
        Volver al dashboard
      </v-btn>
    </div>

    <div v-else-if="naves.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <v-icon size="44" color="primary"> mdi-greenhouse-off </v-icon>
      </div>

      <h3>No hay naves disponibles</h3>

      <p>
        No fue posible encontrar las naves correspondientes a
        {{ zonaActualNombre }} o todavía no tienen estado registrado.
      </p>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        rounded="lg"
        @click="cargarZona"
      >
        Consultar nuevamente
      </v-btn>
    </div>

    <v-row v-else>
      <v-col v-for="nave in naves" :key="nave.id" cols="12" sm="6" lg="4" xl="3">
        <v-card
          rounded="xl"
          elevation="0"
          class="greenhouse-card"
          :class="`greenhouse-card--${estadoClase(nave.estado)}`"
        >
          <span
            class="greenhouse-card__accent"
            :class="`greenhouse-card__accent--${estadoClase(nave.estado)}`"
          />

          <div class="greenhouse-card__header">
            <div class="greenhouse-identity">
              <div
                class="greenhouse-identity__icon"
                :class="`greenhouse-identity__icon--${estadoClase(nave.estado)}`"
              >
                <v-icon
                  size="22"
                  :class="{
                    rotating: normalizarTexto(nave.estado) === 'en_movimiento',
                  }"
                >
                  {{
                    normalizarTexto(nave.estado) === 'en_movimiento'
                      ? 'mdi-cog-outline'
                      : 'mdi-greenhouse'
                  }}
                </v-icon>
              </div>

              <div class="greenhouse-identity__text">
                <strong>
                  {{ nombreNave(nave) }}
                </strong>

                <span> Equipo #{{ nave.id }} </span>
              </div>
            </div>

            <v-chip
              :color="colorEstado(nave.estado)"
              size="small"
              variant="tonal"
              class="state-chip"
            >
              <v-icon start size="14">
                {{ iconoEstado(nave.estado) }}
              </v-icon>

              {{ labelEstado(nave.estado) }}
            </v-chip>
          </div>

          <div class="status-panel">
            <div class="status-panel__item">
              <span> Estado operativo </span>

              <strong :class="`text-${colorEstado(nave.estado)}`">
                {{ labelEstado(nave.estado) }}
              </strong>
            </div>

            <div class="status-panel__divider" />

            <div class="status-panel__item">
              <span> Control </span>

              <strong
                :class="normalizarTexto(nave.modo) === 'local' ? 'text-warning' : 'text-success'"
              >
                {{ normalizarTexto(nave.modo) === 'local' ? 'Local' : 'Disponible' }}
              </strong>
            </div>
          </div>

          <div class="mode-section">
            <div class="mode-section__header">
              <div>
                <span class="field-label"> Modo de operación </span>

                <p>Define cómo se controla esta nave</p>
              </div>

              <v-chip size="small" :color="modoColor(nave.modo)" variant="tonal" class="mode-chip">
                <v-icon start size="14">
                  {{ modoIcono(nave.modo) }}
                </v-icon>

                {{ modoLabel(nave.modo) }}
              </v-chip>
            </div>

            <v-select
              :model-value="nave.modo"
              :items="modos"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              rounded="lg"
              hide-details
              :prepend-inner-icon="modoIcono(nave.modo)"
              :loading="cambiandoModoId === nave.id"
              :disabled="cambiandoModoId !== null || procesandoId !== null"
              class="mode-select"
              @update:model-value="(valor) => cambiarModo(nave, valor)"
            />
          </div>

          <div v-if="normalizarTexto(nave.modo) === 'local'" class="local-warning">
            <div class="local-warning__icon">
              <v-icon size="18"> mdi-lock-outline </v-icon>
            </div>

            <div>
              <strong> Control local activo </strong>

              <span> Los comandos remotos están deshabilitados. </span>
            </div>
          </div>

          <div v-else class="remote-status">
            <div class="remote-status__left">
              <span class="remote-dot" />

              <div>
                <strong> Control remoto disponible </strong>

                <span> El equipo acepta comandos desde el sistema </span>
              </div>
            </div>

            <v-icon size="17" color="success"> mdi-access-point </v-icon>
          </div>

          <div class="greenhouse-actions">
            <v-btn
              color="success"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-arrow-up"
              :disabled="
                normalizarTexto(nave.modo) === 'local' ||
                procesandoId !== null ||
                cambiandoModoId !== null
              "
              :loading="procesandoId === nave.id && accionProcesando === 'abrir'"
              @click="enviarComando(nave, 'abrir')"
            >
              Abrir
            </v-btn>

            <v-btn
              color="error"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-arrow-down"
              :disabled="
                normalizarTexto(nave.modo) === 'local' ||
                procesandoId !== null ||
                cambiandoModoId !== null
              "
              :loading="procesandoId === nave.id && accionProcesando === 'cerrar'"
              @click="enviarComando(nave, 'cerrar')"
            >
              Cerrar
            </v-btn>

            <v-tooltip text="Detener movimiento" location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <v-btn
                    color="warning"
                    variant="tonal"
                    rounded="lg"
                    icon
                    :disabled="
                      normalizarTexto(nave.modo) === 'local' ||
                      procesandoId !== null ||
                      cambiandoModoId !== null
                    "
                    :loading="procesandoId === nave.id && accionProcesando === 'detener'"
                    @click="enviarComando(nave, 'detener')"
                  >
                    <v-icon size="19"> mdi-stop </v-icon>
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
          </div>
        </v-card>
      </v-col>
    </v-row>

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

    <ModalConfirmar
      v-model="modalConfirmar.visible"
      :accion="modalConfirmar.accion"
      :nombre="modalConfirmar.nombre"
      @confirmar="ejecutarAccion"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

import { useRoute } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useInvernaderosStore } from '../stores/invernaderos'

import { useLoadingStore } from '../stores/loading'

import { useSocket } from '../composables/useSocket'

import ModalConfirmar from '../components/shared/ModalConfirmar.vue'

const loadingStore = useLoadingStore()

const route = useRoute()

const store = useInvernaderosStore()

const { zonas } = storeToRefs(store)

const { unirseAZona, escuchar, dejarDeEscuchar } = useSocket()

const actualizando = ref(false)

const cambiandoModoId = ref<number | null>(null)

const procesandoId = ref<number | null>(null)

const accionProcesando = ref<'abrir' | 'cerrar' | 'detener' | null>(null)

const NAVE_MIN = 1
const NAVE_MAX = 14

const zonaIdRuta = computed(() => {
  return Number(route.params.id)
})

const snackbar = reactive({
  visible: false,

  mensaje: '',

  color: 'success',
})

const modalConfirmar = reactive({
  visible: false,

  accion: 'abrir' as 'abrir' | 'cerrar' | 'detener',

  nombre: '',

  callback: null as (() => Promise<void>) | null,
})

const modos = [
  {
    title: 'Automático',

    value: 'automatico',
  },

  {
    title: 'Remoto',

    value: 'remoto',
  },

  {
    title: 'Local',

    value: 'local',
  },
]

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

const zonaActual = computed(() => {
  return zonas.value.find((zona: any) => Number(zona.id) === Number(zonaIdRuta.value))
})

const zonaActualLetra = computed<'A' | 'B' | null>(() => {
  return obtenerLetraZona(zonaActual.value)
})

const zonaActualNombre = computed(() => {
  if (zonaActualLetra.value === 'A') {
    return 'Zona A'
  }

  if (zonaActualLetra.value === 'B') {
    return 'Zona B'
  }

  return zonaActual.value?.nombre ?? 'Zona'
})

const distribucionActual = computed(() => {
  if (zonaActualLetra.value === 'A') {
    return 'Naves 1 · 3 · 5 · 7 · 9 · 11 · 13'
  }

  if (zonaActualLetra.value === 'B') {
    return 'Naves 2 · 4 · 6 · 8 · 10 · 12 · 14'
  }

  return 'Sin distribución definida'
})

const numeroNave = (nave: any): number | null => {
  const candidatos = [
    nave?.numero_nave,
    nave?.numeroNave,
    nave?.nave_numero,

    nave?.numero,
    nave?.numero_galpon,
    nave?.galpon_numero,

    nave?.numero_invernadero,
    nave?.invernadero_numero,

    nave?.codigo,
    nave?.nombre,
    nave?.galpon_nombre,
    nave?.invernadero_nombre,
    nave?.nave_nombre,
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
   * Fallback temporal.
   * Si en la BD el ID coincide
   * con el número físico 1-14,
   * podemos utilizarlo.
   */
  const id = Number(nave?.id)

  if (Number.isFinite(id) && id >= NAVE_MIN && id <= NAVE_MAX) {
    return id
  }

  return null
}

const calidadNave = (nave: any, letraBackend: 'A' | 'B' | null) => {
  let puntos = 0

  const numero = numeroNave(nave)

  if (nave?.estado) {
    puntos += 2
  }

  if (nave?.modo) {
    puntos += 2
  }

  if (nave?.nombre) {
    puntos += 1
  }

  /*
   * Si ya existe una copia de la nave
   * en la zona nueva correcta, esa
   * representación tiene prioridad.
   */
  if (numero !== null) {
    const letraEsperada = numero % 2 !== 0 ? 'A' : 'B'

    if (letraBackend === letraEsperada) {
      puntos += 10
    }
  }

  return puntos
}

const navesFuente = computed(() => {
  const mapa = new Map<number, any>()

  for (const zona of zonas.value) {
    const letraBackend = obtenerLetraZona(zona)

    const elementos = Array.isArray((zona as any)?.invernaderos) ? (zona as any).invernaderos : []

    for (const elemento of elementos) {
      const numero = numeroNave(elemento)

      if (numero === null) {
        continue
      }

      const nave = {
        ...elemento,

        __numero_nave: numero,

        __zona_backend_id: zona.id,

        __zona_backend_nombre: zona.nombre,

        __zona_backend_letra: letraBackend,
      }

      const existente = mapa.get(numero)

      if (!existente) {
        mapa.set(numero, nave)

        continue
      }

      const calidadExistente = calidadNave(existente, existente.__zona_backend_letra)

      const calidadNueva = calidadNave(nave, letraBackend)

      if (calidadNueva > calidadExistente) {
        mapa.set(numero, nave)
      }
    }
  }

  return Array.from(mapa.values()).sort((a, b) => Number(a.__numero_nave) - Number(b.__numero_nave))
})

const naves = computed(() => {
  const letra = zonaActualLetra.value

  if (!letra) {
    return []
  }

  return navesFuente.value
    .filter((nave) => {
      const numero = Number(nave.__numero_nave)

      if (letra === 'A') {
        return numero % 2 !== 0
      }

      return numero % 2 === 0
    })
    .sort((a, b) => Number(a.__numero_nave) - Number(b.__numero_nave))
})

const nombreNave = (nave: any) => {
  const numero = Number(nave?.__numero_nave ?? numeroNave(nave))

  if (Number.isFinite(numero) && numero >= NAVE_MIN && numero <= NAVE_MAX) {
    return `Nave ${numero}`
  }

  return 'Nave sin identificar'
}

const cantidadAbiertos = computed(() => {
  return naves.value.filter((nave) => normalizarTexto(nave.estado) === 'abierto').length
})

const cantidadMovimiento = computed(() => {
  return naves.value.filter((nave) => normalizarTexto(nave.estado) === 'en_movimiento').length
})

const cantidadCerrados = computed(() => {
  return naves.value.filter((nave) => normalizarTexto(nave.estado) === 'cerrado').length
})

const resumenEstado = computed(() => [
  {
    label: 'Total naves',

    value: naves.value.length,

    icon: 'mdi-greenhouse',

    color: 'primary',

    rotating: false,
  },

  {
    label: 'Abiertas',

    value: cantidadAbiertos.value,

    icon: 'mdi-arrow-up-circle-outline',

    color: 'success',

    rotating: false,
  },

  {
    label: 'Cerradas',

    value: cantidadCerrados.value,

    icon: 'mdi-arrow-down-circle-outline',

    color: 'error',

    rotating: false,
  },

  {
    label: 'En movimiento',

    value: cantidadMovimiento.value,

    icon: 'mdi-cog-outline',

    color: 'warning',

    rotating: true,
  },
])

const estadoGeneralZona = computed(() => {
  if (naves.value.length === 0) {
    return {
      texto: 'Sin datos',

      color: 'grey',
    }
  }

  if (cantidadMovimiento.value > 0) {
    return {
      texto: `${cantidadMovimiento.value} en movimiento`,

      color: 'warning',
    }
  }

  return {
    texto: 'Operación estable',

    color: 'success',
  }
})

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje

  snackbar.color = color

  snackbar.visible = true
}

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

const colorEstado = (estado: string) => {
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
    return 'mdi-arrow-up-circle-outline'
  }

  if (valor === 'en_movimiento') {
    return 'mdi-cog-outline'
  }

  return 'mdi-arrow-down-circle-outline'
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

  if (valor === 'error') {
    return 'Error'
  }

  return estado || 'Desconocido'
}

const modoLabel = (modo: string) => {
  const valor = normalizarTexto(modo)

  if (valor === 'automatico') {
    return 'Automático'
  }

  if (valor === 'remoto') {
    return 'Remoto'
  }

  if (valor === 'local') {
    return 'Local'
  }

  return modo || 'Desconocido'
}

const modoColor = (modo: string) => {
  const valor = normalizarTexto(modo)

  if (valor === 'automatico') {
    return 'primary'
  }

  if (valor === 'remoto') {
    return 'info'
  }

  return 'warning'
}

const modoIcono = (modo: string) => {
  const valor = normalizarTexto(modo)

  if (valor === 'automatico') {
    return 'mdi-robot-outline'
  }

  if (valor === 'remoto') {
    return 'mdi-access-point'
  }

  return 'mdi-hand-back-right-outline'
}

const conteoModo = (modo: string) => {
  return naves.value.filter((nave) => normalizarTexto(nave.modo) === normalizarTexto(modo)).length
}

const pedirConfirmacion = (
  accion: 'abrir' | 'cerrar' | 'detener',

  nombre: string,

  callback: () => Promise<void>,
) => {
  modalConfirmar.accion = accion

  modalConfirmar.nombre = nombre

  modalConfirmar.callback = callback

  modalConfirmar.visible = true
}

const recargarZonaBackend = async (zonaBackendId: number | null | undefined) => {
  if (zonaBackendId) {
    try {
      await store.cargarEstadoZona(Number(zonaBackendId))

      return
    } catch (error) {
      console.error('Error recargando zona backend:', error)
    }
  }

  await cargarZona()
}

const enviarComando = (
  nave: any,

  accion: 'abrir' | 'cerrar' | 'detener',
) => {
  const naveId = Number(nave.id)

  pedirConfirmacion(accion, nombreNave(nave), async () => {
    procesandoId.value = naveId

    accionProcesando.value = accion

    try {
      /*
       * El comando utiliza el ID real
       * del equipo, no el ID virtual
       * de Zona A/B.
       */
      const res = await store.enviarComando(naveId, accion)

      if (res.ok) {
        mostrarSnackbar(`Comando '${accion}' enviado a ${nombreNave(nave)}`)

        await recargarZonaBackend(nave.__zona_backend_id)
      } else {
        mostrarSnackbar(res.mensaje ?? 'Error enviando comando', 'error')
      }
    } catch (error) {
      console.error('Error enviando comando:', error)

      mostrarSnackbar('Error enviando comando', 'error')
    } finally {
      procesandoId.value = null

      accionProcesando.value = null
    }
  })
}

const cambiarModo = async (
  nave: any,

  modo: 'local' | 'remoto' | 'automatico',
) => {
  const naveId = Number(nave.id)

  if (normalizarTexto(nave.modo) === normalizarTexto(modo)) {
    return
  }

  if (cambiandoModoId.value !== null) {
    return
  }

  cambiandoModoId.value = naveId

  try {
    const res = await store.cambiarModo(naveId, modo)

    if (res.ok) {
      mostrarSnackbar(`Modo de ${nombreNave(nave)} cambiado a ${modoLabel(modo)}`)

      await recargarZonaBackend(nave.__zona_backend_id)
    } else {
      mostrarSnackbar(res.mensaje ?? 'Error cambiando modo', 'error')
    }
  } catch (error) {
    console.error('Error cambiando modo:', error)

    mostrarSnackbar('Error cambiando modo', 'error')
  } finally {
    cambiandoModoId.value = null
  }
}

const ejecutarAccion = async () => {
  const callback = modalConfirmar.callback

  modalConfirmar.visible = false

  if (!callback) {
    return
  }

  try {
    await callback()
  } finally {
    modalConfirmar.callback = null
  }
}

const cargarTodasLasZonas = async () => {
  const zonasBackend = [...zonas.value]

  if (zonasBackend.length === 0) {
    return
  }

  /*
   * Temporalmente cargamos el estado
   * de TODAS las zonas porque una nave
   * que conceptualmente pertenece a
   * Zona A/B puede seguir asociada
   * a C/D en la base de datos.
   */
  await Promise.allSettled(zonasBackend.map((zona: any) => store.cargarEstadoZona(Number(zona.id))))
}

const cargarZona = async () => {
  if (actualizando.value) {
    return
  }

  actualizando.value = true

  try {
    if (zonas.value.length === 0) {
      await store.cargarZonas()
    }

    await cargarTodasLasZonas()
  } catch (error) {
    console.error('Error cargando zona:', error)

    mostrarSnackbar('Error cargando la zona', 'error')
  } finally {
    actualizando.value = false
  }
}

const suscribirseAZonas = () => {
  /*
   * Escuchamos temporalmente todas
   * las zonas para no perder eventos
   * provenientes de C/D mientras la
   * BD aún no esté migrada.
   */
  for (const zona of zonas.value) {
    unirseAZona(Number(zona.id))
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando zona...')

  try {
    await cargarZona()

    suscribirseAZonas()

    escuchar('estado-actualizado', async (data: any) => {
      const zonaBackendId = Number(data?.zona_id)

      if (Number.isFinite(zonaBackendId) && zonaBackendId > 0) {
        try {
          await store.cargarEstadoZona(zonaBackendId)

          return
        } catch (error) {
          console.error('Error actualizando estado por socket:', error)
        }
      }

      await cargarZona()
    })

    escuchar('comando-enviado', async (data: any) => {
      if (data?.resultado === 'exitoso') {
        mostrarSnackbar('Estado de la nave actualizado')
      }

      const zonaBackendId = Number(data?.zona_id)

      if (Number.isFinite(zonaBackendId) && zonaBackendId > 0) {
        try {
          await store.cargarEstadoZona(zonaBackendId)

          return
        } catch (error) {
          console.error('Error actualizando comando por socket:', error)
        }
      }

      await cargarZona()
    })
  } finally {
    loadingStore.ocultar()
  }
})

onUnmounted(() => {
  dejarDeEscuchar('estado-actualizado')

  dejarDeEscuchar('comando-enviado')
})
</script>

<style scoped>
.zona-page {
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
  gap: 11px;
}

.back-btn {
  flex-shrink: 0;
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

  font-size: 0.82rem;

  color: rgba(var(--v-theme-on-surface), 0.56);
}

.zone-status-chip {
  font-weight: 600;
}

.zone-status-dot {
  width: 7px;
  height: 7px;

  margin-right: 7px;

  border-radius: 50%;
}

.zone-status-dot--success {
  background: rgb(var(--v-theme-success));
}

.zone-status-dot--warning {
  background: rgb(var(--v-theme-warning));

  animation: statusPulse 1.5s ease-in-out infinite;
}

.zone-status-dot--grey {
  background: rgba(var(--v-theme-on-surface), 0.35);
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.distribution-card {
  min-height: 66px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 11px 16px;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  background: rgba(var(--v-theme-primary), 0.022);
}

.distribution-card__main {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 10px;
}

.distribution-card__icon {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.distribution-card__icon--a {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.distribution-card__icon--b {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.distribution-card__content {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.distribution-card__content span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.distribution-card__content strong {
  margin-top: 3px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.8rem;
  font-weight: 650;
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

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
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

.modes-overview {
  min-height: 78px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 30px;

  padding: 14px 18px;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.modes-overview__title {
  display: flex;
  align-items: center;

  gap: 10px;
}

.modes-overview__icon {
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

.modes-overview__title > div:last-child {
  display: flex;
  flex-direction: column;
}

.modes-overview__title strong {
  font-size: 0.8rem;
  font-weight: 700;
}

.modes-overview__title span {
  margin-top: 2px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.modes-overview__items {
  display: flex;
  align-items: center;

  gap: 30px;
}

.mode-summary {
  display: flex;
  align-items: center;

  gap: 8px;
}

.mode-summary__icon {
  width: 34px;
  height: 34px;

  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.mode-summary__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.mode-summary__icon--info {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.mode-summary__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.mode-summary > div:last-child {
  display: flex;
  flex-direction: column;
}

.mode-summary strong {
  font-size: 0.84rem;
  font-weight: 700;
}

.mode-summary span {
  margin-top: 1px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.section-header {
  min-height: 60px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
}

.section-header__main {
  display: flex;
  align-items: center;

  gap: 10px;
}

.section-header__icon {
  width: 37px;
  height: 37px;

  flex: 0 0 37px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.08);
}

.section-header h2 {
  margin: 0;

  font-size: 0.92rem;
  font-weight: 700;
}

.section-header p {
  margin: 2px 0 0;

  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.greenhouse-card {
  position: relative;

  height: 100%;

  padding: 16px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  background: rgb(var(--v-theme-surface));

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.greenhouse-card:hover {
  transform: translateY(-2px);

  border-color: rgba(var(--v-theme-primary), 0.2);

  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.05) !important;
}

.greenhouse-card--warning {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-warning), 0.035),
    rgb(var(--v-theme-surface)) 45%
  );
}

.greenhouse-card__accent {
  position: absolute;

  top: 18px;
  bottom: 18px;
  left: 0;

  width: 3px;

  border-radius: 0 4px 4px 0;
}

.greenhouse-card__accent--success {
  background: rgb(var(--v-theme-success));
}

.greenhouse-card__accent--warning {
  background: rgb(var(--v-theme-warning));
}

.greenhouse-card__accent--error {
  background: rgb(var(--v-theme-error));
}

.greenhouse-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.greenhouse-identity {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 9px;
}

.greenhouse-identity__icon {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.greenhouse-identity__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.greenhouse-identity__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.greenhouse-identity__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.greenhouse-identity__text {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.greenhouse-identity__text strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.84rem;
  font-weight: 700;
}

.greenhouse-identity__text span {
  margin-top: 2px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.46);
}

.state-chip {
  flex-shrink: 0;

  font-size: 0.7rem;
  font-weight: 600;
}

.status-panel {
  display: flex;
  align-items: center;

  margin-top: 16px;

  padding: 11px 10px;

  border-radius: 11px;

  background: rgba(var(--v-theme-on-surface), 0.03);
}

.status-panel__item {
  flex: 1;
  min-width: 0;

  text-align: center;
}

.status-panel__item span {
  display: block;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.46);
}

.status-panel__item strong {
  display: block;

  margin-top: 3px;

  font-size: 0.76rem;
  font-weight: 700;
}

.status-panel__divider {
  width: 1px;
  height: 26px;

  background: rgba(var(--v-theme-on-surface), 0.09);
}

.mode-section {
  margin-top: 16px;
}

.mode-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 10px;

  margin-bottom: 8px;
}

.field-label {
  display: block;

  font-size: 0.74rem;
  font-weight: 650;
}

.mode-section__header p {
  margin: 2px 0 0;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.46);
}

.mode-chip {
  font-size: 0.7rem;
}

.mode-select :deep(.v-field__input) {
  font-size: 0.8rem;
}

.local-warning,
.remote-status {
  min-height: 60px;

  display: flex;
  align-items: center;

  gap: 9px;

  margin-top: 12px;

  padding: 9px 10px;

  border-radius: 11px;
}

.local-warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.07);
}

.local-warning__icon {
  width: 31px;
  height: 31px;

  flex: 0 0 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: rgba(var(--v-theme-warning), 0.1);
}

.local-warning > div:last-child,
.remote-status__left > div {
  display: flex;
  flex-direction: column;
}

.local-warning strong,
.remote-status strong {
  font-size: 0.72rem;
  font-weight: 650;
}

.local-warning span,
.remote-status span {
  margin-top: 2px;

  font-size: 0.68rem;
  line-height: 1.4;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.remote-status {
  justify-content: space-between;

  background: rgba(var(--v-theme-success), 0.045);
}

.remote-status__left {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 8px;
}

.remote-dot {
  width: 7px;
  height: 7px;

  flex: 0 0 7px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));

  animation: statusPulse 1.8s ease-in-out infinite;
}

.greenhouse-actions {
  display: grid;

  grid-template-columns:
    1fr
    1fr
    42px;

  gap: 7px;

  margin-top: 15px;

  padding-top: 14px;

  border-top: 1px solid rgba(var(--v-border-color), 0.45);
}

.snackbar-content {
  display: flex;
  align-items: center;

  gap: 8px;
}

.empty-state {
  min-height: 350px;

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

  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;

  font-size: 0.94rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 430px;

  margin: 6px 0 18px;

  font-size: 0.76rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.greenhouse-skeleton {
  min-height: 330px;

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
    opacity: 0.45;
  }
}

@media (max-width: 959px) {
  .page-header {
    align-items: flex-start;
  }

  .page-header__actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .modes-overview {
    align-items: flex-start;
  }

  .modes-overview__items {
    gap: 18px;
  }
}

@media (max-width: 700px) {
  .zona-page {
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;

    gap: 14px;
  }

  .page-header__main {
    width: 100%;

    align-items: flex-start;
  }

  .page-header__icon {
    width: 42px;
    height: 42px;

    flex-basis: 42px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .page-subtitle {
    font-size: 0.78rem;
  }

  .page-header__actions {
    width: 100%;

    display: grid;

    grid-template-columns:
      1fr
      1fr
      1fr;
  }

  .page-header__actions > *,
  .page-header__actions .v-btn {
    width: 100%;
  }

  .distribution-card {
    align-items: flex-start;
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
    font-size: 0.7rem;
  }

  .modes-overview {
    flex-direction: column;

    gap: 14px;
  }

  .modes-overview__items {
    width: 100%;

    justify-content: space-between;
  }

  .section-header p {
    display: none;
  }

  .greenhouse-card {
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .back-btn {
    width: 36px;
    height: 36px;
  }

  .page-header__icon {
    display: none;
  }

  .zone-status-chip {
    margin-top: 3px;
  }

  .page-header__actions {
    grid-template-columns:
      1fr
      1fr;
  }

  .page-header__actions > :first-child {
    grid-column: 1 / -1;
  }

  .distribution-card > .v-chip {
    display: none;
  }

  .distribution-card__content strong {
    font-size: 0.72rem;
  }

  .modes-overview__items {
    gap: 8px;
  }

  .mode-summary {
    flex: 1;

    flex-direction: column;
    align-items: flex-start;

    gap: 5px;
  }

  .mode-summary__icon {
    width: 31px;
    height: 31px;
  }

  .greenhouse-card__header {
    align-items: flex-start;
  }

  .greenhouse-identity__text strong {
    max-width: 135px;
  }

  .greenhouse-actions {
    grid-template-columns:
      1fr
      1fr
      40px;
  }
}
</style>