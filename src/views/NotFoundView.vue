<template>
  <v-app>
    <v-main class="error-page">
      <div class="error-background">
        <div class="background-shape background-shape--one" />
        <div class="background-shape background-shape--two" />
        <div class="background-grid" />
      </div>

      <v-container fluid class="error-container">
        <v-card rounded="xl" elevation="0" class="error-card">
          <div class="error-card__content">
            <div class="brand">
              <img src="/logo_malima.png" alt="Grupo Malima" class="brand-logo" />
            </div>

            <div class="error-illustration">
              <div class="error-illustration__circle">
                <v-icon size="58" color="primary"> mdi-map-marker-question-outline </v-icon>
              </div>

              <div class="floating-icon floating-icon--left">
                <v-icon size="20"> mdi-greenhouse </v-icon>
              </div>

              <div class="floating-icon floating-icon--right">
                <v-icon size="19"> mdi-leaf </v-icon>
              </div>
            </div>

            <div class="error-code">404</div>

            <v-chip color="primary" variant="tonal" size="small" class="error-chip">
              <v-icon start size="15"> mdi-link-off </v-icon>

              Página no disponible
            </v-chip>

            <h1 class="error-title">No encontramos esta página</h1>

            <p class="error-description">
              La dirección que intentas visitar no existe, fue modificada o ya no se encuentra
              disponible.
            </p>

            <div class="route-info">
              <div class="route-info__icon">
                <v-icon size="17"> mdi-web </v-icon>
              </div>

              <div class="route-info__content">
                <span> Dirección solicitada </span>

                <strong>
                  {{ rutaActual }}
                </strong>
              </div>
            </div>

            <div class="error-actions">
              <v-btn
                color="primary"
                size="large"
                rounded="lg"
                prepend-icon="mdi-home-outline"
                to="/home"
                class="primary-action"
              >
                Ir al inicio
              </v-btn>

              <v-btn
                variant="tonal"
                color="primary"
                size="large"
                rounded="lg"
                prepend-icon="mdi-arrow-left"
                @click="volver"
              >
                Volver atrás
              </v-btn>
            </div>

            <div class="error-help">
              <v-icon size="16" color="medium-emphasis"> mdi-information-outline </v-icon>

              <span>
                Si llegaste aquí desde una opción del sistema, vuelve al inicio e intenta
                nuevamente.
              </span>
            </div>
          </div>

          <div class="error-card__footer">
            <div>
              <span class="status-dot" />

              <span> Sistema de Invernaderos </span>
            </div>

            <span> Grupo Malima </span>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const rutaActual = computed(() => {
  return route.fullPath || '/'
})

const volver = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/home')
}
</script>

<style scoped>
.error-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
}

.error-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.045);
}

.background-shape--one {
  width: 520px;
  height: 520px;
  top: -270px;
  right: -170px;
}

.background-shape--two {
  width: 420px;
  height: 420px;
  left: -210px;
  bottom: -210px;
}

.background-grid {
  position: absolute;
  inset: 0;
  opacity: 0.018;
  background-image:
    linear-gradient(rgba(var(--v-theme-primary), 1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--v-theme-primary), 1) 1px, transparent 1px);
  background-size: 36px 36px;
}

.error-container {
  position: relative;
  z-index: 1;

  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 28px 20px !important;
}

.error-card {
  width: 100%;
  max-width: 610px;

  overflow: hidden;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  background: rgb(var(--v-theme-surface));

  box-shadow: 0 22px 65px rgba(0, 0, 0, 0.08) !important;
}

.error-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 30px 48px 28px;

  text-align: center;
}

.brand {
  width: 100%;

  display: flex;
  justify-content: center;

  margin-bottom: 26px;
}

.brand-logo {
  max-width: 155px;
  max-height: 60px;

  object-fit: contain;
}

.error-illustration {
  position: relative;

  width: 150px;
  height: 120px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 4px;
}

.error-illustration__circle {
  width: 108px;
  height: 108px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(var(--v-theme-primary), 0.075);

  box-shadow: 0 0 0 14px rgba(var(--v-theme-primary), 0.025);
}

.floating-icon {
  position: absolute;

  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(var(--v-theme-primary), 0.12);

  border-radius: 12px;

  color: rgb(var(--v-theme-primary));

  background: rgb(var(--v-theme-surface));

  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.07);

  animation: floating 3s ease-in-out infinite;
}

.floating-icon--left {
  left: 0;
  bottom: 8px;
}

.floating-icon--right {
  top: 4px;
  right: 0;

  animation-delay: 0.8s;
}

.error-code {
  margin-top: 8px;

  font-size: 4.7rem;
  font-weight: 800;
  line-height: 1;

  letter-spacing: -0.06em;

  color: rgb(var(--v-theme-primary));
}

.error-chip {
  margin-top: 13px;

  font-size: 0.75rem;
  font-weight: 600;
}

.error-title {
  margin: 20px 0 0;

  font-size: 1.55rem;
  font-weight: 750;
  line-height: 1.25;

  letter-spacing: -0.025em;
}

.error-description {
  max-width: 440px;

  margin: 10px 0 0;

  font-size: 0.875rem;
  line-height: 1.6;

  color: rgba(var(--v-theme-on-surface), 0.58);
}

.route-info {
  width: 100%;
  max-width: 430px;

  display: flex;
  align-items: center;

  gap: 10px;

  margin-top: 22px;
  padding: 11px 13px;

  border-radius: 12px;

  text-align: left;

  background: rgba(var(--v-theme-on-surface), 0.03);
}

.route-info__icon {
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

.route-info__content {
  min-width: 0;

  display: flex;
  flex: 1;
  flex-direction: column;
}

.route-info__content span {
  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.48);
}

.route-info__content strong {
  margin-top: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-family: monospace;

  font-size: 0.78rem;
  font-weight: 600;

  color: rgba(var(--v-theme-on-surface), 0.74);
}

.error-actions {
  width: 100%;

  display: flex;
  justify-content: center;

  gap: 10px;

  margin-top: 25px;
}

.error-actions .v-btn {
  min-height: 46px;

  font-size: 0.82rem;
  font-weight: 650;

  text-transform: none;
  letter-spacing: 0;
}

.primary-action {
  min-width: 155px;
}

.error-help {
  display: flex;
  align-items: flex-start;

  gap: 6px;

  max-width: 420px;

  margin-top: 21px;

  text-align: left;

  color: rgba(var(--v-theme-on-surface), 0.47);
}

.error-help span {
  font-size: 0.74rem;
  line-height: 1.45;
}

.error-card__footer {
  min-height: 52px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 10px 18px;

  border-top: 1px solid rgba(var(--v-border-color), 0.45);

  background: rgba(var(--v-theme-on-surface), 0.018);

  font-size: 0.7rem;

  color: rgba(var(--v-theme-on-surface), 0.47);
}

.error-card__footer > div {
  display: flex;
  align-items: center;

  gap: 7px;
}

.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: rgb(var(--v-theme-success));

  box-shadow: 0 0 0 4px rgba(var(--v-theme-success), 0.07);
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 600px) {
  .error-container {
    align-items: flex-start;

    padding: 18px 14px !important;
  }

  .error-card {
    margin-top: 18px;

    border-radius: 18px !important;
  }

  .error-card__content {
    padding: 24px 20px;
  }

  .brand {
    margin-bottom: 20px;
  }

  .brand-logo {
    max-width: 135px;
  }

  .error-illustration {
    width: 135px;
    height: 108px;
  }

  .error-illustration__circle {
    width: 94px;
    height: 94px;
  }

  .error-illustration__circle .v-icon {
    font-size: 50px !important;
  }

  .floating-icon {
    width: 36px;
    height: 36px;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.35rem;
  }

  .error-description {
    font-size: 0.82rem;
  }

  .error-actions {
    flex-direction: column;

    width: 100%;
  }

  .error-actions .v-btn {
    width: 100%;
  }

  .error-card__footer {
    justify-content: center;
  }

  .error-card__footer > span:last-child {
    display: none;
  }
}

@media (max-width: 380px) {
  .error-card__content {
    padding: 22px 16px;
  }

  .error-code {
    font-size: 3.6rem;
  }

  .route-info {
    padding: 10px;
  }
}
</style>