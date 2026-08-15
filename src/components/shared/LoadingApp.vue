<template>
  <v-overlay
    :model-value="visible"
    class="d-flex align-center justify-center"
    persistent
    z-index="9999"
  >
    <div class="text-center">
      <img
        src="/logo_malima_icono.png"
        height="64"
        style="object-fit: contain"
        class="mb-4 pulsing"
      />
      <v-progress-linear
        color="primary"
        indeterminate
        rounded
        height="4"
        style="width: 200px"
        class="mb-3"
      />
      <p class="text-body-2 text-white">{{ mensaje ?? 'Cargando...' }}</p>
    </div>
  </v-overlay>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  mensaje?: string
}>()
</script>