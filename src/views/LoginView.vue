<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4">
            <div class="text-center mb-6">
              <v-icon size="56" color="primary">mdi-leaf</v-icon>
              <h1 class="text-h5 font-weight-bold text-primary mt-2">Grupo Malima</h1>
              <p class="text-body-2 text-medium-emphasis">Sistema de Invernaderos</p>
            </div>

            <v-card rounded="lg" elevation="3" class="pa-6">
              <v-card-title class="text-h6 font-weight-bold pa-0 mb-4">
                Iniciar sesión
              </v-card-title>

              <v-text-field
                v-model="form.email"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                density="comfortable"
                class="mb-3"
                :error-messages="errores.email"
                @keyup.enter="handleLogin"
              />

              <v-text-field
                v-model="form.password"
                label="Contraseña"
                :type="mostrarPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                density="comfortable"
                class="mb-4"
                :error-messages="errores.password"
                @click:append-inner="mostrarPassword = !mostrarPassword"
                @keyup.enter="handleLogin"
              />

              <v-alert
                v-if="errorGeneral"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                :text="errorGeneral"
              />

              <v-btn color="primary" size="large" block :loading="cargando" @click="handleLogin">
                Ingresar
              </v-btn>
            </v-card>

            <p class="text-center text-caption text-medium-emphasis mt-4">
              Desarrollado por Maintronic · v1.0.0
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const errores = reactive({ email: '', password: '' })
const errorGeneral = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)

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
    if (res.ok) {
      router.push('/dashboard')
    } else {
      errorGeneral.value = res.mensaje ?? 'Error al iniciar sesión'
    }
  } catch {
    errorGeneral.value = 'No se pudo conectar con el servidor'
  } finally {
    cargando.value = false
  }
}
</script>
