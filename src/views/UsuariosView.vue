<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold text-primary">Usuarios</h1>
        <p class="text-body-2 text-medium-emphasis">Gestión de usuarios del sistema</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="abrirCrear">
          Nuevo usuario
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card rounded="lg" elevation="2">
          <v-data-table
            :headers="headers"
            :items="usuarios"
            :loading="cargando"
            no-data-text="No hay usuarios registrados"
          >
            <template #item.rol="{ item }">
              <v-chip :color="colorRol(item.rol)" size="small">{{ item.rol }}</v-chip>
            </template>
            <template #item.activo="{ item }">
              <v-chip :color="item.activo ? 'success' : 'error'" size="small">
                {{ item.activo ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </template>
            <template #item.acciones="{ item }">
              <v-btn icon="mdi-pencil" size="small" variant="text" @click="abrirEditar(item)" />
              <v-btn
                v-if="item.activo"
                icon="mdi-account-off"
                size="small"
                variant="text"
                color="error"
                @click="desactivar(item.id)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog crear/editar -->
    <v-dialog v-model="dialog.visible" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="pa-4 text-body-1 font-weight-bold">
          {{ dialog.modo === 'crear' ? 'Nuevo usuario' : 'Editar usuario' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="form.nombre"
            label="Nombre"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-select
            v-model="form.rol"
            :items="roles"
            label="Rol"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-if="dialog.modo === 'crear'"
            v-model="form.password"
            label="Contraseña"
            type="password"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex gap-2">
          <v-spacer />
          <v-btn variant="text" @click="dialog.visible = false">Cancelar</v-btn>
          <v-btn color="primary" variant="tonal" :loading="guardando" @click="guardar">
            {{ dialog.modo === 'crear' ? 'Crear' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000">
      {{ snackbar.mensaje }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import api from '../api/axios'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

const usuarios = ref<Usuario[]>([])
const cargando = ref(false)
const guardando = ref(false)
const snackbar = reactive({ visible: false, mensaje: '', color: 'success' })
const roles = ['admin', 'operador', 'supervisor']

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Correo', key: 'email' },
  { title: 'Rol', key: 'rol' },
  { title: 'Estado', key: 'activo' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

const dialog = reactive({
  visible: false,
  modo: 'crear' as 'crear' | 'editar',
  id: null as number | null,
})

const form = reactive({
  nombre: '',
  email: '',
  rol: 'operador',
  password: '',
})

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.visible = true
}

const colorRol = (rol: string) => {
  if (rol === 'admin') return 'primary'
  if (rol === 'operador') return 'success'
  return 'warning'
}

const cargar = async () => {
  cargando.value = true
  try {
    const { data } = await api.get('/usuarios')
    if (data.ok) usuarios.value = data.data
  } finally {
    cargando.value = false
  }
}

const abrirCrear = () => {
  form.nombre = ''
  form.email = ''
  form.rol = 'operador'
  form.password = ''
  dialog.modo = 'crear'
  dialog.id = null
  dialog.visible = true
}

const abrirEditar = (usuario: Usuario) => {
  form.nombre = usuario.nombre
  form.email = usuario.email
  form.rol = usuario.rol
  form.password = ''
  dialog.modo = 'editar'
  dialog.id = usuario.id
  dialog.visible = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (dialog.modo === 'crear') {
      const { data } = await api.post('/auth/register', {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
      })
      if (data.ok) {
        mostrarSnackbar('Usuario creado correctamente')
        dialog.visible = false
        await cargar()
      } else {
        mostrarSnackbar(data.mensaje ?? 'Error', 'error')
      }
    } else {
      const { data } = await api.patch(`/usuarios/${dialog.id}`, {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
      })
      if (data.ok) {
        mostrarSnackbar('Usuario actualizado')
        dialog.visible = false
        await cargar()
      } else {
        mostrarSnackbar(data.mensaje ?? 'Error', 'error')
      }
    }
  } catch {
    mostrarSnackbar('Error guardando usuario', 'error')
  } finally {
    guardando.value = false
  }
}

const desactivar = async (id: number) => {
  try {
    const { data } = await api.delete(`/usuarios/${id}`)
    if (data.ok) {
      mostrarSnackbar('Usuario desactivado')
      await cargar()
    }
  } catch {
    mostrarSnackbar('Error desactivando usuario', 'error')
  }
}

onMounted(cargar)
</script>
