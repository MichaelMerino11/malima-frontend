<template>
  <v-container fluid class="profile-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-account-circle-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Mi perfil</h1>

            <v-chip
              v-if="perfilModificado"
              color="warning"
              variant="tonal"
              size="small"
              class="pending-chip"
            >
              <v-icon start size="15"> mdi-content-save-alert-outline </v-icon>

              Cambios sin guardar
            </v-chip>
          </div>

          <p class="page-subtitle">
            Administra tu información personal, fotografía y seguridad de la cuenta
          </p>
        </div>
      </div>
    </div>

    <v-row>
      <v-col cols="12" lg="4" xl="3">
        <v-card rounded="xl" elevation="0" class="identity-card">
          <div class="profile-banner">
            <div class="profile-banner__decoration profile-banner__decoration--one" />
            <div class="profile-banner__decoration profile-banner__decoration--two" />
          </div>

          <div class="avatar-wrapper">
            <div
              class="avatar-container"
              :class="{
                'avatar-container--loading': subiendoAvatar,
              }"
              @click="triggerFileInput"
            >
              <v-avatar size="106" color="primary" class="profile-avatar">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Foto de perfil" class="avatar-image" />

                <span v-else class="avatar-initials">
                  {{ iniciales }}
                </span>
              </v-avatar>

              <div class="avatar-overlay">
                <v-icon v-if="!subiendoAvatar" color="white" size="24"> mdi-camera-outline </v-icon>

                <v-progress-circular v-else indeterminate color="white" size="28" width="3" />
              </div>

              <div class="camera-badge">
                <v-icon size="15" color="white"> mdi-camera </v-icon>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="d-none"
                @change="subirAvatar"
              />
            </div>
          </div>

          <div class="identity-content">
            <h2>
              {{ perfil.nombre || 'Usuario' }}
            </h2>

            <v-chip color="primary" variant="tonal" size="small" class="role-chip">
              <v-icon start size="14">
                {{ iconoRol }}
              </v-icon>

              {{ rolUsuario }}
            </v-chip>

            <div class="profile-email">
              <v-icon size="16"> mdi-email-outline </v-icon>

              <span>
                {{ perfil.email || 'Sin correo registrado' }}
              </span>
            </div>

            <v-divider class="my-5" />

            <div class="avatar-help">
              <div class="avatar-help__icon">
                <v-icon size="18"> mdi-image-outline </v-icon>
              </div>

              <div>
                <strong> Foto de perfil </strong>

                <span> JPG, PNG o WebP. Máximo 2 MB. </span>
              </div>
            </div>

            <v-btn
              variant="tonal"
              color="primary"
              rounded="lg"
              block
              prepend-icon="mdi-camera-outline"
              :loading="subiendoAvatar"
              class="mt-4"
              @click="triggerFileInput"
            >
              Cambiar fotografía
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8" xl="9">
        <v-row>
          <v-col cols="12" xl="6">
            <v-card rounded="xl" elevation="0" class="profile-card h-100">
              <div class="card-header">
                <div class="card-header__main">
                  <div class="card-header__icon">
                    <v-icon size="21"> mdi-account-edit-outline </v-icon>
                  </div>

                  <div>
                    <h2>Datos personales</h2>

                    <p>Información utilizada para identificar tu cuenta</p>
                  </div>
                </div>

                <v-chip v-if="perfilModificado" color="warning" variant="tonal" size="small">
                  Modificado
                </v-chip>
              </div>

              <v-divider />

              <v-card-text class="card-content">
                <div class="form-section-title">
                  <span> Información de la cuenta </span>
                </div>

                <v-text-field
                  v-model="perfil.nombre"
                  label="Nombre"
                  placeholder="Nombre completo"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-account-outline"
                  :error-messages="errorNombre"
                  hide-details="auto"
                  class="profile-field mb-5"
                />

                <v-text-field
                  v-model="perfil.email"
                  label="Correo electrónico"
                  placeholder="usuario@empresa.com"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-email-outline"
                  :error-messages="errorEmail"
                  hide-details="auto"
                  class="profile-field"
                />

                <div class="account-info">
                  <div class="account-info__icon">
                    <v-icon size="18"> mdi-shield-account-outline </v-icon>
                  </div>

                  <div>
                    <span> Rol asignado </span>

                    <strong>
                      {{ rolUsuario }}
                    </strong>
                  </div>

                  <v-chip color="success" variant="tonal" size="x-small"> Activo </v-chip>
                </div>
              </v-card-text>

              <v-divider />

              <v-card-actions class="card-actions">
                <v-btn v-if="perfilModificado" variant="text" rounded="lg" @click="restaurarPerfil">
                  Descartar
                </v-btn>

                <v-spacer />

                <v-btn
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  prepend-icon="mdi-content-save-outline"
                  :loading="guardandoPerfil"
                  :disabled="!perfilModificado || !perfilValido"
                  @click="guardarPerfil"
                >
                  Guardar cambios
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12" xl="6">
            <v-card rounded="xl" elevation="0" class="profile-card h-100">
              <div class="card-header">
                <div class="card-header__main">
                  <div class="card-header__icon card-header__icon--security">
                    <v-icon size="21"> mdi-lock-outline </v-icon>
                  </div>

                  <div>
                    <h2>Seguridad</h2>

                    <p>Actualiza la contraseña utilizada para iniciar sesión</p>
                  </div>
                </div>
              </div>

              <v-divider />

              <v-card-text class="card-content">
                <div class="security-notice">
                  <div class="security-notice__icon">
                    <v-icon size="18"> mdi-shield-lock-outline </v-icon>
                  </div>

                  <div>
                    <strong> Protege tu cuenta </strong>

                    <span>
                      Utiliza una contraseña diferente a las que usas en otros servicios.
                    </span>
                  </div>
                </div>

                <v-text-field
                  v-model="passwords.actual"
                  label="Contraseña actual"
                  :type="mostrar.actual ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="mostrar.actual ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  hide-details="auto"
                  class="profile-field mb-4"
                  @click:append-inner="mostrar.actual = !mostrar.actual"
                />

                <v-text-field
                  v-model="passwords.nuevo"
                  label="Nueva contraseña"
                  :type="mostrar.nuevo ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock-plus-outline"
                  :append-inner-icon="mostrar.nuevo ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :error-messages="errorPasswordNuevo"
                  hide-details="auto"
                  class="profile-field mb-3"
                  @click:append-inner="mostrar.nuevo = !mostrar.nuevo"
                />

                <div v-if="passwords.nuevo" class="password-strength mb-4">
                  <div class="password-strength__header">
                    <span> Seguridad de la contraseña </span>

                    <strong :class="`text-${fortalezaPassword.color}`">
                      {{ fortalezaPassword.label }}
                    </strong>
                  </div>

                  <v-progress-linear
                    :model-value="fortalezaPassword.valor"
                    :color="fortalezaPassword.color"
                    rounded
                    height="5"
                  />
                </div>

                <v-text-field
                  v-model="passwords.confirmar"
                  label="Confirmar nueva contraseña"
                  :type="mostrar.confirmar ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :append-inner-icon="mostrar.confirmar ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :error-messages="errorConfirmar"
                  hide-details="auto"
                  class="profile-field"
                  @click:append-inner="mostrar.confirmar = !mostrar.confirmar"
                  @keydown.enter="cambiarPassword"
                />

                <div class="password-requirements">
                  <div
                    :class="{
                      'password-requirement--valid': passwords.nuevo.length >= 8,
                    }"
                  >
                    <v-icon size="15">
                      {{ passwords.nuevo.length >= 8 ? 'mdi-check-circle' : 'mdi-circle-small' }}
                    </v-icon>

                    <span> Mínimo 8 caracteres </span>
                  </div>

                  <div
                    :class="{
                      'password-requirement--valid': tieneNumero,
                    }"
                  >
                    <v-icon size="15">
                      {{ tieneNumero ? 'mdi-check-circle' : 'mdi-circle-small' }}
                    </v-icon>

                    <span> Al menos un número </span>
                  </div>

                  <div
                    :class="{
                      'password-requirement--valid': passwordsCoinciden,
                    }"
                  >
                    <v-icon size="15">
                      {{ passwordsCoinciden ? 'mdi-check-circle' : 'mdi-circle-small' }}
                    </v-icon>

                    <span> Las contraseñas coinciden </span>
                  </div>
                </div>
              </v-card-text>

              <v-divider />

              <v-card-actions class="card-actions">
                <v-spacer />

                <v-btn
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  prepend-icon="mdi-lock-reset"
                  :loading="guardandoPassword"
                  :disabled="!passwordValido"
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

import { useAuthStore } from '../stores/auth'
import { useLoadingStore } from '../stores/loading'
import { supabase } from '../lib/supabase'
import api from '../api/axios'

const authStore = useAuthStore()
const loadingStore = useLoadingStore()

const perfil = reactive({
  nombre: '',
  email: '',
})

const perfilOriginal = reactive({
  nombre: '',
  email: '',
})

const passwords = reactive({
  actual: '',
  nuevo: '',
  confirmar: '',
})

const mostrar = reactive({
  actual: false,
  nuevo: false,
  confirmar: false,
})

const guardandoPerfil = ref(false)
const guardandoPassword = ref(false)
const subiendoAvatar = ref(false)

const avatarUrl = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)

const snackbar = reactive({
  visible: false,
  mensaje: '',
  color: 'success',
})

const iniciales = computed(() => {
  const nombre = perfil.nombre || authStore.usuario?.nombre || ''

  if (!nombre.trim()) {
    return 'U'
  }

  return nombre
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const rolUsuario = computed(() => {
  const rol = authStore.usuario?.rol ?? 'usuario'

  if (rol === 'admin') {
    return 'Administrador'
  }

  if (rol === 'operador') {
    return 'Operador'
  }

  if (rol === 'supervisor') {
    return 'Supervisor'
  }

  return rol
})

const iconoRol = computed(() => {
  const rol = authStore.usuario?.rol

  if (rol === 'admin') {
    return 'mdi-shield-crown-outline'
  }

  if (rol === 'operador') {
    return 'mdi-account-cog-outline'
  }

  if (rol === 'supervisor') {
    return 'mdi-account-eye-outline'
  }

  return 'mdi-account-outline'
})

const perfilModificado = computed(() => {
  return (
    perfil.nombre.trim() !== perfilOriginal.nombre || perfil.email.trim() !== perfilOriginal.email
  )
})

const errorNombre = computed(() => {
  if (!perfil.nombre.trim()) {
    return 'El nombre es obligatorio'
  }

  if (perfil.nombre.trim().length < 2) {
    return 'Ingresa un nombre válido'
  }

  return ''
})

const errorEmail = computed(() => {
  if (!perfil.email.trim()) {
    return 'El correo es obligatorio'
  }

  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email.trim())

  return valido ? '' : 'Ingresa un correo electrónico válido'
})

const perfilValido = computed(() => {
  return !errorNombre.value && !errorEmail.value
})

const tieneNumero = computed(() => {
  return /\d/.test(passwords.nuevo)
})

const passwordsCoinciden = computed(() => {
  return Boolean(passwords.nuevo && passwords.confirmar && passwords.nuevo === passwords.confirmar)
})

const errorPasswordNuevo = computed(() => {
  if (!passwords.nuevo) {
    return ''
  }

  if (passwords.nuevo.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres'
  }

  return ''
})

const errorConfirmar = computed(() => {
  if (!passwords.confirmar) {
    return ''
  }

  return passwords.nuevo !== passwords.confirmar ? 'Las contraseñas no coinciden' : ''
})

const passwordValido = computed(() => {
  return Boolean(
    passwords.actual &&
    passwords.nuevo.length >= 8 &&
    tieneNumero.value &&
    passwordsCoinciden.value,
  )
})

const fortalezaPassword = computed(() => {
  const password = passwords.nuevo

  let puntuacion = 0

  if (password.length >= 8) {
    puntuacion++
  }

  if (password.length >= 12) {
    puntuacion++
  }

  if (/[A-Z]/.test(password)) {
    puntuacion++
  }

  if (/\d/.test(password)) {
    puntuacion++
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    puntuacion++
  }

  if (puntuacion <= 1) {
    return {
      valor: 25,
      label: 'Débil',
      color: 'error',
    }
  }

  if (puntuacion <= 3) {
    return {
      valor: 60,
      label: 'Media',
      color: 'warning',
    }
  }

  return {
    valor: 100,
    label: 'Fuerte',
    color: 'success',
  }
})

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.visible = true
}

const triggerFileInput = () => {
  if (!subiendoAvatar.value) {
    fileInput.value?.click()
  }
}

const subirAvatar = async (event: Event) => {
  const input = event.target as HTMLInputElement

  const file = input.files?.[0]

  if (!file) {
    return
  }

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']

  if (!tiposPermitidos.includes(file.type)) {
    mostrarSnackbar('Formato no permitido. Usa JPG, PNG o WebP', 'error')

    input.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    mostrarSnackbar('La imagen no puede superar 2 MB', 'error')

    input.value = ''
    return
  }

  subiendoAvatar.value = true

  try {
    const userId = authStore.usuario?.id

    if (!userId) {
      throw new Error('Usuario no identificado')
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const path = `${userId}/avatar.${extension}`

    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
    })

    if (error) {
      throw error
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)

    const url = `${data.publicUrl}?t=${Date.now()}`

    const respuesta = await api.patch('/usuarios/perfil', {
      avatar_url: url,
    })

    if (!respuesta.data.ok) {
      throw new Error(respuesta.data.mensaje || 'No fue posible actualizar el avatar')
    }

    avatarUrl.value = url

    mostrarSnackbar('Foto actualizada correctamente')
  } catch (error) {
    console.error('Error subiendo avatar:', error)

    mostrarSnackbar('Error subiendo la imagen', 'error')
  } finally {
    subiendoAvatar.value = false
    input.value = ''
  }
}

const restaurarPerfil = () => {
  perfil.nombre = perfilOriginal.nombre

  perfil.email = perfilOriginal.email
}

const guardarPerfil = async () => {
  if (guardandoPerfil.value || !perfilValido.value || !perfilModificado.value) {
    return
  }

  guardandoPerfil.value = true

  try {
    const { data } = await api.patch('/usuarios/perfil', {
      nombre: perfil.nombre.trim(),
      email: perfil.email.trim(),
    })

    if (data.ok) {
      await authStore.cargarUsuario()

      perfil.nombre = authStore.usuario?.nombre ?? perfil.nombre.trim()

      perfil.email = authStore.usuario?.email ?? perfil.email.trim()

      perfilOriginal.nombre = perfil.nombre

      perfilOriginal.email = perfil.email

      mostrarSnackbar('Perfil actualizado correctamente')
    } else {
      mostrarSnackbar(data.mensaje ?? 'No fue posible actualizar el perfil', 'error')
    }
  } catch (error) {
    console.error('Error actualizando perfil:', error)

    mostrarSnackbar('Error actualizando perfil', 'error')
  } finally {
    guardandoPerfil.value = false
  }
}

const cambiarPassword = async () => {
  if (guardandoPassword.value || !passwordValido.value) {
    return
  }

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

      mostrar.actual = false
      mostrar.nuevo = false
      mostrar.confirmar = false
    } else {
      mostrarSnackbar(data.mensaje ?? 'No fue posible cambiar la contraseña', 'error')
    }
  } catch (error) {
    console.error('Error cambiando contraseña:', error)

    mostrarSnackbar('Error cambiando contraseña', 'error')
  } finally {
    guardandoPassword.value = false
  }
}

const cargarPerfil = async () => {
  await authStore.cargarUsuario()

  perfil.nombre = authStore.usuario?.nombre ?? ''

  perfil.email = authStore.usuario?.email ?? ''

  perfilOriginal.nombre = perfil.nombre

  perfilOriginal.email = perfil.email

  try {
    const { data } = await api.get('/auth/me')

    if (data.ok && data.data.avatar_url) {
      avatarUrl.value = data.data.avatar_url
    }
  } catch (error) {
    console.error('Error cargando avatar:', error)
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando perfil...')

  try {
    await cargarPerfil()
  } finally {
    loadingStore.ocultar()
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1400px;
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

.identity-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.profile-banner {
  position: relative;
  height: 112px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)),
    rgba(var(--v-theme-primary), 0.76)
  );
}

.profile-banner__decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.profile-banner__decoration--one {
  width: 130px;
  height: 130px;
  top: -70px;
  right: -20px;
}

.profile-banner__decoration--two {
  width: 90px;
  height: 90px;
  bottom: -55px;
  left: 18px;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -55px;
}

.avatar-container {
  position: relative;
  display: inline-flex;
  border-radius: 50%;
  cursor: pointer;
}

.profile-avatar {
  border: 4px solid rgb(var(--v-theme-surface));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 1.65rem;
  font-weight: 750;
  color: rgb(var(--v-theme-on-primary));
}

.avatar-overlay {
  position: absolute;
  inset: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay,
.avatar-container--loading .avatar-overlay {
  opacity: 1;
}

.camera-badge {
  position: absolute;
  right: 2px;
  bottom: 4px;
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgb(var(--v-theme-surface));
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
}

.identity-content {
  padding: 13px 20px 20px;
  text-align: center;
}

.identity-content h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 750;
}

.role-chip {
  margin-top: 7px;
  font-size: 0.72rem;
  font-weight: 600;
}

.profile-email {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  margin-top: 13px;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.profile-email span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
}

.avatar-help {
  display: flex;
  align-items: center;
  gap: 9px;
  text-align: left;
}

.avatar-help__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.avatar-help > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.avatar-help strong {
  font-size: 0.78rem;
  font-weight: 650;
}

.avatar-help span {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.profile-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.card-header {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 15px 18px;
}

.card-header__main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.card-header__icon {
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

.card-header__icon--security {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.08);
}

.card-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.card-header p {
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.card-content {
  flex: 1;
  padding: 20px !important;
}

.form-section-title {
  margin-bottom: 14px;
}

.form-section-title span {
  font-size: 0.8rem;
  font-weight: 650;
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.profile-field :deep(.v-field__input) {
  font-size: 0.86rem;
}

.profile-field :deep(.v-field-label) {
  font-size: 0.8rem;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 19px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.045);
}

.account-info__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.account-info > div:nth-child(2) {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.account-info span {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.account-info strong {
  margin-top: 2px;
  font-size: 0.78rem;
  font-weight: 650;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 11px 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-success), 0.055);
}

.security-notice__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.security-notice > div:last-child {
  display: flex;
  flex-direction: column;
}

.security-notice strong {
  font-size: 0.78rem;
  font-weight: 650;
}

.security-notice span {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.54);
}

.password-strength {
  padding: 0 2px;
}

.password-strength__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.password-strength__header span,
.password-strength__header strong {
  font-size: 0.7rem;
}

.password-strength__header strong {
  font-weight: 650;
}

.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 13px;
  padding: 10px 12px;
  border-radius: 11px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.password-requirements > div {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(var(--v-theme-on-surface), 0.47);
}

.password-requirements span {
  font-size: 0.7rem;
}

.password-requirement--valid {
  color: rgb(var(--v-theme-success)) !important;
}

.card-actions {
  min-height: 64px;
  padding: 10px 18px !important;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1279px) {
  .identity-card {
    position: sticky;
    top: 82px;
  }
}

@media (max-width: 959px) {
  .identity-card {
    position: static;
  }

  .profile-banner {
    height: 100px;
  }

  .identity-content {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 700px) {
  .profile-page {
    padding: 14px !important;
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

  .card-header {
    padding: 14px;
  }

  .card-header p {
    font-size: 0.7rem;
  }

  .card-content {
    padding: 16px !important;
  }
}

@media (max-width: 480px) {
  .pending-chip {
    display: none;
  }

  .page-header__icon {
    display: none;
  }

  .profile-banner {
    height: 90px;
  }

  .avatar-wrapper {
    margin-top: -49px;
  }

  .profile-avatar {
    width: 94px !important;
    height: 94px !important;
  }

  .camera-badge {
    width: 27px;
    height: 27px;
  }

  .card-header p {
    display: none;
  }

  .card-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .card-actions .v-spacer {
    display: none;
  }
}
</style>