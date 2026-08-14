<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Mi perfil</h1>
        <p class="text-body-2 text-medium-emphasis">Actualiza tu información personal</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <!-- Datos personales -->
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center gap-2 pa-4">
            <v-icon color="primary">mdi-account</v-icon>
            <span class="text-body-1 font-weight-bold">Datos personales</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-text-field
              v-model="perfil.nombre"
              label="Nombre"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              class="mb-3"
            />
            <v-text-field
              v-model="perfil.email"
              label="Correo electrónico"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
            />
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              color="primary"
              variant="tonal"
              :loading="guardandoPerfil"
              @click="guardarPerfil"
            >
              Guardar cambios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Cambiar contraseña -->
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center gap-2 pa-4">
            <v-icon color="primary">mdi-lock</v-icon>
            <span class="text-body-1 font-weight-bold">Cambiar contraseña</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-text-field
              v-model="passwords.actual"
              label="Contraseña actual"
              :type="mostrar.actual ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrar.actual ? 'mdi-eye-off' : 'mdi-eye'"
              class="mb-3"
              @click:append-inner="mostrar.actual = !mostrar.actual"
            />
            <v-text-field
              v-model="passwords.nuevo"
              label="Nueva contraseña"
              :type="mostrar.nuevo ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrar.nuevo ? 'mdi-eye-off' : 'mdi-eye'"
              class="mb-3"
              @click:append-inner="mostrar.nuevo = !mostrar.nuevo"
            />
            <v-text-field
              v-model="passwords.confirmar"
              label="Confirmar nueva contraseña"
              :type="mostrar.confirmar ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrar.confirmar ? 'mdi-eye-off' : 'mdi-eye'"
              :error-messages="errorConfirmar"
              @click:append-inner="mostrar.confirmar = !mostrar.confirmar"
            />
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              color="primary"
              variant="tonal"
              :loading="guardandoPassword"
              @click="cambiarPassword"
            >
              Cambiar contraseña
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000">
      {{ snackbar.mensaje }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const authStore = useAuthStore()

const perfil = reactive({ nombre: '', email: '' })
const passwords = reactive({ actual: '', nuevo: '', confirmar: '' })
const mostrar = reactive({ actual: false, nuevo: false, confirmar: false })
const guardandoPerfil = ref(false)
const guardandoPassword = ref(false)
const snackbar = reactive({ visible: false, mensaje: '', color: 'success' })

const errorConfirmar = computed(() =>
  passwords.confirmar && passwords.nuevo !== passwords.confirmar
    ? 'Las contraseñas no coinciden'
    : '',
)

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.visible = true
}

const guardarPerfil = async () => {
  guardandoPerfil.value = true
  try {
    const { data } = await api.patch('/usuarios/perfil', {
      nombre: perfil.nombre,
      email: perfil.email,
    })
    if (data.ok) {
      mostrarSnackbar('Perfil actualizado correctamente')
      await authStore.cargarUsuario()
    } else {
      mostrarSnackbar(data.mensaje ?? 'Error', 'error')
    }
  } catch {
    mostrarSnackbar('Error actualizando perfil', 'error')
  } finally {
    guardandoPerfil.value = false
  }
}

const cambiarPassword = async () => {
  if (passwords.nuevo !== passwords.confirmar) return
  guardandoPassword.value = true
  try {
    const { data } = await api.patch('/usuarios/cambiar-password', {
      password_actual: passwords.actual,
      password_nuevo: passwords.nuevo,
    })
    if (data.ok) {
      mostrarSnackbar('Contraseña actualizada correctamente')
      passwords.actual = ''
      passwords.nuevo = ''
      passwords.confirmar = ''
    } else {
      mostrarSnackbar(data.mensaje ?? 'Error', 'error')
    }
  } catch {
    mostrarSnackbar('Error cambiando contraseña', 'error')
  } finally {
    guardandoPassword.value = false
  }
}

onMounted(() => {
  perfil.nombre = authStore.usuario?.nombre ?? ''
  perfil.email = authStore.usuario?.email ?? ''
})
</script>
