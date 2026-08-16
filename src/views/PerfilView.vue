<template>
  <v-container fluid class="pa-4" style="max-width: 1200px">
    <v-row class="mb-2">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Mi perfil</h1>
        <p class="text-body-2 text-medium-emphasis">Actualiza tu información personal</p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Columna Izquierda: Foto de Perfil -->
      <!-- Columna Izquierda: Foto de Perfil -->
      <v-col cols="12" md="4" lg="3">
        <v-card rounded="lg" elevation="2" class="text-center overflow-hidden">
          <!-- Fondo degradado superior -->
          <div class="perfil-banner" />

          <!-- Avatar centrado sobre el banner -->
          <div class="perfil-avatar-wrap">
            <div class="avatar-container" @click="triggerFileInput">
              <v-avatar size="90" color="primary" class="avatar-ring">
                <img
                  v-if="avatarUrl"
                  :src="avatarUrl"
                  style="object-fit: cover; width: 100%; height: 100%"
                />
                <span v-else class="text-h4 text-white font-weight-bold">{{ iniciales }}</span>
              </v-avatar>
              <div class="avatar-overlay">
                <v-icon color="white" size="22">mdi-camera</v-icon>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="subirAvatar"
              />
            </div>
          </div>

          <!-- Info -->
          <div class="px-4 pb-4 pt-2">
            <h2 class="text-subtitle-1 font-weight-bold mb-0">{{ perfil.nombre || 'Usuario' }}</h2>
            <v-chip size="x-small" color="primary" variant="tonal" class="mt-1 mb-2">
              {{ authStore.usuario?.rol }}
            </v-chip>
            <p class="text-caption text-medium-emphasis">{{ perfil.email }}</p>

            <v-divider class="my-3" />

            <div class="d-flex align-center justify-center gap-1 text-caption text-medium-emphasis">
              <span>Clic en la foto para cambiarla</span>
            </div>
            <p class="text-caption text-medium-emphasis mt-1"><strong>Máximo 2MB</strong></p>

            <v-progress-linear
              v-if="subiendoAvatar"
              indeterminate
              color="primary"
              rounded
              height="3"
              class="mt-3"
            />
          </div>
        </v-card>
      </v-col>

      <!-- Columna Derecha: Formularios -->
      <v-col cols="12" md="8" lg="9">
        <v-row>
          <!-- Datos personales -->
          <v-col cols="12" md="6">
            <v-card rounded="lg" elevation="2" class="h-100 d-flex flex-column">
              <v-card-title class="d-flex align-center gap-2 pa-4">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <span class="text-body-1 font-weight-bold">Datos personales</span>
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-4 flex-grow-1">
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
              <v-card-actions class="pa-4 pt-0 mt-auto">
                <v-spacer />
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

          <!-- Cambiar contraseña -->
          <v-col cols="12" md="6">
            <v-card rounded="lg" elevation="2" class="h-100 d-flex flex-column">
              <v-card-title class="d-flex align-center gap-2 pa-4">
                <v-icon color="primary" class="mr-2">mdi-lock</v-icon>
                <span class="text-body-1 font-weight-bold">Cambiar contraseña</span>
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-4 flex-grow-1">
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
              <v-card-actions class="pa-4 pt-0 mt-auto">
                <v-spacer />
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
import { useLoadingStore } from '../stores/loading'
import { supabase } from '../lib/supabase'
import api from '../api/axios'

const authStore = useAuthStore()
const loadingStore = useLoadingStore()

const perfil = reactive({ nombre: '', email: '' })
const passwords = reactive({ actual: '', nuevo: '', confirmar: '' })
const mostrar = reactive({ actual: false, nuevo: false, confirmar: false })

const guardandoPerfil = ref(false)
const guardandoPassword = ref(false)
const subiendoAvatar = ref(false)

const avatarUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const snackbar = reactive({ visible: false, mensaje: '', color: 'success' })

const iniciales = computed(() => {
  const nombre = authStore.usuario?.nombre ?? ''
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

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

const triggerFileInput = () => fileInput.value?.click()

const subirAvatar = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    mostrarSnackbar('La imagen no puede superar 2MB', 'error')
    return
  }

  subiendoAvatar.value = true
  try {
    const userId = authStore.usuario?.id
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`

    await api.patch('/usuarios/perfil', { avatar_url: url })
    avatarUrl.value = url

    mostrarSnackbar('Foto actualizada correctamente')
  } catch {
    mostrarSnackbar('Error subiendo la imagen', 'error')
  } finally {
    subiendoAvatar.value = false
  }
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

onMounted(async () => {
  loadingStore.mostrar('Cargando perfil...')
  await authStore.cargarUsuario()

  perfil.nombre = authStore.usuario?.nombre ?? ''
  perfil.email = authStore.usuario?.email ?? ''

  const { data } = await api.get('/auth/me')
  if (data.ok && data.data.avatar_url) {
    avatarUrl.value = data.data.avatar_url
  }
  loadingStore.ocultar()
})
</script>

<style scoped>
.perfil-banner {
  height: 72px;
  background: linear-gradient(135deg, #0d2461 0%, #1a3a8f 60%, #2952c4 100%);
}

.perfil-avatar-wrap {
  display: flex;
  justify-content: center;
  margin-top: -45px;
  margin-bottom: 8px;
}

.avatar-ring {
  border: 3px solid white;
  box-shadow: 0 4px 14px rgba(26, 58, 143, 0.25);
}

.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}
</style>
