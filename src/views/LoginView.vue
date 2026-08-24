<template>
  <v-app>
    <v-main>
      <div class="login-container">
        <div class="login-left">
          <div class="login-left-content">
            <div class="circles">
              <div class="circle circle-1" />
              <div class="circle circle-2" />
              <div class="circle circle-3" />
            </div>

            <img src="/logo_malima.png" class="logo-left fade-in" height="140" />

            <h1 class="login-title fade-in-delay-1">Sistema de Automatización</h1>

            <p class="login-subtitle fade-in-delay-2">Control inteligente de invernaderos</p>
          </div>
        </div>

        <div class="login-right">
          <div class="login-form-container slide-in">
            <v-card v-if="!requiereMFA" rounded="lg" elevation="3" class="pa-6">
              <div class="text-center mb-8">
                <img src="/logo_malima_icono.png" height="56" class="logo-icono" />

                <h2 class="form-title mt-3">Bienvenido</h2>

                <p class="form-subtitle">Ingresa tus credenciales para continuar</p>
              </div>

              <div class="form-field mb-4">
                <label class="field-label"> Correo electrónico </label>

                <div
                  class="field-wrapper"
                  :class="{
                    focused: focusEmail,
                    filled: form.email,
                  }"
                >
                  <v-icon class="field-icon" size="18"> mdi-email-outline </v-icon>

                  <input
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    placeholder="tu@correo.com"
                    class="field-input"
                    @focus="focusEmail = true"
                    @blur="focusEmail = false"
                    @keyup.enter="handleLogin"
                  />
                </div>

                <span v-if="errores.email" class="field-error">
                  {{ errores.email }}
                </span>
              </div>

              <div class="form-field mb-6">
                <label class="field-label"> Contraseña </label>

                <div
                  class="field-wrapper"
                  :class="{
                    focused: focusPassword,
                    filled: form.password,
                  }"
                >
                  <v-icon class="field-icon" size="18"> mdi-lock-outline </v-icon>

                  <input
                    v-model="form.password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    class="field-input"
                    @focus="focusPassword = true"
                    @blur="focusPassword = false"
                    @keyup.enter="handleLogin"
                  />

                  <v-icon
                    class="field-icon-right"
                    size="18"
                    style="cursor: pointer"
                    @click="mostrarPassword = !mostrarPassword"
                  >
                    {{ mostrarPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                  </v-icon>
                </div>

                <span v-if="errores.password" class="field-error">
                  {{ errores.password }}
                </span>
              </div>

              <transition name="shake">
                <div v-if="errorGeneral" class="error-alert mb-4">
                  <v-icon size="16" color="error"> mdi-alert-circle </v-icon>

                  <span>
                    {{ errorGeneral }}
                  </span>
                </div>
              </transition>

              <button
                class="login-btn"
                :class="{ loading: cargando }"
                :disabled="cargando"
                @click="handleLogin"
              >
                <span v-if="!cargando" class="btn-content">
                  <v-icon size="18" class="mr-2"> mdi-login </v-icon>

                  Ingresar
                </span>

                <span v-else class="btn-content">
                  <div class="btn-spinner" />
                  Verificando...
                </span>
              </button>

              <div class="text-center mt-4">
                <a href="/restablecer-password" class="forgot-link"> ¿Olvidaste tu contraseña? </a>
              </div>
            </v-card>

            <v-card v-else rounded="lg" elevation="3" class="pa-6">
              <div class="text-center mb-6">
                <img src="/logo_malima_icono.png" height="56" class="logo-icono" />

                <h2 class="form-title mt-3">Verificación en dos pasos</h2>

                <p class="form-subtitle">Confirma tu identidad para continuar</p>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-4">
                Abre Google Authenticator e ingresa el código de 6 dígitos.
              </p>

              <div class="form-field mb-4">
                <label class="field-label"> Código de verificación </label>

                <div class="field-wrapper" :class="{ focused: focusMFA }">
                  <v-icon class="field-icon" size="18"> mdi-shield-key </v-icon>

                  <input
                    v-model="codigoMFA"
                    type="text"
                    inputmode="numeric"
                    maxlength="6"
                    placeholder="000000"
                    class="field-input"
                    style="letter-spacing: 8px; font-size: 20px; font-weight: bold"
                    @focus="focusMFA = true"
                    @blur="focusMFA = false"
                    @keyup.enter="handleMFA"
                  />
                </div>
              </div>

              <!-- Error MFA -->
              <transition name="shake">
                <div v-if="errorGeneral" class="error-alert mb-4">
                  <v-icon size="16" color="error"> mdi-alert-circle </v-icon>

                  <span>
                    {{ errorGeneral }}
                  </span>
                </div>
              </transition>

              <!-- Botón verificar -->
              <button
                class="login-btn"
                :class="{ loading: cargandoMFA }"
                :disabled="cargandoMFA"
                @click="handleMFA"
              >
                <span v-if="!cargandoMFA" class="btn-content">
                  <v-icon size="18" class="mr-2"> mdi-shield-check </v-icon>

                  Verificar
                </span>

                <span v-else class="btn-content">
                  <div class="btn-spinner" />
                  Verificando...
                </span>
              </button>

              <!-- Volver al login -->
              <div class="text-center mt-3">
                <a href="#" class="forgot-link" @click.prevent="volverAlLogin">
                  ← Volver al login
                </a>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import api from '../api/axios'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const requiereMFA = ref(false)
const emailMFA = ref('')
const codigoMFA = ref('')
const cargandoMFA = ref(false)
const focusMFA = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const errores = reactive({
  email: '',
  password: '',
})

const errorGeneral = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)

const focusEmail = ref(false)
const focusPassword = ref(false)

const validar = () => {
  errores.email = ''
  errores.password = ''

  let valido = true

  if (!form.email) {
    errores.email = 'El correo es requerido'
    valido = false
  }

  if (!form.password) {
    errores.password = 'La contraseña es requerida'
    valido = false
  }

  return valido
}

const handleLogin = async () => {
  if (!validar()) return

  cargando.value = true
  errorGeneral.value = ''

  try {
    const res = await authStore.login(form.email, form.password)

    // Usuario tiene MFA activado
    if (res.ok && res.requiere_mfa) {
      requiereMFA.value = true
      emailMFA.value = form.email
      codigoMFA.value = ''
    }

    // Usuario NO tiene MFA
    else if (res.ok) {
      router.push('/home')
    }

    // Login incorrecto
    else {
      errorGeneral.value = res.mensaje ?? 'Error al iniciar sesión'
    }
  } catch {
    errorGeneral.value = 'No se pudo conectar con el servidor'
  } finally {
    cargando.value = false
  }
}

const handleMFA = async () => {
  if (!codigoMFA.value) {
    errorGeneral.value = 'Ingresa el código de verificación'
    return
  }

  if (codigoMFA.value.length !== 6) {
    errorGeneral.value = 'El código debe tener 6 dígitos'
    return
  }

  cargandoMFA.value = true
  errorGeneral.value = ''

  try {
    const { data } = await api.post('/auth/mfa/validar-login', {
      email: emailMFA.value,
      codigo: codigoMFA.value,
    })

    if (data.ok) {
      // Guardar token
      authStore.token = data.token

      // Guardar usuario
      authStore.usuario = data.usuario

      // Guardar token en localStorage
      localStorage.setItem('token', data.token)

      // Configurar token para las siguientes peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      // Ir al home
      router.push('/home')
    } else {
      errorGeneral.value = data.mensaje ?? 'Código incorrecto'
    }
  } catch {
    errorGeneral.value = 'No se pudo verificar el código'
  } finally {
    cargandoMFA.value = false
  }
}

const volverAlLogin = () => {
  requiereMFA.value = false
  emailMFA.value = ''
  codigoMFA.value = ''
  errorGeneral.value = ''
  focusMFA.value = false
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 100vh;

  background: #f5f7fa;

  overflow: hidden;

  box-sizing: border-box;
}

/* PANEL IZQUIERDO - DESKTOP */

.login-left {
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  overflow: hidden;

  background: linear-gradient(135deg, #0d2461 0%, #1a3a8f 50%, #2952c4 100%);
}

.login-left-content {
  position: relative;
  z-index: 2;

  text-align: center;

  padding: 40px;
}

.logo-left {
  filter: brightness(0) invert(1);

  margin-bottom: 32px;
}

.login-title {
  margin-bottom: 12px;

  color: white;

  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.login-subtitle {
  max-width: 320px;

  margin-bottom: 48px;

  color: rgba(255, 255, 255, 0.75);

  font-size: 15px;
  line-height: 1.6;
}

.stats {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 24px;

  padding: 20px 32px;

  border: 1px solid rgba(255, 255, 255, 0.15);

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.1);

  backdrop-filter: blur(10px);
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;

  color: white;

  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  display: block;

  margin-top: 2px;

  color: rgba(255, 255, 255, 0.65);

  font-size: 11px;

  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 40px;

  background: rgba(255, 255, 255, 0.2);
}

/* DECORACIÓN DEL PANEL IZQUIERDO */

.circles {
  position: absolute;

  inset: 0;

  z-index: 1;
}

.circle {
  position: absolute;

  border-radius: 50%;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.05);
}

.circle-1 {
  width: 400px;
  height: 400px;

  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;

  bottom: -80px;
  left: -80px;
}

.circle-3 {
  width: 200px;
  height: 200px;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
}

/* PANEL DERECHO - DESKTOP */

.login-right {
  width: 480px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 40px;

  background: white;

  box-sizing: border-box;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
  min-width: 0;
}

.login-form-container :deep(.v-card) {
  width: 100%;
  min-width: 0;

  box-sizing: border-box;
}

.logo-icono {
  filter: drop-shadow(0 4px 12px rgba(26, 58, 143, 0.2));
}

.form-title {
  margin-bottom: 4px;

  color: #1a3a8f;

  font-size: 26px;
  font-weight: 700;
}

.form-subtitle {
  margin: 0;

  color: #888;

  font-size: 14px;
}

/* CAMPOS */

.form-field {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.field-label {
  margin-bottom: 6px;

  color: #444;

  font-size: 13px;
  font-weight: 600;
}

.field-wrapper {
  width: 100%;
  min-width: 0;
  height: 48px;

  display: flex;
  align-items: center;

  padding: 0 14px;

  border: 1.5px solid #e0e0e0;

  border-radius: 10px;

  background: #fafafa;

  box-sizing: border-box;

  transition: all 0.2s ease;
}

.field-wrapper.focused {
  border-color: #1a3a8f;

  background: white;

  box-shadow: 0 0 0 3px rgba(26, 58, 143, 0.08);
}

.field-wrapper.filled {
  border-color: #ccc;

  background: white;
}

.field-icon {
  margin-right: 10px;

  flex-shrink: 0;

  color: #aaa;
}

.field-icon-right {
  margin-left: 8px;

  flex-shrink: 0;

  color: #aaa;
}

.field-wrapper.focused .field-icon {
  color: #1a3a8f;
}

.field-input {
  width: 100%;
  min-width: 0;

  flex: 1;

  border: none;
  outline: none;

  background: transparent;

  color: #222;

  font-size: 14px;

  box-sizing: border-box;
}

.field-input::placeholder {
  color: #bbb;
}

.field-error {
  margin-top: 4px;

  color: #d32f2f;

  font-size: 12px;
}

/* ERROR */

.error-alert {
  width: 100%;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 10px 14px;

  border: 1px solid #ef9a9a;

  border-radius: 8px;

  background: #fdecea;

  color: #d32f2f;

  font-size: 13px;

  box-sizing: border-box;
}

/* BOTÓN */

.login-btn {
  width: 100%;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 10px;

  background: linear-gradient(135deg, #1a3a8f, #2952c4);

  color: white;

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;

  box-shadow: 0 4px 15px rgba(26, 58, 143, 0.3);

  box-sizing: border-box;

  transition: all 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);

  box-shadow: 0 6px 20px rgba(26, 58, 143, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;

  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-spinner {
  width: 18px;
  height: 18px;

  margin-right: 8px;

  border: 2px solid rgba(255, 255, 255, 0.3);

  border-top-color: white;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

/* LINKS */

.forgot-link {
  color: #1a3a8f;

  font-size: 13px;

  text-decoration: none;

  opacity: 0.8;

  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 1;

  text-decoration: underline;
}

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 4px;

  color: #bbb;

  font-size: 12px;

  text-align: center;
}

.login-footer strong {
  color: #1a3a8f;
}

/* ANIMACIONES DESKTOP */

.fade-in {
  animation: fadeIn 0.8s ease forwards;
}

.fade-in-delay-1 {
  opacity: 0;

  animation: fadeIn 0.8s ease 0.2s forwards;
}

.fade-in-delay-2 {
  opacity: 0;

  animation: fadeIn 0.8s ease 0.4s forwards;
}

.fade-in-delay-3 {
  opacity: 0;

  animation: fadeIn 0.8s ease 0.6s forwards;
}

.slide-in {
  animation: slideInRight 0.6s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;

    transform: translateY(16px);
  }

  to {
    opacity: 1;

    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;

    transform: translateX(30px);
  }

  to {
    opacity: 1;

    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.shake-enter-active {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-8px);
  }

  40% {
    transform: translateX(8px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }
}

/* =========================================================
   MOBILE
   TODO LO QUE ESTÁ AQUÍ AFECTA SOLO <= 768 PX
========================================================= */

@media (max-width: 768px) {
  .login-container {
    position: relative;

    width: 100%;
    max-width: 100%;

    min-height: 100vh;
    min-height: 100dvh;

    height: 100vh;
    height: 100dvh;

    overflow: hidden;

    background:
      radial-gradient(
        circle at 12% 14%,
        rgba(41, 82, 196, 0.16) 0%,
        rgba(41, 82, 196, 0.07) 25%,
        transparent 47%
      ),
      radial-gradient(
        circle at 90% 88%,
        rgba(13, 36, 97, 0.13) 0%,
        rgba(13, 36, 97, 0.05) 27%,
        transparent 48%
      ),
      linear-gradient(155deg, #f8faff 0%, #eef4ff 46%, #f8faff 72%, #ffffff 100%);
  }

  .login-left {
    display: none;
  }

  .login-right {
    position: relative;

    isolation: isolate;

    width: 100%;
    max-width: 100%;
    min-width: 0;

    height: 100%;
    min-height: 0;

    flex: 1 1 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: max(22px, env(safe-area-inset-top)) 18px max(22px, env(safe-area-inset-bottom));

    overflow: hidden;

    background: transparent;

    box-sizing: border-box;
  }

  /* Halo superior animado */

  .login-right::before {
    content: '';

    position: absolute;

    width: 330px;
    height: 330px;

    top: -185px;
    right: -145px;

    z-index: -1;

    border-radius: 50%;

    background: radial-gradient(
      circle,
      rgba(54, 96, 211, 0.2) 0%,
      rgba(54, 96, 211, 0.08) 40%,
      transparent 70%
    );

    animation: mobileBlobTop 14s ease-in-out infinite alternate;

    pointer-events: none;
  }

  /* Halo inferior animado */

  .login-right::after {
    content: '';

    position: absolute;

    width: 310px;
    height: 310px;

    left: -160px;
    bottom: -145px;

    z-index: -1;

    border-radius: 50%;

    background: radial-gradient(
      circle,
      rgba(13, 36, 97, 0.15) 0%,
      rgba(13, 36, 97, 0.055) 42%,
      transparent 72%
    );

    animation: mobileBlobBottom 17s ease-in-out infinite alternate;

    pointer-events: none;
  }

  .login-form-container {
    position: relative;

    z-index: 2;

    width: 100%;
    max-width: 390px;
    min-width: 0;

    margin: 0 auto;

    box-sizing: border-box;
  }

  /* CARD MOBILE */

  .login-form-container :deep(.v-card) {
    position: relative;

    width: 100%;
    max-width: 100%;
    min-width: 0;

    margin: 0;

    padding: 28px 24px !important;

    overflow: hidden;

    border: 1px solid rgba(35, 73, 164, 0.11);

    border-radius: 24px !important;

    background: rgba(255, 255, 255, 0.93) !important;

    -webkit-backdrop-filter: blur(18px);

    backdrop-filter: blur(18px);

    box-shadow:
      0 24px 60px rgba(13, 36, 97, 0.12),
      0 6px 20px rgba(13, 36, 97, 0.055) !important;

    box-sizing: border-box;
  }

  /* Línea de marca superior */

  .login-form-container :deep(.v-card)::before {
    content: '';

    position: absolute;

    top: 0;
    left: 20%;
    right: 20%;

    height: 3px;

    border-radius: 0 0 8px 8px;

    background: linear-gradient(90deg, transparent, #3970e5, #174099, #3970e5, transparent);

    opacity: 0.9;

    pointer-events: none;
  }

  /* Brillo ambiental interno */

  .login-form-container :deep(.v-card)::after {
    content: '';

    position: absolute;

    width: 170px;
    height: 170px;

    top: -105px;
    right: -80px;

    border-radius: 50%;

    background: radial-gradient(circle, rgba(41, 82, 196, 0.1), transparent 70%);

    pointer-events: none;
  }

  /* CABECERA */

  .login-form-container :deep(.text-center.mb-8) {
    margin-bottom: 28px !important;
  }

  .login-form-container :deep(.text-center.mb-6) {
    margin-bottom: 24px !important;
  }

  .logo-icono {
    height: 56px !important;

    max-height: 56px;

    filter: drop-shadow(0 7px 14px rgba(26, 58, 143, 0.2));

    animation: mobileLogoFloat 5.5s ease-in-out infinite;
  }

  .form-title {
    margin-top: 12px !important;

    margin-bottom: 5px;

    color: #17377d;

    font-size: 24px;

    font-weight: 750;

    line-height: 1.25;

    letter-spacing: -0.025em;
  }

  .form-subtitle {
    max-width: 270px;

    margin: 0 auto;

    color: #788394;

    font-size: 13px;

    line-height: 1.5;
  }

  /* MFA */

  .login-form-container :deep(.text-body-2) {
    color: #687487 !important;

    font-size: 13px !important;

    line-height: 1.5;
  }

  /* CAMPOS MOBILE */

  .form-field,
  .field-wrapper,
  .field-input,
  .login-btn,
  .error-alert {
    max-width: 100%;

    min-width: 0;

    box-sizing: border-box;
  }

  .field-label {
    margin-bottom: 7px;

    color: #354154;

    font-size: 12.5px;

    font-weight: 650;
  }

  .field-wrapper {
    width: 100%;
    height: 51px;

    padding: 0 14px;

    border: 1px solid #dde4ef;

    border-radius: 13px;

    background: rgba(247, 249, 253, 0.95);

    box-shadow: inset 0 1px 2px rgba(13, 36, 97, 0.025);

    transition:
      border-color 0.28s ease,
      background-color 0.28s ease,
      box-shadow 0.28s ease,
      transform 0.28s ease;
  }

  .field-wrapper.focused {
    border-color: rgba(41, 82, 196, 0.72);

    background: #ffffff;

    box-shadow:
      0 0 0 4px rgba(41, 82, 196, 0.075),
      0 4px 12px rgba(26, 58, 143, 0.035);

    transform: translateY(-1px);
  }

  .field-wrapper.filled {
    border-color: #cfd8e7;

    background: #ffffff;
  }

  .field-icon {
    margin-right: 10px;

    color: #98a3b5;

    transition:
      color 0.25s ease,
      transform 0.25s ease;
  }

  .field-wrapper.focused .field-icon {
    color: #2952c4;

    transform: scale(1.08);
  }

  .field-icon-right {
    color: #98a3b5;

    transition: color 0.2s ease;
  }

  .field-wrapper.focused .field-icon-right {
    color: #526071;
  }

  .field-input {
    width: 100%;
    min-width: 0;

    /*
     * 16px evita que Safari/iOS
     * haga zoom automático al enfocar.
     */
    font-size: 16px;

    color: #202b3b;
  }

  .field-input::placeholder {
    color: #adb7c5;
  }

  .field-error {
    margin-top: 5px;

    font-size: 11.5px;
  }

  /* ERROR */

  .error-alert {
    padding: 10px 12px;

    border: 1px solid rgba(211, 47, 47, 0.22);

    border-radius: 11px;

    background: rgba(253, 236, 234, 0.9);

    font-size: 12px;
  }

  /* BOTÓN MOBILE */

  .login-btn {
    position: relative;

    height: 51px;

    overflow: hidden;

    border-radius: 13px;

    background: linear-gradient(115deg, #17377f 0%, #2451bd 52%, #3468d9 100%);

    font-size: 14px;

    font-weight: 650;

    letter-spacing: 0.01em;

    box-shadow: 0 9px 23px rgba(32, 75, 176, 0.25);

    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  /*
   * Brillo ocasional.
   * Es lento para no distraer.
   */
  .login-btn::after {
    content: '';

    position: absolute;

    top: -45%;
    bottom: -45%;

    left: -100px;

    width: 48px;

    transform: rotate(18deg);

    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.26), transparent);

    animation: mobileButtonShine 6s ease-in-out infinite;

    pointer-events: none;
  }

  .login-btn:hover:not(:disabled) {
    transform: none;

    box-shadow: 0 9px 23px rgba(32, 75, 176, 0.25);
  }

  .login-btn:active:not(:disabled) {
    transform: scale(0.985);

    box-shadow: 0 5px 15px rgba(32, 75, 176, 0.22);
  }

  /* LINK RECUPERACIÓN */

  .forgot-link {
    display: inline-flex;

    align-items: center;

    justify-content: center;

    padding: 6px 4px;

    color: #3158ae;

    font-size: 12px;

    font-weight: 550;

    opacity: 0.9;
  }

  .forgot-link:hover {
    text-decoration: none;
  }

  /* ENTRADA DEL CARD */

  .slide-in {
    animation: mobileLoginEntrance 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
}

/* MOBILE HASTA 480 */

@media (max-width: 480px) {
  .login-right {
    padding: max(18px, env(safe-area-inset-top)) 16px max(18px, env(safe-area-inset-bottom));
  }

  .login-form-container {
    max-width: 380px;
  }

  .login-form-container :deep(.v-card) {
    padding: 26px 20px !important;

    border-radius: 22px !important;
  }

  .login-form-container :deep(.text-center.mb-8) {
    margin-bottom: 25px !important;
  }

  .login-form-container :deep(.text-center.mb-6) {
    margin-bottom: 21px !important;
  }

  .logo-icono {
    height: 52px !important;
  }

  .form-title {
    font-size: 23px;
  }

  .form-subtitle {
    font-size: 12.5px;
  }
}

/* MOBILE MUY PEQUEÑO */

@media (max-width: 360px) {
  .login-right {
    padding: max(14px, env(safe-area-inset-top)) 12px max(14px, env(safe-area-inset-bottom));
  }

  .login-form-container :deep(.v-card) {
    padding: 22px 17px !important;

    border-radius: 19px !important;
  }

  .logo-icono {
    height: 47px !important;
  }

  .form-title {
    font-size: 21px;
  }

  .form-subtitle {
    font-size: 12px;
  }

  .field-wrapper,
  .login-btn {
    height: 47px;
  }
}

/* MOBILE CON POCA ALTURA */

@media (max-width: 768px) and (max-height: 680px) {
  .login-right {
    padding: 10px 16px;
  }

  .login-form-container :deep(.v-card) {
    padding: 18px 21px !important;
  }

  .login-form-container :deep(.text-center.mb-8) {
    margin-bottom: 17px !important;
  }

  .login-form-container :deep(.text-center.mb-6) {
    margin-bottom: 15px !important;
  }

  .logo-icono {
    height: 42px !important;
  }

  .form-title {
    margin-top: 7px !important;

    font-size: 20px;
  }

  .form-subtitle {
    font-size: 11.5px;
  }

  .form-field.mb-4 {
    margin-bottom: 10px !important;
  }

  .form-field.mb-6 {
    margin-bottom: 13px !important;
  }

  .field-wrapper,
  .login-btn {
    height: 45px;
  }

  .forgot-link {
    padding: 3px;

    font-size: 11.5px;
  }
}

/* ANIMACIONES MOBILE */

@keyframes mobileLoginEntrance {
  from {
    opacity: 0;

    transform: translateY(18px) scale(0.985);
  }

  to {
    opacity: 1;

    transform: translateY(0) scale(1);
  }
}

@keyframes mobileLogoFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-4px) scale(1.025);
  }
}

@keyframes mobileBlobTop {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  100% {
    transform: translate3d(-24px, 28px, 0) scale(1.08);
  }
}

@keyframes mobileBlobBottom {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  100% {
    transform: translate3d(26px, -22px, 0) scale(1.07);
  }
}

@keyframes mobileButtonShine {
  0%,
  66% {
    left: -100px;

    opacity: 0;
  }

  70% {
    opacity: 1;
  }

  86% {
    left: calc(100% + 90px);

    opacity: 0;
  }

  100% {
    left: calc(100% + 90px);

    opacity: 0;
  }
}

/* ACCESIBILIDAD */

@media (max-width: 768px) and (prefers-reduced-motion: reduce) {
  .slide-in,
  .logo-icono,
  .login-right::before,
  .login-right::after,
  .login-btn::after {
    animation: none !important;
  }

  .field-wrapper,
  .login-btn {
    transition: none !important;
  }
}
</style>