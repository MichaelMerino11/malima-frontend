<template>
  <v-app>
    <v-main class="reset-page">
      <div class="reset-background">
        <div class="background-shape background-shape--one" />
        <div class="background-shape background-shape--two" />
      </div>

      <v-container fluid class="reset-container">
        <div class="reset-layout">
          <div class="brand-panel">
            <div class="brand-panel__content">
              <div class="brand-logo">
                <img src="/logo_malima.png" alt="Grupo Malima" />
              </div>

              <div class="brand-text">
                <span class="brand-eyebrow"> Sistema de Invernaderos </span>

                <h1>Recupera el acceso a tu cuenta</h1>

                <p>
                  Restablece tu contraseña de forma segura y continúa administrando el sistema de
                  monitoreo y control.
                </p>
              </div>

              <div class="security-features">
                <div class="security-feature">
                  <div class="security-feature__icon">
                    <v-icon size="19"> mdi-shield-lock-outline </v-icon>
                  </div>

                  <div>
                    <strong> Proceso seguro </strong>

                    <span> El enlace de recuperación utiliza un token de verificación. </span>
                  </div>
                </div>

                <div class="security-feature">
                  <div class="security-feature__icon">
                    <v-icon size="19"> mdi-email-lock-outline </v-icon>
                  </div>

                  <div>
                    <strong> Verificación por correo </strong>

                    <span> Recibirás las instrucciones en tu correo registrado. </span>
                  </div>
                </div>

                <div class="security-feature">
                  <div class="security-feature__icon">
                    <v-icon size="19"> mdi-account-lock-outline </v-icon>
                  </div>

                  <div>
                    <strong> Protección de cuenta </strong>

                    <span> Tu contraseña anterior será reemplazada al finalizar. </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="brand-panel__footer">
              <span> Grupo Malima </span>

              <span class="brand-footer-dot" />

              <span> Monitoreo y control </span>
            </div>
          </div>

          <div class="form-panel">
            <div class="mobile-logo">
              <img src="/logo_malima.png" alt="Grupo Malima" />
            </div>

            <v-card rounded="xl" elevation="0" class="reset-card">
              <div class="steps">
                <div
                  class="step"
                  :class="{
                    'step--active': !tokenEnUrl,
                    'step--complete': Boolean(tokenEnUrl),
                  }"
                >
                  <div class="step__number">
                    <v-icon v-if="tokenEnUrl" size="16"> mdi-check </v-icon>

                    <span v-else> 1 </span>
                  </div>

                  <span> Solicitar enlace </span>
                </div>

                <div
                  class="step-line"
                  :class="{
                    'step-line--complete': Boolean(tokenEnUrl),
                  }"
                />

                <div
                  class="step"
                  :class="{
                    'step--active': Boolean(tokenEnUrl),
                  }"
                >
                  <div class="step__number">2</div>

                  <span> Nueva contraseña </span>
                </div>
              </div>

              <template v-if="!tokenEnUrl">
                <div class="form-header">
                  <div class="form-header__icon">
                    <v-icon size="27"> mdi-lock-reset </v-icon>
                  </div>

                  <div>
                    <span class="form-eyebrow"> Recuperación de cuenta </span>

                    <h2>Restablecer contraseña</h2>

                    <p>
                      Ingresa el correo asociado a tu cuenta y te enviaremos las instrucciones para
                      crear una nueva contraseña.
                    </p>
                  </div>
                </div>

                <div class="form-content">
                  <v-text-field
                    v-model="email"
                    label="Correo electrónico"
                    placeholder="usuario@empresa.com"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-email-outline"
                    :error-messages="errorEmail"
                    hide-details="auto"
                    autocomplete="email"
                    class="reset-field"
                    @keyup.enter="solicitarReset"
                  />

                  <div class="email-help">
                    <v-icon size="17"> mdi-information-outline </v-icon>

                    <span> Utiliza el mismo correo con el que ingresas al sistema. </span>
                  </div>

                  <v-alert
                    v-if="mensaje"
                    :type="mensajeTipo"
                    variant="tonal"
                    rounded="lg"
                    class="feedback-alert"
                  >
                    <template #prepend>
                      <v-icon size="20">
                        {{
                          mensajeTipo === 'success'
                            ? 'mdi-check-circle-outline'
                            : 'mdi-alert-circle-outline'
                        }}
                      </v-icon>
                    </template>

                    {{ mensaje }}
                  </v-alert>

                  <v-btn
                    color="primary"
                    size="large"
                    block
                    rounded="lg"
                    prepend-icon="mdi-email-arrow-right-outline"
                    :loading="cargando"
                    :disabled="!emailValido"
                    class="main-action"
                    @click="solicitarReset"
                  >
                    Enviar enlace de recuperación
                  </v-btn>
                </div>
              </template>

              <template v-else>
                <div class="form-header">
                  <div class="form-header__icon form-header__icon--success">
                    <v-icon size="27"> mdi-shield-key-outline </v-icon>
                  </div>

                  <div>
                    <span class="form-eyebrow"> Último paso </span>

                    <h2>Crea una nueva contraseña</h2>

                    <p>Define una contraseña segura para recuperar el acceso a tu cuenta.</p>
                  </div>
                </div>

                <div class="form-content">
                  <v-text-field
                    v-model="passwordNuevo"
                    label="Nueva contraseña"
                    :type="mostrarNuevo ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-lock-plus-outline"
                    :append-inner-icon="mostrarNuevo ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    :error-messages="errorPassword"
                    hide-details="auto"
                    autocomplete="new-password"
                    class="reset-field"
                    @click:append-inner="mostrarNuevo = !mostrarNuevo"
                  />

                  <div v-if="passwordNuevo" class="password-strength">
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
                    v-model="passwordConfirmar"
                    label="Confirmar nueva contraseña"
                    :type="mostrarConfirmar ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="
                      mostrarConfirmar ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                    "
                    :error-messages="errorConfirmar"
                    hide-details="auto"
                    autocomplete="new-password"
                    class="reset-field mt-4"
                    @click:append-inner="mostrarConfirmar = !mostrarConfirmar"
                    @keyup.enter="restablecerPassword"
                  />

                  <div class="password-requirements">
                    <div
                      :class="{
                        'requirement--valid': passwordNuevo.length >= 8,
                      }"
                    >
                      <v-icon size="16">
                        {{ passwordNuevo.length >= 8 ? 'mdi-check-circle' : 'mdi-circle-small' }}
                      </v-icon>

                      <span> Mínimo 8 caracteres </span>
                    </div>

                    <div
                      :class="{
                        'requirement--valid': tieneNumero,
                      }"
                    >
                      <v-icon size="16">
                        {{ tieneNumero ? 'mdi-check-circle' : 'mdi-circle-small' }}
                      </v-icon>

                      <span> Al menos un número </span>
                    </div>

                    <div
                      :class="{
                        'requirement--valid': passwordsCoinciden,
                      }"
                    >
                      <v-icon size="16">
                        {{ passwordsCoinciden ? 'mdi-check-circle' : 'mdi-circle-small' }}
                      </v-icon>

                      <span> Las contraseñas coinciden </span>
                    </div>
                  </div>

                  <v-alert
                    v-if="mensaje"
                    :type="mensajeTipo"
                    variant="tonal"
                    rounded="lg"
                    class="feedback-alert"
                  >
                    <template #prepend>
                      <v-icon size="20">
                        {{
                          mensajeTipo === 'success'
                            ? 'mdi-check-circle-outline'
                            : 'mdi-alert-circle-outline'
                        }}
                      </v-icon>
                    </template>

                    {{ mensaje }}
                  </v-alert>

                  <v-btn
                    color="primary"
                    size="large"
                    block
                    rounded="lg"
                    prepend-icon="mdi-lock-reset"
                    :loading="cargando"
                    :disabled="!passwordValido"
                    class="main-action"
                    @click="restablecerPassword"
                  >
                    Cambiar contraseña
                  </v-btn>
                </div>
              </template>

              <v-divider />

              <div class="form-footer">
                <span> ¿Recordaste tu contraseña? </span>

                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-arrow-left"
                  to="/login"
                >
                  Volver al inicio de sesión
                </v-btn>
              </div>
            </v-card>

            <p class="security-footer">
              <v-icon size="14"> mdi-shield-check-outline </v-icon>

              Conexión segura · Tus datos están protegidos
            </p>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '../api/axios'

const route = useRoute()
const router = useRouter()

const email = ref('')

const passwordNuevo = ref('')
const passwordConfirmar = ref('')

const mostrarNuevo = ref(false)
const mostrarConfirmar = ref(false)

const cargando = ref(false)

const mensaje = ref('')

const mensajeTipo = ref<'success' | 'error'>('success')

const tokenEnUrl = computed(() => {
  const token = route.query.token

  if (Array.isArray(token)) {
    return token[0] || undefined
  }

  return typeof token === 'string' ? token : undefined
})

const emailValido = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
})

const errorEmail = computed(() => {
  if (!email.value) {
    return ''
  }

  return emailValido.value ? '' : 'Ingresa un correo electrónico válido'
})

const tieneNumero = computed(() => {
  return /\d/.test(passwordNuevo.value)
})

const passwordsCoinciden = computed(() => {
  return Boolean(
    passwordNuevo.value &&
    passwordConfirmar.value &&
    passwordNuevo.value === passwordConfirmar.value,
  )
})

const errorPassword = computed(() => {
  if (!passwordNuevo.value) {
    return ''
  }

  if (passwordNuevo.value.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres'
  }

  return ''
})

const errorConfirmar = computed(() => {
  if (!passwordConfirmar.value) {
    return ''
  }

  if (passwordNuevo.value !== passwordConfirmar.value) {
    return 'Las contraseñas no coinciden'
  }

  return ''
})

const passwordValido = computed(() => {
  return Boolean(passwordNuevo.value.length >= 8 && tieneNumero.value && passwordsCoinciden.value)
})

const fortalezaPassword = computed(() => {
  const password = passwordNuevo.value

  let puntos = 0

  if (password.length >= 8) {
    puntos++
  }

  if (password.length >= 12) {
    puntos++
  }

  if (/[A-Z]/.test(password)) {
    puntos++
  }

  if (/\d/.test(password)) {
    puntos++
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    puntos++
  }

  if (puntos <= 1) {
    return {
      valor: 25,
      label: 'Débil',
      color: 'error',
    }
  }

  if (puntos <= 3) {
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

const limpiarMensaje = () => {
  mensaje.value = ''
}

const solicitarReset = async () => {
  if (cargando.value || !emailValido.value) {
    return
  }

  cargando.value = true
  limpiarMensaje()

  try {
    await api.post('/usuarios/solicitar-reset', {
      email: email.value.trim().toLowerCase(),
    })

    mensaje.value =
      'Si el correo está registrado, recibirás un enlace con las instrucciones para restablecer tu contraseña.'

    mensajeTipo.value = 'success'
  } catch (error) {
    console.error('Error solicitando recuperación:', error)

    mensaje.value = 'No fue posible procesar la solicitud. Intenta nuevamente.'

    mensajeTipo.value = 'error'
  } finally {
    cargando.value = false
  }
}

const restablecerPassword = async () => {
  if (cargando.value || !passwordValido.value || !tokenEnUrl.value) {
    return
  }

  cargando.value = true
  limpiarMensaje()

  try {
    const { data } = await api.post('/usuarios/restablecer-password', {
      token: tokenEnUrl.value,

      password_nuevo: passwordNuevo.value,
    })

    if (data.ok) {
      mensaje.value = 'Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...'

      mensajeTipo.value = 'success'

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      mensaje.value = data.mensaje ?? 'El enlace no es válido o ha expirado.'

      mensajeTipo.value = 'error'
    }
  } catch (error) {
    console.error('Error restableciendo contraseña:', error)

    mensaje.value = 'No fue posible restablecer la contraseña. El enlace puede haber expirado.'

    mensajeTipo.value = 'error'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.reset-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
}

.reset-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  background: rgba(var(--v-theme-primary), 0.045);
}

.background-shape--one {
  width: 520px;
  height: 520px;
  top: -240px;
  right: -120px;
}

.background-shape--two {
  width: 420px;
  height: 420px;
  left: -200px;
  bottom: -180px;
}

.reset-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 32px !important;
}

.reset-layout {
  width: 100%;
  max-width: 1120px;
  min-height: 650px;
  display: grid;
  grid-template-columns:
    minmax(360px, 0.9fr)
    minmax(440px, 1.1fr);
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 24px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.1);
}

.brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 42px;
  color: rgb(var(--v-theme-on-primary));
  background: linear-gradient(
    145deg,
    rgb(var(--v-theme-primary)),
    rgba(var(--v-theme-primary), 0.78)
  );
}

.brand-panel::before {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  right: -100px;
  top: -90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.brand-panel::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  left: -80px;
  bottom: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.055);
}

.brand-panel__content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  min-height: 66px;
  padding: 8px 14px;
  border-radius: 14px;
  background: white;
}

.brand-logo img {
  max-width: 150px;
  max-height: 52px;
  object-fit: contain;
}

.brand-text {
  margin-top: 58px;
}

.brand-eyebrow {
  display: block;
  margin-bottom: 9px;
  font-size: 0.78rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.76;
}

.brand-text h1 {
  max-width: 410px;
  margin: 0;
  font-size: 2rem;
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: -0.035em;
}

.brand-text p {
  max-width: 410px;
  margin: 15px 0 0;
  font-size: 0.9rem;
  line-height: 1.65;
  opacity: 0.78;
}

.security-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 46px;
}

.security-feature {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.security-feature__icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.12);
}

.security-feature > div:last-child {
  display: flex;
  flex-direction: column;
}

.security-feature strong {
  font-size: 0.82rem;
  font-weight: 650;
}

.security-feature span {
  max-width: 315px;
  margin-top: 3px;
  font-size: 0.75rem;
  line-height: 1.45;
  opacity: 0.68;
}

.brand-panel__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 30px;
  font-size: 0.7rem;
  opacity: 0.62;
}

.brand-footer-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.form-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 54px;
}

.mobile-logo {
  display: none;
}

.reset-card {
  width: 100%;
  max-width: 490px;
  border: 1px solid rgba(var(--v-border-color), 0.6);
}

.steps {
  display: flex;
  align-items: flex-start;
  padding: 18px 22px;
  background: rgba(var(--v-theme-on-surface), 0.018);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 95px;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.step__number {
  width: 27px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 700;
}

.step > span {
  font-size: 0.68rem;
  font-weight: 600;
}

.step--active {
  color: rgb(var(--v-theme-primary));
}

.step--active .step__number {
  color: rgb(var(--v-theme-on-primary));
  border-color: rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-primary));
}

.step--complete {
  color: rgb(var(--v-theme-success));
}

.step--complete .step__number {
  color: rgb(var(--v-theme-on-success));
  border-color: rgb(var(--v-theme-success));
  background: rgb(var(--v-theme-success));
}

.step-line {
  flex: 1;
  height: 1px;
  margin-top: 13px;
  background: rgba(var(--v-theme-on-surface), 0.14);
}

.step-line--complete {
  background: rgba(var(--v-theme-success), 0.6);
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 24px 24px 6px;
}

.form-header__icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.form-header__icon--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.09);
}

.form-eyebrow {
  display: block;
  margin-bottom: 3px;
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-primary));
}

.form-header h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.form-header p {
  margin: 6px 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.form-content {
  padding: 20px 24px 25px;
}

.reset-field :deep(.v-field__input) {
  font-size: 0.88rem;
}

.reset-field :deep(.v-field-label) {
  font-size: 0.82rem;
}

.email-help {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  color: rgb(var(--v-theme-primary));
}

.email-help span {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.53);
}

.feedback-alert {
  margin-top: 18px;
  font-size: 0.78rem;
}

.main-action {
  min-height: 48px;
  margin-top: 21px;
  font-size: 0.84rem;
  font-weight: 650;
  text-transform: none;
  letter-spacing: 0;
}

.password-strength {
  margin-top: 9px;
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
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 13px;
  padding: 11px 12px;
  border-radius: 11px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.password-requirements > div {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.password-requirements span {
  font-size: 0.74rem;
}

.requirement--valid {
  color: rgb(var(--v-theme-success)) !important;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 58px;
  padding: 9px 16px;
}

.form-footer > span {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.security-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 15px 0 0;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.44);
}

@media (max-width: 959px) {
  .reset-layout {
    max-width: 570px;
    min-height: auto;
    display: block;
  }

  .brand-panel {
    display: none;
  }

  .form-panel {
    padding: 36px 40px;
  }

  .mobile-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 25px;
  }

  .mobile-logo img {
    max-width: 155px;
    max-height: 60px;
    object-fit: contain;
  }
}

@media (max-width: 600px) {
  .reset-container {
    align-items: flex-start;
    padding: 20px 14px !important;
  }

  .reset-layout {
    border-radius: 18px;
  }

  .form-panel {
    padding: 24px 16px;
  }

  .mobile-logo {
    margin-bottom: 20px;
  }

  .mobile-logo img {
    max-width: 135px;
  }

  .reset-card {
    border-radius: 16px !important;
  }

  .steps {
    padding: 15px 16px;
  }

  .step {
    min-width: 82px;
  }

  .step > span {
    font-size: 0.64rem;
  }

  .form-header {
    padding: 20px 18px 4px;
  }

  .form-header__icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }

  .form-header h2 {
    font-size: 1.2rem;
  }

  .form-header p {
    font-size: 0.78rem;
  }

  .form-content {
    padding: 18px 18px 22px;
  }

  .form-footer {
    flex-direction: column;
    gap: 1px;
    padding: 12px 10px;
  }
}

@media (max-width: 380px) {
  .form-header__icon {
    display: none;
  }

  .steps {
    padding: 14px 10px;
  }

  .step {
    min-width: 74px;
  }
}
</style>