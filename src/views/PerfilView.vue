<template>
  <v-container fluid class="profile-page pa-4 pa-md-6">
    <div class="page-header mb-5">
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

            <v-chip :color="mfaActivo ? 'success' : 'warning'" variant="tonal" size="small">
              <v-icon start size="15">
                {{ mfaActivo ? 'mdi-shield-check-outline' : 'mdi-shield-alert-outline' }}
              </v-icon>

              {{ mfaActivo ? 'Cuenta protegida' : 'Seguridad básica' }}
            </v-chip>
          </div>

          <p class="page-subtitle">
            Administra tu información personal, fotografía y seguridad de la cuenta
          </p>
        </div>
      </div>
    </div>

    <v-row align="start">
      <v-col cols="12" lg="4" xl="3">
        <div class="profile-sidebar">
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
                <v-avatar size="104" color="primary" class="profile-avatar">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Foto de perfil"
                    class="avatar-image"
                  />

                  <span v-else class="avatar-initials">
                    {{ iniciales }}
                  </span>
                </v-avatar>

                <div class="avatar-overlay">
                  <v-icon v-if="!subiendoAvatar" color="white" size="24">
                    mdi-camera-outline
                  </v-icon>

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

              <v-divider class="my-4" />

              <div class="account-overview">
                <div class="account-overview__item">
                  <div class="account-overview__icon account-overview__icon--success">
                    <v-icon size="17"> mdi-account-check-outline </v-icon>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong class="text-success"> Activa </strong>
                  </div>
                </div>

                <div class="account-overview__divider" />

                <div class="account-overview__item">
                  <div
                    class="account-overview__icon"
                    :class="
                      mfaActivo
                        ? 'account-overview__icon--success'
                        : 'account-overview__icon--warning'
                    "
                  >
                    <v-icon size="17">
                      {{ mfaActivo ? 'mdi-shield-check-outline' : 'mdi-shield-outline' }}
                    </v-icon>
                  </div>

                  <div>
                    <span>MFA</span>

                    <strong :class="mfaActivo ? 'text-success' : 'text-warning'">
                      {{ mfaActivo ? 'Activo' : 'Inactivo' }}
                    </strong>
                  </div>
                </div>
              </div>

              <div class="avatar-help">
                <div class="avatar-help__icon">
                  <v-icon size="18"> mdi-image-outline </v-icon>
                </div>

                <div>
                  <strong> Foto de perfil </strong>

                  <span> JPG, PNG o WebP · Máximo 2 MB </span>
                </div>
              </div>

              <v-btn
                variant="tonal"
                color="primary"
                rounded="lg"
                block
                prepend-icon="mdi-camera-outline"
                :loading="subiendoAvatar"
                class="mt-3"
                @click="triggerFileInput"
              >
                Cambiar fotografía
              </v-btn>
            </div>
          </v-card>

          <v-card rounded="xl" elevation="0" class="mfa-card">
            <div class="mfa-card__header">
              <div
                class="mfa-card__icon"
                :class="{
                  'mfa-card__icon--active': mfaActivo,
                }"
              >
                <v-icon size="21">
                  {{ mfaActivo ? 'mdi-shield-check' : 'mdi-shield-lock-outline' }}
                </v-icon>
              </div>

              <div class="mfa-card__title">
                <strong> Verificación en dos pasos </strong>

                <span> Protección adicional de acceso </span>
              </div>

              <span
                class="mfa-status-dot"
                :class="{
                  'mfa-status-dot--active': mfaActivo,
                }"
              />
            </div>

            <div v-if="mfaActivo" class="mfa-active-state">
              <div class="mfa-active-state__main">
                <v-icon color="success" size="21"> mdi-check-decagram-outline </v-icon>

                <div>
                  <strong> Protección reforzada </strong>

                  <span> Se solicitará un código adicional al iniciar sesión. </span>
                </div>
              </div>

              <v-btn
                color="error"
                variant="tonal"
                rounded="lg"
                size="small"
                block
                prepend-icon="mdi-shield-off-outline"
                class="mt-3"
                @click="modalDesactivarMFA = true"
              >
                Desactivar MFA
              </v-btn>
            </div>

            <div v-else class="mfa-inactive-state">
              <p>
                Protege tu cuenta con Google Authenticator y un código adicional al iniciar sesión.
              </p>

              <v-btn
                color="success"
                variant="tonal"
                rounded="lg"
                block
                prepend-icon="mdi-shield-plus-outline"
                @click="iniciarActivacionMFA"
              >
                Activar MFA
              </v-btn>
            </div>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" lg="8" xl="9">
        <v-row align="stretch">
          <v-col cols="12" md="6">
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
                <div class="form-section-title">Información de la cuenta</div>

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
                  class="profile-field mb-4"
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

                <div class="account-details">
                  <div class="account-detail">
                    <div class="account-detail__icon">
                      <v-icon size="17"> mdi-identifier </v-icon>
                    </div>

                    <div>
                      <span> ID de usuario </span>

                      <strong>
                        {{ authStore.usuario?.id ?? '—' }}
                      </strong>
                    </div>
                  </div>

                  <div class="account-detail">
                    <div class="account-detail__icon">
                      <v-icon size="17">
                        {{ iconoRol }}
                      </v-icon>
                    </div>

                    <div>
                      <span> Rol asignado </span>

                      <strong>
                        {{ rolUsuario }}
                      </strong>
                    </div>
                  </div>

                  <div class="account-detail">
                    <div class="account-detail__icon account-detail__icon--success">
                      <v-icon size="17"> mdi-account-check-outline </v-icon>
                    </div>

                    <div>
                      <span> Estado </span>

                      <strong class="text-success"> Cuenta activa </strong>
                    </div>
                  </div>

                  <div class="account-detail">
                    <div
                      class="account-detail__icon"
                      :class="
                        mfaActivo
                          ? 'account-detail__icon--success'
                          : 'account-detail__icon--warning'
                      "
                    >
                      <v-icon size="17"> mdi-shield-account-outline </v-icon>
                    </div>

                    <div>
                      <span> Seguridad </span>

                      <strong>
                        {{ mfaActivo ? 'MFA activado' : 'MFA desactivado' }}
                      </strong>
                    </div>
                  </div>
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

          <v-col cols="12" md="6">
            <v-card rounded="xl" elevation="0" class="profile-card h-100">
              <div class="card-header">
                <div class="card-header__main">
                  <div class="card-header__icon card-header__icon--security">
                    <v-icon size="21"> mdi-lock-outline </v-icon>
                  </div>

                  <div>
                    <h2>Cambiar contraseña</h2>

                    <p>Actualiza las credenciales de acceso de tu cuenta</p>
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
                  class="profile-field mb-3"
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

                <div v-if="passwords.nuevo" class="password-strength mb-3">
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
                    <v-icon size="16">
                      {{ passwords.nuevo.length >= 8 ? 'mdi-check-circle' : 'mdi-circle-small' }}
                    </v-icon>

                    <span> Mínimo 8 caracteres </span>
                  </div>

                  <div
                    :class="{
                      'password-requirement--valid': tieneNumero,
                    }"
                  >
                    <v-icon size="16">
                      {{ tieneNumero ? 'mdi-check-circle' : 'mdi-circle-small' }}
                    </v-icon>

                    <span> Al menos un número </span>
                  </div>

                  <div
                    :class="{
                      'password-requirement--valid': passwordsCoinciden,
                    }"
                  >
                    <v-icon size="16">
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

        <v-card rounded="xl" elevation="0" class="security-summary-card mt-4">
          <div class="security-summary__header">
            <div class="security-summary__title">
              <div class="security-summary__icon">
                <v-icon size="21"> mdi-shield-account-outline </v-icon>
              </div>

              <div>
                <h2>Estado de seguridad de la cuenta</h2>

                <p>Resumen de las medidas de protección configuradas actualmente</p>
              </div>
            </div>

            <v-chip :color="mfaActivo ? 'success' : 'warning'" variant="tonal" size="small">
              <v-icon start size="15">
                {{ mfaActivo ? 'mdi-shield-check' : 'mdi-shield-alert-outline' }}
              </v-icon>

              {{ mfaActivo ? 'Protección reforzada' : 'Mejora recomendada' }}
            </v-chip>
          </div>

          <v-divider />

          <div class="security-summary__content">
            <div class="security-status-item">
              <div class="security-status-item__icon">
                <v-icon size="20"> mdi-lock-check-outline </v-icon>
              </div>

              <div>
                <span> Contraseña </span>

                <strong> Configurada </strong>
              </div>

              <v-icon color="success" size="20"> mdi-check-circle </v-icon>
            </div>

            <div class="security-status-item">
              <div
                class="security-status-item__icon"
                :class="{
                  'security-status-item__icon--success': mfaActivo,
                  'security-status-item__icon--warning': !mfaActivo,
                }"
              >
                <v-icon size="20"> mdi-two-factor-authentication </v-icon>
              </div>

              <div>
                <span> Verificación MFA </span>

                <strong>
                  {{ mfaActivo ? 'Activada' : 'No configurada' }}
                </strong>
              </div>

              <v-icon :color="mfaActivo ? 'success' : 'warning'" size="20">
                {{ mfaActivo ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
            </div>

            <div class="security-status-item">
              <div class="security-status-item__icon">
                <v-icon size="20"> mdi-account-check-outline </v-icon>
              </div>

              <div>
                <span> Estado de cuenta </span>

                <strong> Activa </strong>
              </div>

              <v-icon color="success" size="20"> mdi-check-circle </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="modalActivarMFA" max-width="480" persistent>
      <v-card rounded="xl" elevation="12" class="mfa-dialog">
        <div class="dialog-header">
          <div class="dialog-header__icon dialog-header__icon--success">
            <v-icon size="24"> mdi-shield-key-outline </v-icon>
          </div>

          <div>
            <h2>Activar verificación en dos pasos</h2>

            <p>Configura Google Authenticator para proteger tu cuenta</p>
          </div>
        </div>

        <v-divider />

        <v-card-text class="dialog-content">
          <div v-if="qrCode" class="qr-section">
            <span class="qr-step"> Paso 1 </span>

            <h3>Escanea el código QR</h3>

            <p>Abre Google Authenticator y escanea este código.</p>

            <div class="qr-wrapper">
              <img :src="qrCode" alt="Código QR MFA" />
            </div>

            <div class="secret-code">
              <div>
                <span> Código manual </span>

                <strong>
                  {{ mfaSecret }}
                </strong>
              </div>

              <v-tooltip text="Copiar código" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="copiarSecret"
                  >
                    <v-icon size="17"> mdi-content-copy </v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </div>

          <v-divider class="my-5" />

          <div class="verification-section">
            <span class="qr-step"> Paso 2 </span>

            <h3>Confirma la configuración</h3>

            <p>Ingresa el código de 6 dígitos generado por la aplicación.</p>

            <v-text-field
              v-model="codigoActivacion"
              label="Código de verificación"
              placeholder="000000"
              maxlength="6"
              inputmode="numeric"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-shield-key-outline"
              hide-details
              class="profile-field mt-3 verification-input"
              @keydown.enter="activarMFA"
            />
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">
          <v-btn variant="text" rounded="lg" @click="cerrarModalActivar"> Cancelar </v-btn>

          <v-spacer />

          <v-btn
            color="success"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-shield-check-outline"
            :loading="guardandoMFA"
            :disabled="codigoActivacion.length !== 6"
            @click="activarMFA"
          >
            Activar MFA
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="modalDesactivarMFA" max-width="420" persistent>
      <v-card rounded="xl" elevation="12" class="mfa-dialog">
        <div class="disable-mfa-header">
          <div class="disable-mfa-header__icon">
            <v-icon size="30" color="error"> mdi-shield-off-outline </v-icon>
          </div>

          <h2>Desactivar MFA</h2>

          <p>Esta acción reducirá el nivel de seguridad de tu cuenta.</p>
        </div>

        <v-divider />

        <v-card-text class="dialog-content">
          <div class="danger-notice">
            <v-icon size="19" color="warning"> mdi-alert-outline </v-icon>

            <span>
              Después de desactivarlo solo necesitarás tu correo y contraseña para ingresar.
            </span>
          </div>

          <v-text-field
            v-model="codigoDesactivacion"
            label="Código de Google Authenticator"
            placeholder="000000"
            maxlength="6"
            inputmode="numeric"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            prepend-inner-icon="mdi-shield-key-outline"
            hide-details
            class="profile-field mt-4"
            @keydown.enter="desactivarMFA"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">
          <v-btn variant="text" rounded="lg" @click="cerrarModalDesactivar"> Cancelar </v-btn>

          <v-spacer />

          <v-btn
            color="error"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-shield-off-outline"
            :loading="guardandoMFA"
            :disabled="codigoDesactivacion.length !== 6"
            @click="desactivarMFA"
          >
            Desactivar MFA
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

const mfaActivo = ref(false)
const modalActivarMFA = ref(false)
const modalDesactivarMFA = ref(false)

const qrCode = ref('')
const mfaSecret = ref('')

const codigoActivacion = ref('')
const codigoDesactivacion = ref('')

const guardandoMFA = ref(false)

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

const iniciarActivacionMFA = async () => {
  if (guardandoMFA.value) {
    return
  }

  guardandoMFA.value = true

  try {
    const { data } = await api.post('/auth/mfa/generar')

    if (data.ok) {
      qrCode.value = data.data.qr

      mfaSecret.value = data.data.secret

      codigoActivacion.value = ''

      modalActivarMFA.value = true
    } else {
      mostrarSnackbar(data.mensaje ?? 'No fue posible generar el MFA', 'error')
    }
  } catch (error) {
    console.error('Error generando MFA:', error)

    mostrarSnackbar('Error generando MFA', 'error')
  } finally {
    guardandoMFA.value = false
  }
}

const activarMFA = async () => {
  if (guardandoMFA.value || codigoActivacion.value.length !== 6) {
    return
  }

  guardandoMFA.value = true

  try {
    const { data } = await api.post('/auth/mfa/verificar', {
      codigo: codigoActivacion.value,
    })

    if (data.ok) {
      mfaActivo.value = true
      modalActivarMFA.value = false
      codigoActivacion.value = ''

      mostrarSnackbar('MFA activado correctamente')
    } else {
      mostrarSnackbar(data.mensaje ?? 'Código incorrecto', 'error')
    }
  } catch (error) {
    console.error('Error activando MFA:', error)

    mostrarSnackbar('Error activando MFA', 'error')
  } finally {
    guardandoMFA.value = false
  }
}

const desactivarMFA = async () => {
  if (guardandoMFA.value || codigoDesactivacion.value.length !== 6) {
    return
  }

  guardandoMFA.value = true

  try {
    const { data } = await api.post('/auth/mfa/desactivar', {
      codigo: codigoDesactivacion.value,
    })

    if (data.ok) {
      mfaActivo.value = false
      modalDesactivarMFA.value = false
      codigoDesactivacion.value = ''

      mostrarSnackbar('MFA desactivado correctamente')
    } else {
      mostrarSnackbar(data.mensaje ?? 'Código incorrecto', 'error')
    }
  } catch (error) {
    console.error('Error desactivando MFA:', error)

    mostrarSnackbar('Error desactivando MFA', 'error')
  } finally {
    guardandoMFA.value = false
  }
}

const cerrarModalActivar = () => {
  modalActivarMFA.value = false
  codigoActivacion.value = ''
}

const cerrarModalDesactivar = () => {
  modalDesactivarMFA.value = false
  codigoDesactivacion.value = ''
}

const copiarSecret = async () => {
  if (!mfaSecret.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(mfaSecret.value)

    mostrarSnackbar('Código copiado')
  } catch {
    mostrarSnackbar('No fue posible copiar el código', 'error')
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

    if (data.ok) {
      avatarUrl.value = data.data.avatar_url ?? null

      mfaActivo.value = data.data.mfa_activo ?? false
    }
  } catch (error) {
    console.error('Error cargando perfil:', error)
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

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.identity-card,
.profile-card,
.mfa-card,
.security-summary-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.profile-banner {
  position: relative;
  height: 106px;
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
  margin-top: -53px;
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
  font-size: 0.75rem;
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

.account-overview {
  display: grid;
  grid-template-columns:
    1fr
    1px
    1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.account-overview__item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.account-overview__icon {
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
}

.account-overview__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.account-overview__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.account-overview__item > div:last-child {
  display: flex;
  flex-direction: column;
}

.account-overview__item span {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.account-overview__item strong {
  margin-top: 2px;
  font-size: 0.78rem;
  font-weight: 650;
}

.account-overview__divider {
  width: 1px;
  height: 32px;
  background: rgba(var(--v-theme-on-surface), 0.09);
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

.mfa-card {
  padding: 16px;
}

.mfa-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mfa-card__icon {
  width: 39px;
  height: 39px;
  flex: 0 0 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.mfa-card__icon--active {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.mfa-card__title {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mfa-card__title strong {
  font-size: 0.85rem;
  font-weight: 700;
}

.mfa-card__title span {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.mfa-status-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-warning));
}

.mfa-status-dot--active {
  background: rgb(var(--v-theme-success));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-success), 0.08);
}

.mfa-active-state,
.mfa-inactive-state {
  margin-top: 15px;
  padding-top: 14px;
  border-top: 1px solid rgba(var(--v-border-color), 0.45);
}

.mfa-active-state__main {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.mfa-active-state__main > div {
  display: flex;
  flex-direction: column;
}

.mfa-active-state strong {
  font-size: 0.78rem;
  font-weight: 650;
}

.mfa-active-state span,
.mfa-inactive-state p {
  margin: 3px 0 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.54);
}

.mfa-inactive-state p {
  margin-bottom: 12px;
}

.profile-card {
  display: flex;
  flex-direction: column;
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

.card-header h2,
.security-summary__header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.card-header p,
.security-summary__header p {
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.card-content {
  flex: 1;
  padding: 18px !important;
}

.form-section-title {
  margin-bottom: 13px;
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

.account-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 18px;
}

.account-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border-radius: 11px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.account-detail__icon {
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.account-detail__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.account-detail__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.account-detail > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.account-detail span {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.account-detail strong {
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.77rem;
  font-weight: 650;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px 11px;
  border-radius: 11px;
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
  font-size: 0.72rem;
}

.password-strength__header strong {
  font-weight: 650;
}

.password-requirements {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
  margin-top: 12px;
  padding: 10px 11px;
  border-radius: 11px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.password-requirements > div {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.password-requirements span {
  font-size: 0.72rem;
}

.password-requirement--valid {
  color: rgb(var(--v-theme-success)) !important;
}

.card-actions {
  min-height: 62px;
  padding: 9px 18px !important;
}

.security-summary-card {
  background: linear-gradient(
    120deg,
    rgba(var(--v-theme-primary), 0.025),
    rgb(var(--v-theme-surface)) 45%
  );
}

.security-summary__header {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
}

.security-summary__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.security-summary__icon {
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

.security-summary__content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 15px;
}

.security-status-item {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 11px;
  border-radius: 11px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.security-status-item__icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.security-status-item__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.security-status-item__icon--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
}

.security-status-item > div:nth-child(2) {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.security-status-item span {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.security-status-item strong {
  margin-top: 2px;
  font-size: 0.78rem;
  font-weight: 650;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 17px 18px;
}

.dialog-header__icon {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.dialog-header__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.dialog-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.dialog-header p {
  margin: 3px 0 0;
  font-size: 0.73rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.dialog-content {
  padding: 20px !important;
}

.qr-section,
.verification-section {
  text-align: center;
}

.qr-step {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 650;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.qr-section h3,
.verification-section h3 {
  margin: 8px 0 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.qr-section p,
.verification-section p {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.54);
}

.qr-wrapper {
  width: 216px;
  height: 216px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto;
  padding: 8px;
  border: 1px solid rgba(var(--v-border-color), 0.55);
  border-radius: 14px;
  background: white;
}

.qr-wrapper img {
  width: 200px;
  height: 200px;
}

.secret-code {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 10px;
  text-align: left;
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.secret-code > div {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.secret-code span {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.secret-code strong {
  margin-top: 2px;
  overflow-wrap: anywhere;
  font-family: monospace;
  font-size: 0.76rem;
}

.verification-input {
  max-width: 260px;
  margin: 12px auto 0;
}

.verification-input :deep(input) {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 650;
  letter-spacing: 0.18em;
}

.dialog-actions {
  padding: 12px 18px !important;
}

.disable-mfa-header {
  padding: 22px 22px 17px;
  text-align: center;
}

.disable-mfa-header__icon {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: rgba(var(--v-theme-error), 0.08);
}

.disable-mfa-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.disable-mfa-header p {
  margin: 5px 0 0;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.danger-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 10px 11px;
  border-radius: 10px;
  background: rgba(var(--v-theme-warning), 0.065);
}

.danger-notice span {
  font-size: 0.74rem;
  line-height: 1.45;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 1280px) {
  .profile-sidebar {
    position: sticky;
    top: 82px;
  }
}

@media (max-width: 1100px) {
  .security-summary__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 959px) {
  .profile-sidebar {
    position: static;
  }

  .mfa-card {
    margin-bottom: 3px;
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

  .card-header,
  .security-summary__header {
    padding: 14px;
  }

  .card-header p,
  .security-summary__header p {
    font-size: 0.72rem;
  }

  .card-content {
    padding: 15px !important;
  }

  .account-details {
    grid-template-columns: 1fr;
  }

  .security-summary__header {
    align-items: flex-start;
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

  .card-header p,
  .security-summary__header p {
    display: none;
  }

  .security-summary__header {
    align-items: center;
  }

  .security-summary__header > .v-chip {
    display: none;
  }

  .account-overview {
    grid-template-columns: 1fr;
  }

  .account-overview__divider {
    width: 100%;
    height: 1px;
  }

  .card-actions {
    display: grid;
    grid-template-columns:
      1fr
      1fr;
  }

  .card-actions .v-spacer {
    display: none;
  }

  .qr-wrapper {
    width: 196px;
    height: 196px;
  }

  .qr-wrapper img {
    width: 180px;
    height: 180px;
  }
}
</style>