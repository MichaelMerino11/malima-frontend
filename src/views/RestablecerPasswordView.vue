<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4">
            <div class="text-center mb-6">
              <img src="/logo_malima.png" height="120" style="object-fit: contain" />
            </div>

            <!-- Solicitar reset -->
            <v-card v-if="!tokenEnUrl" rounded="lg" elevation="3" class="pa-6">
              <v-card-title class="text-h6 font-weight-bold pa-0 mb-2">
                Restablecer contraseña
              </v-card-title>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                density="comfortable"
                class="mb-4"
                @keyup.enter="solicitarReset"
              />

              <v-alert
                v-if="mensaje"
                :type="mensajeTipo"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                :text="mensaje"
              />

              <v-btn color="primary" size="large" block :loading="cargando" @click="solicitarReset">
                Enviar enlace
              </v-btn>

              <div class="text-center mt-4">
                <v-btn variant="text" size="small" to="/login"> Volver al login </v-btn>
              </div>
            </v-card>

            <!-- Nueva contraseña con token -->
            <v-card v-else rounded="lg" elevation="3" class="pa-6">
              <v-card-title class="text-h6 font-weight-bold pa-0 mb-2">
                Nueva contraseña
              </v-card-title>
              <p class="text-body-2 text-medium-emphasis mb-4">Ingresa tu nueva contraseña.</p>

              <v-text-field
                v-model="passwordNuevo"
                label="Nueva contraseña"
                :type="mostrar ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="mostrar ? 'mdi-eye-off' : 'mdi-eye'"
                density="comfortable"
                class="mb-3"
                @click:append-inner="mostrar = !mostrar"
              />

              <v-text-field
                v-model="passwordConfirmar"
                label="Confirmar contraseña"
                :type="mostrar ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                density="comfortable"
                class="mb-4"
                :error-messages="
                  passwordNuevo && passwordConfirmar && passwordNuevo !== passwordConfirmar
                    ? 'Las contraseñas no coinciden'
                    : ''
                "
              />

              <v-alert
                v-if="mensaje"
                :type="mensajeTipo"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                :text="mensaje"
              />

              <v-btn
                color="primary"
                size="large"
                block
                :loading="cargando"
                @click="restablecerPassword"
              >
                Cambiar contraseña
              </v-btn>
            </v-card>

          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const router = useRouter()

const email = ref('')
const passwordNuevo = ref('')
const passwordConfirmar = ref('')
const mostrar = ref(false)
const cargando = ref(false)
const mensaje = ref('')
const mensajeTipo = ref<'success' | 'error'>('success')

const tokenEnUrl = computed(() => route.query.token as string | undefined)

const solicitarReset = async () => {
  if (!email.value) return
  cargando.value = true
  try {
    const { data } = await api.post('/usuarios/solicitar-reset', { email: email.value })
    mensaje.value = data.mensaje
    mensajeTipo.value = 'success'
  } catch {
    mensaje.value = 'Error enviando el correo'
    mensajeTipo.value = 'error'
  } finally {
    cargando.value = false
  }
}

const restablecerPassword = async () => {
  if (passwordNuevo.value !== passwordConfirmar.value) return
  cargando.value = true
  try {
    const { data } = await api.post('/usuarios/restablecer-password', {
      token: tokenEnUrl.value,
      password_nuevo: passwordNuevo.value,
    })
    if (data.ok) {
      mensaje.value = 'Contraseña restablecida correctamente. Redirigiendo...'
      mensajeTipo.value = 'success'
      setTimeout(() => router.push('/login'), 2000)
    } else {
      mensaje.value = data.mensaje ?? 'Error'
      mensajeTipo.value = 'error'
    }
  } catch {
    mensaje.value = 'Error restableciendo contraseña'
    mensajeTipo.value = 'error'
  } finally {
    cargando.value = false
  }
}
</script>
