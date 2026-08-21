<template>
  <v-dialog v-model="visible" max-width="460" persistent>
    <v-card rounded="xl" elevation="12" class="confirm-dialog">
      <div class="dialog-header">
        <div class="action-icon" :class="`action-icon--${accionInfo.color}`">
          <v-icon size="30">
            {{ accionInfo.icono }}
          </v-icon>

          <span v-if="esAccionZona" class="action-icon__badge">
            <v-icon size="12"> mdi-format-list-bulleted </v-icon>
          </span>
        </div>

        <div class="dialog-header__content">
          <div class="d-flex align-center flex-wrap ga-2">
            <span class="dialog-eyebrow"> Confirmación requerida </span>

            <v-chip v-if="esAccionZona" color="warning" variant="tonal" size="x-small">
              Acción masiva
            </v-chip>
          </div>

          <h2>
            {{ accionInfo.titulo }}
          </h2>

          <p>
            {{ accionInfo.descripcion }}
          </p>
        </div>

        <v-btn icon size="small" variant="text" :disabled="cargando" @click="cancelar">
          <v-icon size="19"> mdi-close </v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="dialog-content">
        <div v-if="nombre" class="target-card">
          <div class="target-card__icon" :class="`target-card__icon--${accionInfo.color}`">
            <v-icon size="21">
              {{ esAccionZona ? 'mdi-greenhouse-variant' : 'mdi-greenhouse' }}
            </v-icon>
          </div>

          <div class="target-card__content">
            <span>
              {{ esAccionZona ? 'Zona seleccionada' : 'Galpón seleccionado' }}
            </span>

            <strong>
              {{ nombre }}
            </strong>
          </div>

          <v-chip :color="accionInfo.color" variant="tonal" size="small">
            {{ accionInfo.accionLabel }}
          </v-chip>
        </div>

        <div class="confirmation-message">
          <v-icon size="19" :color="accionInfo.color"> mdi-help-circle-outline </v-icon>

          <p>
            {{ accionInfo.mensaje }}
          </p>
        </div>

        <div v-if="esAccionZona" class="mass-action-warning">
          <div class="mass-action-warning__icon">
            <v-icon size="19"> mdi-alert-outline </v-icon>
          </div>

          <div>
            <strong> Esta acción afecta a toda la zona </strong>

            <span>
              El comando será enviado a todos los galpones disponibles que puedan recibir órdenes
              remotas.
            </span>
          </div>
        </div>

        <div v-else-if="accion === 'detener'" class="stop-warning">
          <div class="stop-warning__icon">
            <v-icon size="19"> mdi-information-outline </v-icon>
          </div>

          <span>
            Utiliza esta acción cuando necesites detener inmediatamente el movimiento actual del
            galpón.
          </span>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="dialog-actions">
        <v-btn variant="text" rounded="lg" :disabled="cargando" @click="cancelar"> Cancelar </v-btn>

        <v-spacer />

        <v-btn
          :color="accionInfo.color"
          variant="tonal"
          rounded="lg"
          :prepend-icon="accionInfo.iconoBoton"
          :loading="cargando"
          @click="confirmar"
        >
          {{ accionInfo.boton }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type AccionConfirmacion = 'abrir' | 'cerrar' | 'detener' | 'zona-abrir' | 'zona-cerrar'

const props = defineProps<{
  modelValue: boolean
  accion: AccionConfirmacion
  nombre?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void

  (e: 'confirmar'): void

  (e: 'cancelar'): void
}>()

const cargando = ref(false)

const visible = computed({
  get: () => props.modelValue,

  set: (valor: boolean) => {
    emit('update:modelValue', valor)
  },
})

const esAccionZona = computed(() => {
  return props.accion === 'zona-abrir' || props.accion === 'zona-cerrar'
})

const accionInfo = computed(() => {
  if (props.accion === 'abrir') {
    return {
      color: 'success',
      icono: 'mdi-arrow-up-circle-outline',
      iconoBoton: 'mdi-arrow-up',
      titulo: 'Confirmar apertura',
      descripcion: 'Estás a punto de enviar una orden de apertura.',
      mensaje: '¿Deseas abrir este galpón?',
      boton: 'Abrir galpón',
      accionLabel: 'Abrir',
    }
  }

  if (props.accion === 'cerrar') {
    return {
      color: 'error',
      icono: 'mdi-arrow-down-circle-outline',
      iconoBoton: 'mdi-arrow-down',
      titulo: 'Confirmar cierre',
      descripcion: 'Estás a punto de enviar una orden de cierre.',
      mensaje: '¿Deseas cerrar este galpón?',
      boton: 'Cerrar galpón',
      accionLabel: 'Cerrar',
    }
  }

  if (props.accion === 'detener') {
    return {
      color: 'warning',
      icono: 'mdi-stop-circle-outline',
      iconoBoton: 'mdi-stop',
      titulo: 'Detener movimiento',
      descripcion: 'Esta acción detendrá el movimiento actual del galpón.',
      mensaje: '¿Deseas detener este galpón?',
      boton: 'Detener',
      accionLabel: 'Detener',
    }
  }

  if (props.accion === 'zona-abrir') {
    return {
      color: 'success',
      icono: 'mdi-arrow-up-bold-circle-outline',
      iconoBoton: 'mdi-arrow-up',
      titulo: 'Abrir zona completa',
      descripcion: 'Se enviará una orden de apertura masiva.',
      mensaje: '¿Deseas abrir todos los galpones de esta zona?',
      boton: 'Abrir toda la zona',
      accionLabel: 'Abrir todo',
    }
  }

  return {
    color: 'error',
    icono: 'mdi-arrow-down-bold-circle-outline',
    iconoBoton: 'mdi-arrow-down',
    titulo: 'Cerrar zona completa',
    descripcion: 'Se enviará una orden de cierre masiva.',
    mensaje: '¿Deseas cerrar todos los galpones de esta zona?',
    boton: 'Cerrar toda la zona',
    accionLabel: 'Cerrar todo',
  }
})

const confirmar = () => {
  if (cargando.value) {
    return
  }

  cargando.value = true

  emit('confirmar')

  visible.value = false
}

const cancelar = () => {
  if (cargando.value) {
    return
  }

  emit('cancelar')
  visible.value = false
}

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      cargando.value = false
    }
  },
)
</script>

<style scoped>
.confirm-dialog {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  padding: 18px 18px 16px;
}

.action-icon {
  position: relative;

  width: 52px;
  height: 52px;

  flex: 0 0 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;
}

.action-icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.1);
}

.action-icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.action-icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.11);
}

.action-icon__badge {
  position: absolute;

  right: -3px;
  bottom: -3px;

  width: 22px;
  height: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 3px solid rgb(var(--v-theme-surface));

  border-radius: 50%;

  color: rgb(var(--v-theme-on-primary));

  background: rgb(var(--v-theme-primary));
}

.dialog-header__content {
  min-width: 0;
  flex: 1;
}

.dialog-eyebrow {
  font-size: 0.72rem;
  font-weight: 650;

  text-transform: uppercase;
  letter-spacing: 0.05em;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.dialog-header h2 {
  margin: 4px 0 0;

  font-size: 1.05rem;
  font-weight: 750;

  line-height: 1.25;
}

.dialog-header p {
  margin: 5px 0 0;

  font-size: 0.78rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.55);
}

.dialog-content {
  padding: 18px !important;
}

.target-card {
  display: flex;
  align-items: center;

  gap: 10px;

  min-height: 64px;

  padding: 10px 11px;

  border: 1px solid rgba(var(--v-border-color), 0.5);

  border-radius: 12px;

  background: rgba(var(--v-theme-on-surface), 0.018);
}

.target-card__icon {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.target-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.target-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.target-card__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.target-card__content {
  min-width: 0;
  flex: 1;

  display: flex;
  flex-direction: column;
}

.target-card__content span {
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.target-card__content strong {
  margin-top: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.82rem;
  font-weight: 700;
}

.confirmation-message {
  display: flex;
  align-items: flex-start;

  gap: 8px;

  margin-top: 16px;

  padding: 2px 1px;
}

.confirmation-message p {
  margin: 0;

  font-size: 0.82rem;
  font-weight: 550;

  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.72);
}

.mass-action-warning {
  display: flex;
  align-items: flex-start;

  gap: 9px;

  margin-top: 15px;

  padding: 11px 12px;

  border: 1px solid rgba(var(--v-theme-warning), 0.12);

  border-radius: 11px;

  background: rgba(var(--v-theme-warning), 0.055);
}

.mass-action-warning__icon {
  width: 32px;
  height: 32px;

  flex: 0 0 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.mass-action-warning > div:last-child {
  display: flex;
  flex-direction: column;
}

.mass-action-warning strong {
  font-size: 0.76rem;
  font-weight: 650;
}

.mass-action-warning span {
  margin-top: 3px;

  font-size: 0.72rem;
  line-height: 1.45;

  color: rgba(var(--v-theme-on-surface), 0.55);
}

.stop-warning {
  display: flex;
  align-items: flex-start;

  gap: 8px;

  margin-top: 15px;

  padding: 10px 11px;

  border-radius: 11px;

  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.055);
}

.stop-warning span {
  font-size: 0.72rem;
  line-height: 1.45;

  color: rgba(var(--v-theme-on-surface), 0.56);
}

.dialog-actions {
  min-height: 66px;

  padding: 11px 18px !important;
}

.dialog-actions .v-btn {
  min-width: 120px;

  font-size: 0.8rem;
  font-weight: 650;

  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 480px) {
  .dialog-header {
    padding: 15px;
  }

  .action-icon {
    width: 45px;
    height: 45px;

    flex-basis: 45px;
  }

  .action-icon .v-icon {
    font-size: 26px !important;
  }

  .dialog-header h2 {
    font-size: 0.98rem;
  }

  .dialog-header p {
    font-size: 0.75rem;
  }

  .dialog-content {
    padding: 15px !important;
  }

  .target-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .target-card > .v-chip {
    margin-left: 48px;
  }

  .dialog-actions {
    display: grid !important;
    grid-template-columns:
      1fr
      1fr;

    gap: 8px;

    padding: 11px 15px !important;
  }

  .dialog-actions .v-spacer {
    display: none;
  }

  .dialog-actions .v-btn {
    width: 100%;
    min-width: 0;
  }
}
</style>