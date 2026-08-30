<template>
  <div ref="host" class="greenhouse-scene" @click="seleccionarDesdeCanvas">
    <div class="scene-overlay">
      <div class="live-badge">
        <span class="live-dot"></span>
        3D en vivo
      </div>

      <span class="scene-help"> Arrastra para rotar · Rueda para zoom </span>
    </div>

    <div v-if="!naves.length" class="scene-empty">
      <v-icon size="42">mdi-greenhouse</v-icon>
      <span>No hay naves disponibles</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

type Nave3D = {
  id: number
  numero?: number
  nombre?: string
  estado?: string
  accion?: string
  accion_actual?: string
  modo?: string
  grupo_id?: number
  [key: string]: any
}

const props = withDefaults(
  defineProps<{
    naves: Nave3D[]
    selectedId?: number | null
    autoRotate?: boolean
  }>(),
  {
    selectedId: null,
    autoRotate: false,
  },
)

const emit = defineEmits<{
  select: [nave: Nave3D]
}>()

const host = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

let resizeObserver: ResizeObserver | null = null
let animationFrame = 0

const timer = new THREE.Timer()
const root = new THREE.Group()

type NaveModel = {
  nave: Nave3D
  group: THREE.Group

  roofLeft: THREE.Mesh
  roofRight: THREE.Mesh

  beacon: THREE.Mesh
  beaconMaterial: THREE.MeshStandardMaterial
  statusLight: THREE.PointLight

  bodyMaterial: THREE.MeshStandardMaterial

  movementRing: THREE.Mesh
  movementRingMaterial: THREE.MeshBasicMaterial

  selectionRing: THREE.Mesh

  opening: number
}

const models = new Map<number, NaveModel>()
const pickables: THREE.Object3D[] = []

const normalizar = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const estadoNormalizado = (estado?: string) => {
  const value = normalizar(estado)

  if (value === 'abierto' || value === 'abierta') {
    return 'abierto'
  }

  if (value === 'cerrado' || value === 'cerrada') {
    return 'cerrado'
  }

  if (value.includes('movimiento') || value === 'abriendo' || value === 'cerrando') {
    return 'en_movimiento'
  }

  return 'desconocido'
}

const colorEstado = (estado?: string) => {
  switch (estadoNormalizado(estado)) {
    case 'abierto':
      return '#34c759'

    case 'en_movimiento':
      return '#ff9f0a'

    case 'cerrado':
      return '#ff453a'

    default:
      return '#8e9aab'
  }
}

const numeroNave = (nave: Nave3D) => Number(nave.numero ?? nave.id)

const crearTexto = (texto: string) => {
  const canvas = document.createElement('canvas')

  canvas.width = 512
  canvas.height = 128

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return new THREE.Sprite()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(10, 16, 28, .88)'

  ctx.beginPath()
  ctx.roundRect(20, 15, 472, 92, 24)
  ctx.fill()

  ctx.font = '700 48px Inter, system-ui, -apple-system, sans-serif'

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#ffffff'

  ctx.fillText(texto, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)

  texture.colorSpace = THREE.SRGBColorSpace

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  })

  const sprite = new THREE.Sprite(material)

  sprite.scale.set(3.2, 0.8, 1)

  return sprite
}

const crearNave = (nave: Nave3D, index: number) => {
  const group = new THREE.Group()

  const numero = numeroNave(nave)
  const accent = new THREE.Color(colorEstado(nave.estado))

  /*
   * 4 columnas.
   * Para Zona A/B normalmente tendremos 7 naves.
   */
  const columns = 4

  const row = Math.floor(index / columns)
  const column = index % columns

  const amountInRow = Math.min(columns, props.naves.length - row * columns)

  const horizontalOffset = ((amountInRow - 1) * 6.2) / 2

  group.position.set(column * 6.2 - horizontalOffset, 0, row * 6.2 - 2.8)

  /*
   * Base de hormigón
   */
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.3, 0.16, 4.4),
    new THREE.MeshStandardMaterial({
      color: '#aeb6c2',
      roughness: 0.95,
    }),
  )

  base.position.y = 0.08

  base.receiveShadow = true

  group.add(base)

  /*
   * Interior / suelo
   */
  const interior = new THREE.Mesh(
    new THREE.BoxGeometry(4.35, 0.08, 3.35),
    new THREE.MeshStandardMaterial({
      color: '#315b32',
      roughness: 0.8,
    }),
  )

  interior.position.y = 0.19

  group.add(interior)

  /*
   * Paredes translúcidas
   */
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#d9f3e9',
    roughness: 0.45,
    metalness: 0.05,
    transparent: true,
    opacity: 0.82,

    emissive: accent,
    emissiveIntensity: 0.05,
  })

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.7, 3.4), bodyMaterial)

  body.position.y = 1.08

  body.castShadow = true
  body.receiveShadow = true

  body.userData.naveId = nave.id

  pickables.push(body)

  group.add(body)

  /*
   * Marcos verticales del invernadero
   */
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#7d8995',
    metalness: 0.55,
    roughness: 0.38,
  })

  for (const x of [-2.05, 0, 2.05]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.8, 3.48), frameMaterial)

    frame.position.set(x, 1.1, 0)

    group.add(frame)
  }

  /*
   * Techo.
   *
   * Son dos paneles independientes.
   * Estos se animan físicamente en Three.js.
   */
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: '#e7f7f1',
    roughness: 0.38,
    metalness: 0.05,
    transparent: true,
    opacity: 0.84,
  })

  const roofGeometry = new THREE.BoxGeometry(2.55, 0.12, 3.62)

  const roofLeft = new THREE.Mesh(roofGeometry, roofMaterial)

  roofLeft.position.set(-1.04, 2.25, 0)

  roofLeft.rotation.z = -0.57

  roofLeft.castShadow = true
  roofLeft.userData.naveId = nave.id

  const roofRight = new THREE.Mesh(roofGeometry, roofMaterial.clone())

  roofRight.position.set(1.04, 2.25, 0)

  roofRight.rotation.z = 0.57

  roofRight.castShadow = true
  roofRight.userData.naveId = nave.id

  pickables.push(roofLeft, roofRight)

  group.add(roofLeft, roofRight)

  /*
   * Puerta frontal.
   */
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 1.15, 0.08),
    new THREE.MeshStandardMaterial({
      color: '#7d6255',
      roughness: 0.8,
    }),
  )

  door.position.set(0, 0.76, 1.73)

  group.add(door)

  /*
   * Baliza de estado
   */
  const beaconMaterial = new THREE.MeshStandardMaterial({
    color: accent,

    emissive: accent,

    emissiveIntensity: 2.5,
  })

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), beaconMaterial)

  beacon.position.set(0, 3.02, 0)

  group.add(beacon)

  const light = new THREE.PointLight(accent, 1.3, 4.7)

  light.position.set(0, 2.9, 0)

  group.add(light)

  /*
   * Anillo animado durante movimiento.
   */
  const movementRingMaterial = new THREE.MeshBasicMaterial({
    color: accent,

    transparent: true,

    opacity: 0,
  })

  const movementRing = new THREE.Mesh(new THREE.RingGeometry(2.45, 2.6, 64), movementRingMaterial)

  movementRing.rotation.x = -Math.PI / 2

  movementRing.position.y = 0.22

  group.add(movementRing)

  /*
   * Selección.
   */
  const selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(2.7, 2.88, 64),
    new THREE.MeshBasicMaterial({
      color: '#377dff',
      transparent: true,
      opacity: 0.85,
    }),
  )

  selectionRing.rotation.x = -Math.PI / 2

  selectionRing.position.y = 0.21

  selectionRing.visible = props.selectedId === nave.id

  group.add(selectionRing)

  /*
   * Nombre flotante
   */
  const label = crearTexto(`Nave ${numero}`)

  label.position.set(0, 3.75, 0)

  group.add(label)

  /*
   * Estado inicial del techo.
   */
  const estado = estadoNormalizado(nave.estado)

  let opening = 0

  if (estado === 'abierto') {
    opening = 1
  }

  if (estado === 'en_movimiento') {
    opening = 0.45
  }

  const model: NaveModel = {
    nave,
    group,

    roofLeft,
    roofRight,

    beacon,
    beaconMaterial,
    statusLight: light,

    bodyMaterial,

    movementRing,
    movementRingMaterial,

    selectionRing,

    opening,
  }

  models.set(Number(nave.id), model)

  root.add(group)
}

const limpiarModelos = () => {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh

    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const disposeMaterial = (material: THREE.Material) => {
      const materialConMap = material as THREE.Material & {
        map?: THREE.Texture | null
      }

      if (materialConMap.map) {
        materialConMap.map.dispose()
      }

      material.dispose()
    }

    const material = mesh.material

    if (Array.isArray(material)) {
      material.forEach(disposeMaterial)
    } else if (material) {
      disposeMaterial(material)
    }
  })

  root.clear()

  models.clear()

  pickables.length = 0
}

const construirModelos = () => {
  if (!scene) return

  limpiarModelos()

  props.naves.forEach(crearNave)
}

const targetApertura = (nave: Nave3D, elapsed: number) => {
  const estado = estadoNormalizado(nave.estado)

  if (estado === 'abierto') {
    return 1
  }

  if (estado === 'cerrado') {
    return 0
  }

  if (estado === 'en_movimiento') {
    const accion = normalizar(nave.accion_actual ?? nave.accion)

    if (accion.includes('cerr')) {
      return 0
    }

    if (accion.includes('abr')) {
      return 1
    }

    /*
     * Si Backend todavía no entrega
     * dirección del movimiento,
     * hacemos una animación intermedia.
     */
    return 0.45 + Math.sin(elapsed * 1.7) * 0.18
  }

  return 0
}

const renderLoop = () => {
  animationFrame = requestAnimationFrame(renderLoop)

  timer.update()

  const delta = Math.min(timer.getDelta(), 0.05)

  const elapsed = timer.getElapsed()

  models.forEach((model) => {
    const target = targetApertura(model.nave, elapsed)

    /*
     * Interpolación suave.
     */
    model.opening += (target - model.opening) * Math.min(1, delta * 2.3)

    /*
     * Apertura visual.
     */
    model.roofLeft.rotation.z = -0.57 - model.opening * 0.48

    model.roofRight.rotation.z = 0.57 + model.opening * 0.48

    model.roofLeft.position.x = -1.04 - model.opening * 0.22

    model.roofRight.position.x = 1.04 + model.opening * 0.22

    const estado = estadoNormalizado(model.nave.estado)

    const moving = estado === 'en_movimiento'

    /*
     * Pulso de la baliza.
     */
    const pulse = moving ? 1 + Math.sin(elapsed * 5.5) * 0.22 : 1

    model.beacon.scale.setScalar(pulse)

    model.beaconMaterial.emissiveIntensity = moving ? 4 : 2.1

    /*
     * Anillo de movimiento.
     */
    if (moving) {
      const phase = (elapsed * 0.7) % 1

      const scale = 0.75 + phase * 0.65

      model.movementRing.scale.setScalar(scale)

      model.movementRingMaterial.opacity = 0.65 * (1 - phase)
    } else {
      model.movementRingMaterial.opacity = 0
    }
  })

  controls.update()

  renderer.render(scene, camera)
}

const resize = () => {
  if (!host.value || !renderer || !camera) {
    return
  }

  const width = host.value.clientWidth

  const height = host.value.clientHeight

  camera.aspect = width / height

  camera.updateProjectionMatrix()

  renderer.setSize(width, height, false)
}

const seleccionarDesdeCanvas = (event: MouseEvent) => {
  if (!host.value || !camera) {
    return
  }

  const rect = host.value.getBoundingClientRect()

  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,

    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )

  const raycaster = new THREE.Raycaster()

  raycaster.setFromCamera(pointer, camera)

  const intersections = raycaster.intersectObjects(pickables, false)

  if (!intersections.length) {
    return
  }

  const intersection = intersections[0]

  if (!intersection) {
    return
  }

  const id = Number(intersection.object.userData.naveId)

  const nave = props.naves.find((item) => Number(item.id) === id)

  if (nave) {
    emit('select', nave)
  }
}

const actualizarSeleccion = () => {
  models.forEach((model, id) => {
    model.selectionRing.visible = Number(props.selectedId) === id
  })
}

const resetCamera = () => {
  camera.position.set(13, 11, 18)

  controls.target.set(0, 1, 1)

  controls.update()
}

defineExpose({
  resetCamera,
})

onMounted(() => {
  if (!host.value) {
    return
  }

  timer.connect(document)

  scene = new THREE.Scene()

  scene.fog = new THREE.Fog('#13261f', 27, 50)

  camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100)

  camera.position.set(13, 11, 18)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  renderer.shadowMap.enabled = true

  renderer.shadowMap.type = THREE.PCFShadowMap

  renderer.outputColorSpace = THREE.SRGBColorSpace

  renderer.toneMapping = THREE.ACESFilmicToneMapping

  renderer.toneMappingExposure = 1.05

  renderer.setClearColor(0x000000, 0)

  host.value.appendChild(renderer.domElement)

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()

    console.warn('WebGL context perdido')

    cancelAnimationFrame(animationFrame)
  })

  renderer.domElement.addEventListener('webglcontextrestored', () => {
    console.info('WebGL context restaurado')

    construirModelos()

    renderLoop()
  })

  /*
   * Controles.
   */
  controls = new OrbitControls(camera, renderer.domElement)

  controls.enableDamping = true
  controls.dampingFactor = 0.06

  controls.minDistance = 9
  controls.maxDistance = 35

  controls.maxPolarAngle = Math.PI / 2.08

  controls.target.set(0, 1, 1)

  controls.autoRotate = props.autoRotate

  controls.autoRotateSpeed = 0.45

  /*
   * Iluminación.
   */
  scene.add(new THREE.HemisphereLight('#dff5ff', '#1b261d', 2.4))

  const sun = new THREE.DirectionalLight('#fff7e0', 3.5)

  sun.position.set(-10, 18, 12)

  sun.castShadow = true

  sun.shadow.mapSize.set(1024, 1024)

  sun.shadow.camera.left = -25
  sun.shadow.camera.right = 25
  sun.shadow.camera.top = 25
  sun.shadow.camera.bottom = -25

  scene.add(sun)

  /*
   * Terreno principal.
   */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 28),

    new THREE.MeshStandardMaterial({
      color: '#193b27',
      roughness: 0.94,
    }),
  )

  ground.rotation.x = -Math.PI / 2

  ground.receiveShadow = true

  scene.add(ground)

  /*
   * Cuadrícula técnica muy tenue.
   */
  const grid = new THREE.GridHelper(42, 28, '#4c8062', '#2c4f3a')

  const gridMaterial = grid.material as THREE.Material

  gridMaterial.transparent = true
  gridMaterial.opacity = 0.18

  grid.position.y = 0.015

  scene.add(grid)

  scene.add(root)

  construirModelos()

  resizeObserver = new ResizeObserver(resize)

  resizeObserver.observe(host.value)

  resize()

  renderLoop()
})

watch(
  () => props.naves.map((nave) => `${nave.id}:${nave.numero}`).join('|'),
  () => {
    construirModelos()
  },
)

watch(
  () =>
    props.naves.map((nave) => ({
      id: nave.id,
      estado: nave.estado,
      accion: nave.accion_actual ?? nave.accion,
    })),

  (naves) => {
    for (const nave of naves) {
      const model = models.get(Number(nave.id))

      if (!model) {
        continue
      }

      const source = props.naves.find((item) => Number(item.id) === Number(nave.id))

      if (source) {
        model.nave = source
      }

      const color = new THREE.Color(colorEstado(nave.estado))

      model.beaconMaterial.color.copy(color)

      model.beaconMaterial.emissive.copy(color)

      model.bodyMaterial.emissive.copy(color)

      model.statusLight.color.copy(color)
    }
  },

  {
    deep: true,
  },
)

watch(() => props.selectedId, actualizarSeleccion)

watch(
  () => props.autoRotate,
  (value) => {
    if (controls) {
      controls.autoRotate = value

      controls.autoRotateSpeed = 0.45
    }
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)

  resizeObserver?.disconnect()

  controls?.dispose()

  timer.disconnect()

  limpiarModelos()

  renderer?.dispose()

  if (renderer?.domElement.parentElement) {
    renderer.domElement.parentElement.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.greenhouse-scene {
  position: relative;
  width: 100%;
  height: clamp(430px, 55vh, 620px);
  overflow: hidden;

  cursor: grab;

  background:
    radial-gradient(circle at 50% 5%, rgba(76, 145, 112, 0.27), transparent 42%),
    linear-gradient(180deg, #14231f 0%, #0c1714 100%);
}

.greenhouse-scene:active {
  cursor: grabbing;
}

.greenhouse-scene :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.scene-overlay {
  position: absolute;
  z-index: 4;

  top: 14px;
  left: 16px;

  display: flex;
  align-items: center;
  gap: 12px;

  pointer-events: none;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 6px 10px;

  border: 1px solid rgba(255, 255, 255, 0.14);

  border-radius: 999px;

  background: rgba(6, 14, 12, 0.62);

  backdrop-filter: blur(12px);

  color: white;

  font-size: 0.72rem;
  font-weight: 700;
}

.live-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #39d86c;

  box-shadow:
    0 0 0 4px rgba(57, 216, 108, 0.12),
    0 0 12px rgba(57, 216, 108, 0.6);

  animation: livePulse 1.5s infinite;
}

.scene-help {
  color: rgba(255, 255, 255, 0.64);

  font-size: 0.7rem;

  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.scene-empty {
  position: absolute;
  z-index: 5;

  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 10px;

  color: rgba(255, 255, 255, 0.58);
}

@keyframes livePulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

@media (max-width: 800px) {
  .greenhouse-scene {
    height: 430px;
  }

  .scene-help {
    display: none;
  }
}
</style>
