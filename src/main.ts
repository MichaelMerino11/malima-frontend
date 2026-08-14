import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/animaciones.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1A3A8F',
          secondary: '#2E7D32',
          accent: '#4CAF50',
          background: '#F5F7FA',
          surface: '#FFFFFF',
          error: '#D32F2F',
          warning: '#F57C00',
          info: '#0288D1',
          success: '#2E7D32',
        },
      },
      dark: {
        colors: {
          primary: '#5C8AE6',
          secondary: '#4CAF50',
          accent: '#81C784',
          background: '#121212',
          surface: '#1E1E1E',
          error: '#EF5350',
          warning: '#FFA726',
          info: '#29B6F6',
          success: '#66BB6A',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
