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
  min-height: 100vh;
  background: #f5f7fa;
}

/* ── Panel izquierdo ── */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #0d2461 0%, #1a3a8f 50%, #2952c4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

@media (max-width: 768px) {
  .login-left {
    display: none;
  }
  .login-right {
    flex: 1;
  }
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
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
  margin-bottom: 48px;
  line-height: 1.6;
  max-width: 320px;
}

.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
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
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

/* Círculos decorativos */
.circles {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
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

/* ── Panel derecho ── */
.login-right {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 40px;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
}

.logo-icono {
  filter: drop-shadow(0 4px 12px rgba(26, 58, 143, 0.2));
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a3a8f;
  margin-bottom: 4px;
}

.form-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* ── Campos ── */
.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}

.field-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  padding: 0 14px;
  height: 48px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.field-wrapper.focused {
  border-color: #1a3a8f;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 58, 143, 0.08);
}

.field-wrapper.filled {
  background: white;
  border-color: #ccc;
}

.field-icon {
  color: #aaa;
  margin-right: 10px;
  flex-shrink: 0;
}
.field-icon-right {
  color: #aaa;
  margin-left: 8px;
  flex-shrink: 0;
}

.field-wrapper.focused .field-icon {
  color: #1a3a8f;
}

.field-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #222;
}

.field-input::placeholder {
  color: #bbb;
}

.field-error {
  font-size: 12px;
  color: #d32f2f;
  margin-top: 4px;
}

/* ── Error general ── */
.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdecea;
  border: 1px solid #ef9a9a;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #d32f2f;
}

/* ── Botón ── */
.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #1a3a8f, #2952c4);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(26, 58, 143, 0.3);
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
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

/* ── Links ── */
.forgot-link {
  font-size: 13px;
  color: #1a3a8f;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.forgot-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.login-footer {
  text-align: center;
  font-size: 12px;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.login-footer strong {
  color: #1a3a8f;
}

/* ── Animaciones ── */
.fade-in {
  animation: fadeIn 0.8s ease forwards;
}
.fade-in-delay-1 {
  animation: fadeIn 0.8s ease 0.2s forwards;
  opacity: 0;
}
.fade-in-delay-2 {
  animation: fadeIn 0.8s ease 0.4s forwards;
  opacity: 0;
}
.fade-in-delay-3 {
  animation: fadeIn 0.8s ease 0.6s forwards;
  opacity: 0;
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
</style>
