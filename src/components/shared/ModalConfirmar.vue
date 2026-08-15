<template>
  <v-dialog v-model="visible" max-width="420" persistent>
    <v-card rounded="lg">
      <!-- Header con color según acción -->
      <div
        class="pa-6 text-center"
        :style="`background: linear-gradient(135deg, ${gradiente.from}, ${gradiente.to}); border-radius: 12px 12px 0 0`"
      >
        <v-icon size="56" color="white" class="mb-2">{{ iconoAccion }}</v-icon>
        <h2 class="text-h6 font-weight-bold text-white">{{ titulo }}</h2>
      </div>

      <v-card-text class="pa-6 text-center">
        <p class="text-body-1 mb-2">{{ mensaje }}</p>
        <v-chip
          v-if="nombre"
          :color="colorAccion"
          variant="tonal"
          size="small"
          prepend-icon="mdi-greenhouse"
        >
          {{ nombre }}
        </v-chip>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 d-flex gap-2">
        <v-btn
          variant="outlined"
          color="grey"
          prepend-icon="mdi-close"
          flex
          style="flex: 1"
          @click="cancelar"
        >
          Cancelar
        </v-btn>
        <v-btn
          :color="colorAccion"
          variant="elevated"
          :prepend-icon="iconoAccion"
          :loading="cargando"
          style="flex: 1"
          @click="confirmar"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
  accion: 'abrir' | 'cerrar' | 'detener' | 'zona-abrir' | 'zona-cerrar'
  nombre?: string
}>()

const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])
const cargando = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const colorAccion = computed(() => {
  if (props.accion === 'abrir' || props.accion === 'zona-abrir') return 'success'
  if (props.accion === 'cerrar' || props.accion === 'zona-cerrar') return 'error'
  return 'warning'
})

const gradiente = computed(() => {
  if (props.accion === 'abrir' || props.accion === 'zona-abrir')
    return { from: '#2E7D32', to: '#66BB6A' }
  if (props.accion === 'cerrar' || props.accion === 'zona-cerrar')
    return { from: '#C62828', to: '#EF5350' }
  return { from: '#E65100', to: '#FFA726' }
})

const iconoAccion = computed(() => {
  if (props.accion === 'abrir' || props.accion === 'zona-abrir') return 'mdi-arrow-up-circle'
  if (props.accion === 'cerrar' || props.accion === 'zona-cerrar') return 'mdi-arrow-down-circle'
  return 'mdi-stop-circle'
})

const titulo = computed(() => {
  if (props.accion === 'abrir') return 'Confirmar apertura'
  if (props.accion === 'cerrar') return 'Confirmar cierre'
  if (props.accion === 'detener') return 'Confirmar detención'
  if (props.accion === 'zona-abrir') return 'Abrir zona completa'
  return 'Cerrar zona completa'
})

const mensaje = computed(() => {
  if (props.accion === 'abrir') return '¿Estás seguro que deseas abrir este invernadero?'
  if (props.accion === 'cerrar') return '¿Estás seguro que deseas cerrar este invernadero?'
  if (props.accion === 'detener') return '¿Estás seguro que deseas detener este invernadero?'
  if (props.accion === 'zona-abrir')
    return '¿Estás seguro que deseas abrir todos los invernaderos de esta zona?'
  return '¿Estás seguro que deseas cerrar todos los invernaderos de esta zona?'
})

const confirmar = async () => {
  cargando.value = true
  emit('confirmar')
  cargando.value = false
  visible.value = false
}

const cancelar = () => {
  emit('cancelar')
  visible.value = false
}
</script>