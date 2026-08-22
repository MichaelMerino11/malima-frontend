<template>
  <v-container fluid class="usuarios-page pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="page-header__main">
        <div class="page-header__icon">
          <v-icon size="26"> mdi-account-group-outline </v-icon>
        </div>

        <div>
          <div class="d-flex align-center flex-wrap ga-2">
            <h1 class="page-title">Usuarios</h1>

            <v-chip color="primary" variant="tonal" size="small" class="records-chip">
              {{ usuarios.length }}
              {{ usuarios.length === 1 ? 'usuario' : 'usuarios' }}
            </v-chip>
          </div>

          <p class="page-subtitle">Administra las cuentas y permisos de acceso al sistema</p>
        </div>
      </div>

      <div class="page-header__actions">
        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-refresh"
          :loading="cargando"
          @click="cargar"
        >
          Actualizar
        </v-btn>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="mdi-account-plus-outline"
          @click="abrirCrear"
        >
          Nuevo usuario
        </v-btn>
      </div>
    </div>

    <v-row class="mb-5">
      <v-col v-for="item in indicadores" :key="item.label" cols="6" md="3">
        <v-card rounded="xl" elevation="0" class="summary-card">
          <div class="summary-card__icon" :class="`summary-card__icon--${item.color}`">
            <v-icon size="23">
              {{ item.icon }}
            </v-icon>
          </div>

          <div class="summary-card__content">
            <strong>
              {{ item.value }}
            </strong>

            <span>
              {{ item.label }}
            </span>
          </div>

          <span class="summary-card__accent" :class="`summary-card__accent--${item.color}`" />
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="users-card">
      <div class="users-toolbar">
        <div class="users-toolbar__title">
          <div class="section-icon">
            <v-icon size="20"> mdi-account-multiple-outline </v-icon>
          </div>

          <div>
            <h2>Usuarios registrados</h2>

            <p>Consulta y administra las cuentas con acceso al sistema</p>
          </div>
        </div>

        <div class="users-toolbar__filters">
          <v-text-field
            v-model="busqueda"
            label="Buscar usuario"
            placeholder="Nombre o correo..."
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            class="search-field"
          />

          <v-select
            v-model="filtroRol"
            :items="rolesItems"
            item-title="title"
            item-value="value"
            label="Rol"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-shield-account-outline"
            class="filter-field"
          />

          <v-select
            v-model="filtroEstado"
            :items="estadoItems"
            item-title="title"
            item-value="value"
            label="Estado"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            prepend-inner-icon="mdi-account-check-outline"
            class="filter-field"
          />

          <v-btn
            v-if="hayFiltros"
            variant="text"
            color="primary"
            size="small"
            rounded="lg"
            prepend-icon="mdi-filter-remove-outline"
            @click="limpiarFiltros"
          >
            Limpiar
          </v-btn>
        </div>
      </div>

      <v-divider />

      <div v-if="cargando && usuarios.length === 0" class="table-loading">
        <v-skeleton-loader type="table-heading, table-thead, table-tbody" />
      </div>

      <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <v-icon size="44" color="primary"> mdi-account-search-outline </v-icon>
        </div>

        <h3>No se encontraron usuarios</h3>

        <p>No existen usuarios que coincidan con los filtros seleccionados.</p>

        <v-btn
          v-if="hayFiltros"
          color="primary"
          variant="tonal"
          rounded="lg"
          prepend-icon="mdi-filter-remove-outline"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </v-btn>
      </div>

      <div v-else class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="usuariosFiltrados"
          :loading="cargando"
          :items-per-page="10"
          density="comfortable"
          items-per-page-text="Usuarios por página"
          no-data-text="No hay usuarios registrados"
          class="users-table"
        >
          <template #item.nombre="{ item }">
            <div class="user-identity">
              <v-avatar size="38" color="primary" class="user-avatar">
                <span>
                  {{ obtenerIniciales(item.nombre) }}
                </span>
              </v-avatar>

              <div class="user-identity__text">
                <strong>
                  {{ item.nombre }}
                </strong>

                <span> ID {{ item.id }} </span>
              </div>
            </div>
          </template>

          <template #item.email="{ item }">
            <div class="email-cell">
              <v-icon size="16" color="medium-emphasis"> mdi-email-outline </v-icon>

              <span>
                {{ item.email }}
              </span>
            </div>
          </template>

          <template #item.rol="{ item }">
            <v-chip :color="colorRol(item.rol)" size="small" variant="tonal" class="role-chip">
              <v-icon start size="14">
                {{ iconoRol(item.rol) }}
              </v-icon>

              {{ labelRol(item.rol) }}
            </v-chip>
          </template>

          <template #item.activo="{ item }">
            <div class="status-cell">
              <span
                class="status-dot"
                :class="item.activo ? 'status-dot--active' : 'status-dot--inactive'"
              />

              <span :class="item.activo ? 'text-success' : 'text-error'">
                {{ item.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </template>

          <template #item.acciones="{ item }">
            <div class="actions-cell">
              <v-menu location="bottom end" offset="6">
                <template #activator="{ props: menuProps }">
                  <v-btn v-bind="menuProps" icon size="small" variant="text" class="actions-btn">
                    <v-icon size="19"> mdi-dots-vertical </v-icon>
                  </v-btn>
                </template>

                <v-card min-width="200" rounded="lg" elevation="8" class="actions-menu">
                  <v-list density="comfortable" class="pa-1">
                    <v-list-item
                      prepend-icon="mdi-pencil-outline"
                      title="Editar usuario"
                      rounded="lg"
                      @click="abrirEditar(item)"
                    />

                    <v-list-item
                      v-if="item.activo"
                      prepend-icon="mdi-account-off-outline"
                      title="Desactivar"
                      rounded="lg"
                      class="deactivate-item"
                      @click="confirmarDesactivacion(item)"
                    />
                  </v-list>
                </v-card>
              </v-menu>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <v-dialog v-model="dialog.visible" max-width="560" scrollable>
      <v-card rounded="xl" elevation="12" class="user-dialog">
        <div class="dialog-header">
          <div
            class="dialog-header__icon"
            :class="
              dialog.modo === 'crear' ? 'dialog-header__icon--create' : 'dialog-header__icon--edit'
            "
          >
            <v-icon size="25">
              {{
                dialog.modo === 'crear' ? 'mdi-account-plus-outline' : 'mdi-account-edit-outline'
              }}
            </v-icon>
          </div>

          <div class="dialog-header__content">
            <span class="dialog-eyebrow"> Gestión de acceso </span>

            <h2>
              {{ dialog.modo === 'crear' ? 'Nuevo usuario' : 'Editar usuario' }}
            </h2>

            <p>
              {{
                dialog.modo === 'crear'
                  ? 'Crea una nueva cuenta de acceso al sistema'
                  : 'Actualiza la información y permisos del usuario'
              }}
            </p>
          </div>

          <v-btn icon size="small" variant="text" :disabled="guardando" @click="cerrarDialogo">
            <v-icon size="19"> mdi-close </v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-card-text class="dialog-content">
          <div class="form-section">
            <div class="form-section__title">
              <div class="form-section__icon">
                <v-icon size="18"> mdi-account-outline </v-icon>
              </div>

              <div>
                <strong> Información personal </strong>

                <span> Datos principales de la cuenta </span>
              </div>
            </div>

            <v-text-field
              v-model="form.nombre"
              label="Nombre"
              placeholder="Nombre completo"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="mb-4 form-field"
              :disabled="guardando"
            />

            <v-text-field
              v-model="form.email"
              label="Correo electrónico"
              placeholder="usuario@empresa.com"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="form-field"
              :disabled="guardando"
            />
          </div>

          <v-divider class="my-5" />

          <div class="form-section">
            <div class="form-section__title">
              <div class="form-section__icon">
                <v-icon size="18"> mdi-shield-account-outline </v-icon>
              </div>

              <div>
                <strong> Acceso y permisos </strong>

                <span> Define el nivel de acceso del usuario </span>
              </div>
            </div>

            <v-select
              v-model="form.rol"
              :items="rolesItems"
              item-title="title"
              item-value="value"
              label="Rol"
              prepend-inner-icon="mdi-shield-account-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="mb-4 form-field"
              :disabled="guardando"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps" rounded="lg">
                  <template #prepend>
                    <div
                      class="role-option-icon"
                      :class="`role-option-icon--${colorRolUi(String(item.value))}`"
                    >
                      <v-icon size="17">
                        {{ iconoRolUi(String(item.value)) }}
                      </v-icon>
                    </div>
                  </template>

                  <template #subtitle>
                    {{ descripcionRolUi(String(item.value)) }}
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <div
              class="role-help"
              :class="form.rol === 'admin' ? 'role-help--admin' : 'role-help--user'"
            >
              <div class="role-help__icon">
                <v-icon size="19">
                  {{ form.rol === 'admin' ? 'mdi-shield-crown-outline' : 'mdi-account-outline' }}
                </v-icon>
              </div>

              <div>
                <strong>
                  {{ form.rol === 'admin' ? 'Administrador' : 'Usuario' }}
                </strong>

                <span>
                  {{
                    form.rol === 'admin'
                      ? 'Cuenta con permisos completos de administración.'
                      : 'Cuenta destinada a la operación y monitoreo habitual de las naves.'
                  }}
                </span>
              </div>
            </div>

            <v-text-field
              v-if="dialog.modo === 'crear'"
              v-model="form.password"
              label="Contraseña"
              :type="mostrarPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrarPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="mt-4 form-field"
              :disabled="guardando"
              @click:append-inner="mostrarPassword = !mostrarPassword"
              @keydown.enter="guardar"
            />

            <div v-if="dialog.modo === 'crear'" class="password-info">
              <v-icon size="17"> mdi-information-outline </v-icon>

              <span> La contraseña debe tener al menos 6 caracteres. </span>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">
          <v-btn variant="text" rounded="lg" :disabled="guardando" @click="cerrarDialogo">
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            variant="tonal"
            rounded="lg"
            :prepend-icon="
              dialog.modo === 'crear' ? 'mdi-account-plus-outline' : 'mdi-content-save-outline'
            "
            :loading="guardando"
            :disabled="!formularioValido"
            @click="guardar"
          >
            {{ dialog.modo === 'crear' ? 'Crear usuario' : 'Guardar cambios' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDesactivar.visible" max-width="420" persistent>
      <v-card rounded="xl" elevation="12" class="deactivate-dialog">
        <div class="deactivate-dialog__icon">
          <v-icon size="34" color="error"> mdi-account-off-outline </v-icon>
        </div>

        <v-card-title class="deactivate-dialog__title"> Desactivar usuario </v-card-title>

        <v-card-text class="deactivate-dialog__text">
          ¿Estás seguro de que deseas desactivar a

          <strong>
            {{ dialogDesactivar.usuario?.nombre }} </strong
          >?

          <span>
            El usuario dejará de tener acceso al sistema, pero su información permanecerá
            registrada.
          </span>
        </v-card-text>

        <v-card-actions class="deactivate-dialog__actions">
          <v-btn variant="text" rounded="lg" :disabled="desactivando" @click="cerrarDesactivacion">
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-account-off-outline"
            :loading="desactivando"
            @click="desactivarConfirmado"
          >
            Desactivar
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

import api from '../api/axios'

import { useLoadingStore } from '../stores/loading'

const loadingStore = useLoadingStore()

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

type RolUi = 'admin' | 'usuario'

const usuarios = ref<Usuario[]>([])

const cargando = ref(false)

const guardando = ref(false)

const desactivando = ref(false)

const mostrarPassword = ref(false)

const busqueda = ref('')

const filtroRol = ref<RolUi | null>(null)

const filtroEstado = ref<boolean | null>(null)

const rolBackendOriginal = ref<string | null>(null)

const snackbar = reactive({
  visible: false,

  mensaje: '',

  color: 'success',
})

const dialog = reactive({
  visible: false,

  modo: 'crear' as 'crear' | 'editar',

  id: null as number | null,
})

const dialogDesactivar = reactive({
  visible: false,

  usuario: null as Usuario | null,
})

const form = reactive({
  nombre: '',

  email: '',

  rol: 'usuario' as RolUi,

  password: '',
})

const rolesItems = [
  {
    title: 'Administrador',

    value: 'admin',
  },

  {
    title: 'Usuario',

    value: 'usuario',
  },
]

const estadoItems = [
  {
    title: 'Activos',

    value: true,
  },

  {
    title: 'Inactivos',

    value: false,
  },
]

const headers = [
  {
    title: 'Usuario',

    key: 'nombre',

    minWidth: '190px',
  },

  {
    title: 'Correo electrónico',

    key: 'email',

    minWidth: '220px',
  },

  {
    title: 'Rol',

    key: 'rol',

    minWidth: '140px',
  },

  {
    title: 'Estado',

    key: 'activo',

    minWidth: '120px',
  },

  {
    title: '',

    key: 'acciones',

    sortable: false,

    align: 'end' as const,

    width: '70px',
  },
]

const rolUiDesdeBackend = (rol: string | null | undefined): RolUi => {
  return rol === 'admin' ? 'admin' : 'usuario'
}

const rolBackendParaGuardar = (): string => {
  /*
   * La interfaz únicamente trabaja
   * con Administrador y Usuario.
   *
   * Por compatibilidad, el backend
   * todavía puede seguir usando:
   *
   * admin
   * operador
   * supervisor
   */

  if (form.rol === 'admin') {
    return 'admin'
  }

  /*
   * Si estamos editando un usuario
   * existente que era supervisor,
   * conservamos ese valor mientras
   * visualmente se muestra Usuario.
   *
   * Esto evita cambiar permisos
   * accidentalmente al modificar
   * únicamente nombre o correo.
   */
  if (dialog.modo === 'editar' && rolBackendOriginal.value === 'supervisor') {
    return 'supervisor'
  }

  return 'operador'
}

const usuariosFiltrados = computed(() => {
  let resultado = [...usuarios.value]

  const termino = busqueda.value.trim().toLowerCase()

  if (termino) {
    resultado = resultado.filter((usuario) => {
      return (
        usuario.nombre?.toLowerCase().includes(termino) ||
        usuario.email?.toLowerCase().includes(termino)
      )
    })
  }

  if (filtroRol.value) {
    resultado = resultado.filter((usuario) => rolUiDesdeBackend(usuario.rol) === filtroRol.value)
  }

  if (filtroEstado.value !== null) {
    resultado = resultado.filter((usuario) => usuario.activo === filtroEstado.value)
  }

  return resultado
})

const totalActivos = computed(() => {
  return usuarios.value.filter((usuario) => usuario.activo).length
})

const totalAdministradores = computed(() => {
  return usuarios.value.filter((usuario) => usuario.rol === 'admin').length
})

const totalUsuarios = computed(() => {
  return usuarios.value.filter((usuario) => usuario.rol !== 'admin').length
})

const indicadores = computed(() => [
  {
    label: 'Total usuarios',

    value: usuarios.value.length,

    icon: 'mdi-account-group-outline',

    color: 'primary',
  },

  {
    label: 'Usuarios activos',

    value: totalActivos.value,

    icon: 'mdi-account-check-outline',

    color: 'success',
  },

  {
    label: 'Administradores',

    value: totalAdministradores.value,

    icon: 'mdi-shield-crown-outline',

    color: 'warning',
  },

  {
    label: 'Usuarios',

    value: totalUsuarios.value,

    icon: 'mdi-account-outline',

    color: 'info',
  },
])

const hayFiltros = computed(() => {
  return Boolean(busqueda.value.trim() || filtroRol.value || filtroEstado.value !== null)
})

const formularioValido = computed(() => {
  const nombreValido = form.nombre.trim().length >= 2

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())

  const rolValido = form.rol === 'admin' || form.rol === 'usuario'

  if (dialog.modo === 'crear') {
    return nombreValido && emailValido && rolValido && form.password.length >= 6
  }

  return nombreValido && emailValido && rolValido
})

const mostrarSnackbar = (mensaje: string, color = 'success') => {
  snackbar.mensaje = mensaje

  snackbar.color = color

  snackbar.visible = true
}

const obtenerIniciales = (nombre: string) => {
  if (!nombre?.trim()) {
    return 'U'
  }

  return nombre
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const colorRol = (rol: string) => {
  return rol === 'admin' ? 'primary' : 'success'
}

const iconoRol = (rol: string) => {
  return rol === 'admin' ? 'mdi-shield-crown-outline' : 'mdi-account-outline'
}

const labelRol = (rol: string) => {
  return rol === 'admin' ? 'Administrador' : 'Usuario'
}

const colorRolUi = (rol: string) => {
  return rol === 'admin' ? 'primary' : 'success'
}

const iconoRolUi = (rol: string) => {
  return rol === 'admin' ? 'mdi-shield-crown-outline' : 'mdi-account-outline'
}

const descripcionRolUi = (rol: string) => {
  if (rol === 'admin') {
    return 'Acceso completo al sistema'
  }

  return 'Operación y monitoreo habitual de las naves'
}

const limpiarFiltros = () => {
  busqueda.value = ''

  filtroRol.value = null

  filtroEstado.value = null
}

const cargar = async () => {
  if (cargando.value) {
    return
  }

  cargando.value = true

  try {
    const { data } = await api.get('/usuarios')

    if (data.ok) {
      usuarios.value = data.data ?? []
    } else {
      usuarios.value = []
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error)

    usuarios.value = []

    mostrarSnackbar('Error cargando usuarios', 'error')
  } finally {
    cargando.value = false
  }
}

const limpiarFormulario = () => {
  form.nombre = ''

  form.email = ''

  form.rol = 'usuario'

  form.password = ''

  mostrarPassword.value = false

  rolBackendOriginal.value = null
}

const abrirCrear = () => {
  limpiarFormulario()

  dialog.modo = 'crear'

  dialog.id = null

  dialog.visible = true
}

const abrirEditar = (usuario: Usuario) => {
  form.nombre = usuario.nombre

  form.email = usuario.email

  form.rol = rolUiDesdeBackend(usuario.rol)

  form.password = ''

  mostrarPassword.value = false

  rolBackendOriginal.value = usuario.rol

  dialog.modo = 'editar'

  dialog.id = usuario.id

  dialog.visible = true
}

const cerrarDialogo = () => {
  if (guardando.value) {
    return
  }

  dialog.visible = false
}

const guardar = async () => {
  if (guardando.value || !formularioValido.value) {
    return
  }

  guardando.value = true

  try {
    const rolBackend = rolBackendParaGuardar()

    if (dialog.modo === 'crear') {
      const { data } = await api.post('/auth/register', {
        nombre: form.nombre.trim(),

        email: form.email.trim().toLowerCase(),

        password: form.password,

        rol: rolBackend,
      })

      if (data.ok) {
        mostrarSnackbar('Usuario creado correctamente')

        dialog.visible = false

        await cargar()
      } else {
        mostrarSnackbar(data.mensaje ?? 'No fue posible crear el usuario', 'error')
      }

      return
    }

    const { data } = await api.patch(`/usuarios/${dialog.id}`, {
      nombre: form.nombre.trim(),

      email: form.email.trim().toLowerCase(),

      rol: rolBackend,
    })

    if (data.ok) {
      mostrarSnackbar('Usuario actualizado correctamente')

      dialog.visible = false

      await cargar()
    } else {
      mostrarSnackbar(data.mensaje ?? 'No fue posible actualizar el usuario', 'error')
    }
  } catch (error) {
    console.error('Error guardando usuario:', error)

    mostrarSnackbar('Error guardando usuario', 'error')
  } finally {
    guardando.value = false
  }
}

const confirmarDesactivacion = (usuario: Usuario) => {
  dialogDesactivar.usuario = usuario

  dialogDesactivar.visible = true
}

const cerrarDesactivacion = () => {
  if (desactivando.value) {
    return
  }

  dialogDesactivar.visible = false

  dialogDesactivar.usuario = null
}

const desactivarConfirmado = async () => {
  const usuario = dialogDesactivar.usuario

  if (!usuario || desactivando.value) {
    return
  }

  desactivando.value = true

  try {
    const { data } = await api.delete(`/usuarios/${usuario.id}`)

    if (data.ok) {
      mostrarSnackbar('Usuario desactivado correctamente')

      dialogDesactivar.visible = false

      dialogDesactivar.usuario = null

      await cargar()
    } else {
      mostrarSnackbar(data.mensaje ?? 'No fue posible desactivar el usuario', 'error')
    }
  } catch (error) {
    console.error('Error desactivando usuario:', error)

    mostrarSnackbar('Error desactivando usuario', 'error')
  } finally {
    desactivando.value = false
  }
}

onMounted(async () => {
  loadingStore.mostrar('Cargando usuarios...')

  try {
    await cargar()
  } finally {
    loadingStore.ocultar()
  }
})
</script>

<style scoped>
.usuarios-page {
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

.records-chip {
  font-weight: 600;
}

.page-header__actions {
  display: flex;
  align-items: center;

  gap: 8px;
}

.summary-card {
  position: relative;

  min-height: 94px;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 15px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 7px 24px rgba(0, 0, 0, 0.05) !important;
}

.summary-card__icon {
  width: 42px;
  height: 42px;

  flex: 0 0 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
}

.summary-card__icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.summary-card__icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.summary-card__icon--error {
  color: rgb(var(--v-theme-error));

  background: rgba(var(--v-theme-error), 0.09);
}

.summary-card__icon--warning {
  color: rgb(var(--v-theme-warning));

  background: rgba(var(--v-theme-warning), 0.1);
}

.summary-card__icon--info {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.summary-card__content {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.summary-card__content strong {
  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-card__content span {
  margin-top: 4px;

  font-size: 0.78rem;

  color: rgba(var(--v-theme-on-surface), 0.55);
}

.summary-card__accent {
  position: absolute;

  top: 21px;
  right: 0;
  bottom: 21px;

  width: 3px;

  border-radius: 4px 0 0 4px;
}

.summary-card__accent--primary {
  background: rgb(var(--v-theme-primary));
}

.summary-card__accent--success {
  background: rgb(var(--v-theme-success));
}

.summary-card__accent--error {
  background: rgb(var(--v-theme-error));
}

.summary-card__accent--warning {
  background: rgb(var(--v-theme-warning));
}

.summary-card__accent--info {
  background: rgb(var(--v-theme-info));
}

.users-card {
  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.users-toolbar {
  min-height: 86px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 16px 18px;
}

.users-toolbar__title {
  flex-shrink: 0;

  display: flex;
  align-items: center;

  gap: 10px;
}

.section-icon {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.08);
}

.users-toolbar h2 {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;
}

.users-toolbar p {
  margin: 3px 0 0;

  font-size: 0.75rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.users-toolbar__filters {
  display: flex;
  align-items: center;

  gap: 8px;
}

.search-field {
  width: 240px;
}

.filter-field {
  width: 165px;
}

.search-field :deep(.v-field__input),
.filter-field :deep(.v-field__input) {
  font-size: 0.84rem;
}

.search-field :deep(.v-field-label),
.filter-field :deep(.v-field-label) {
  font-size: 0.8rem;
}

.filter-field :deep(.v-select__selection-text) {
  font-size: 0.84rem;
}

.table-wrapper {
  width: 100%;

  overflow-x: auto;
}

.users-table {
  min-width: 800px;
}

.users-table :deep(th) {
  height: 48px !important;

  font-size: 0.75rem !important;
  font-weight: 700 !important;

  color: rgba(var(--v-theme-on-surface), 0.65) !important;

  background: rgba(var(--v-theme-on-surface), 0.018);
}

.users-table :deep(td) {
  min-height: 64px;

  font-size: 0.78rem;

  border-bottom-color: rgba(var(--v-border-color), 0.4) !important;
}

.users-table :deep(tbody tr) {
  transition: background-color 0.16s ease;
}

.users-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.025) !important;
}

.user-identity {
  display: flex;
  align-items: center;

  gap: 10px;
}

.user-avatar {
  flex-shrink: 0;

  background: rgba(var(--v-theme-primary), 0.1) !important;

  color: rgb(var(--v-theme-primary));
}

.user-avatar span {
  font-size: 0.72rem;
  font-weight: 700;
}

.user-identity__text {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.user-identity__text strong {
  max-width: 170px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.8rem;
  font-weight: 650;
}

.user-identity__text span {
  margin-top: 2px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.email-cell {
  display: flex;
  align-items: center;

  gap: 7px;
}

.email-cell span {
  font-size: 0.78rem;
}

.role-chip {
  font-size: 0.72rem;
  font-weight: 600;
}

.status-cell {
  display: flex;
  align-items: center;

  gap: 7px;
}

.status-cell > span:last-child {
  font-size: 0.76rem;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;
}

.status-dot--active {
  background: rgb(var(--v-theme-success));

  box-shadow: 0 0 0 4px rgba(var(--v-theme-success), 0.08);
}

.status-dot--inactive {
  background: rgb(var(--v-theme-error));

  box-shadow: 0 0 0 4px rgba(var(--v-theme-error), 0.07);
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
}

.actions-btn {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.actions-btn:hover {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.07);
}

.actions-menu {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.deactivate-item {
  color: rgb(var(--v-theme-error));
}

.dialog-header {
  min-height: 88px;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 17px 18px;
}

.dialog-header__icon {
  width: 46px;
  height: 46px;

  flex: 0 0 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;
}

.dialog-header__icon--create {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.dialog-header__icon--edit {
  color: rgb(var(--v-theme-info));

  background: rgba(var(--v-theme-info), 0.09);
}

.dialog-header__content {
  min-width: 0;

  flex: 1;
}

.dialog-eyebrow {
  display: block;

  margin-bottom: 2px;

  font-size: 0.68rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.055em;

  color: rgb(var(--v-theme-primary));
}

.dialog-header h2 {
  margin: 0;

  font-size: 1rem;
  font-weight: 700;
}

.dialog-header p {
  margin: 3px 0 0;

  font-size: 0.75rem;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.dialog-content {
  padding: 20px !important;
}

.form-section__title {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-bottom: 14px;
}

.form-section__icon {
  width: 34px;
  height: 34px;

  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.07);
}

.form-section__title > div:last-child {
  display: flex;
  flex-direction: column;
}

.form-section__title strong {
  font-size: 0.82rem;
  font-weight: 700;
}

.form-section__title span {
  margin-top: 1px;

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.form-field :deep(.v-field__input) {
  font-size: 0.85rem;
}

.form-field :deep(.v-field-label) {
  font-size: 0.8rem;
}

.role-option-icon {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.role-option-icon--primary {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.09);
}

.role-option-icon--success {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.09);
}

.role-help {
  display: flex;
  align-items: flex-start;

  gap: 9px;

  padding: 10px 11px;

  border-radius: 11px;
}

.role-help--admin {
  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.055);
}

.role-help--user {
  color: rgb(var(--v-theme-success));

  background: rgba(var(--v-theme-success), 0.055);
}

.role-help__icon {
  width: 30px;
  height: 30px;

  flex: 0 0 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: rgba(var(--v-theme-surface), 0.7);
}

.role-help > div:last-child {
  display: flex;
  flex-direction: column;
}

.role-help strong {
  font-size: 0.76rem;
  font-weight: 650;

  color: rgb(var(--v-theme-on-surface));
}

.role-help span {
  margin-top: 2px;

  font-size: 0.7rem;
  line-height: 1.45;

  color: rgba(var(--v-theme-on-surface), 0.54);
}

.password-info {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-top: 9px;

  padding: 9px 11px;

  border-radius: 10px;

  color: rgb(var(--v-theme-primary));

  background: rgba(var(--v-theme-primary), 0.06);
}

.password-info span {
  font-size: 0.72rem;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.dialog-actions {
  justify-content: flex-end;

  gap: 8px;

  padding: 13px 18px 17px;
}

.deactivate-dialog {
  padding-top: 24px;

  text-align: center;
}

.deactivate-dialog__icon {
  width: 68px;
  height: 68px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 8px;

  border-radius: 50%;

  background: rgba(var(--v-theme-error), 0.09);
}

.deactivate-dialog__title {
  justify-content: center;

  padding-bottom: 4px;

  font-size: 1rem;
  font-weight: 700;
}

.deactivate-dialog__text {
  padding-top: 4px;

  font-size: 0.8rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.62);
}

.deactivate-dialog__text strong {
  color: rgb(var(--v-theme-on-surface));
}

.deactivate-dialog__text span {
  display: block;

  margin-top: 7px;

  font-size: 0.74rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.deactivate-dialog__actions {
  justify-content: center;

  gap: 8px;

  padding: 12px 18px 20px;
}

.empty-state {
  min-height: 330px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 40px 20px;

  text-align: center;
}

.empty-state__icon {
  width: 78px;
  height: 78px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 14px;

  border-radius: 50%;

  background: rgba(var(--v-theme-primary), 0.07);
}

.empty-state h3 {
  margin: 0;

  font-size: 0.92rem;
  font-weight: 700;
}

.empty-state p {
  max-width: 400px;

  margin: 6px 0 18px;

  font-size: 0.76rem;
  line-height: 1.5;

  color: rgba(var(--v-theme-on-surface), 0.5);
}

.table-loading {
  min-height: 300px;

  padding: 16px;
}

.snackbar-content {
  display: flex;
  align-items: center;

  gap: 8px;
}

@media (max-width: 1100px) {
  .users-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .users-toolbar__filters {
    width: 100%;
  }

  .search-field {
    flex: 1;
    width: auto;
  }
}

@media (max-width: 700px) {
  .usuarios-page {
    padding: 14px !important;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;

    gap: 14px;
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

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions .v-btn {
    flex: 1;
  }

  .summary-card {
    min-height: 84px;

    padding: 12px;

    gap: 9px;
  }

  .summary-card__icon {
    width: 36px;
    height: 36px;

    flex-basis: 36px;
  }

  .summary-card__content strong {
    font-size: 1.2rem;
  }

  .summary-card__content span {
    font-size: 0.72rem;
  }

  .users-toolbar {
    padding: 14px;
  }

  .users-toolbar__filters {
    display: grid;

    grid-template-columns:
      1fr
      1fr;
  }

  .search-field {
    width: 100%;

    grid-column: 1 / -1;
  }

  .filter-field {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .records-chip {
    display: none;
  }

  .page-header__actions {
    display: grid;

    grid-template-columns:
      1fr
      1fr;
  }

  .users-toolbar__filters {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: auto;
  }

  .dialog-header {
    padding: 14px;
  }

  .dialog-header__icon {
    width: 40px;
    height: 40px;

    flex-basis: 40px;
  }

  .dialog-header p {
    display: none;
  }

  .dialog-content {
    padding: 16px !important;
  }

  .dialog-actions {
    display: grid;

    grid-template-columns:
      1fr
      1fr;
  }
}
</style>