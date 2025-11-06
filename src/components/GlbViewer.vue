<!-- src/components/GlbViewer.vue -->
<template>
  <div class="glb-viewer">
    <!-- 渲染画布 -->
    <div ref="container" class="canvas-wrap" />

    <!-- 简单控制条 -->
    <div class="controls">
      <el-button
        type="primary"
        size="small"
        :icon="isPlaying ? VideoPause : VideoPlay"
        @click="togglePlay"
      >
        {{ isPlaying ? '暂停' : '播放' }}
      </el-button>

      <span class="speed-label">倍速</span>
      <el-input-number
        v-model="speed"
        size="small"
        :min="0.1"
        :max="3"
        :step="0.1"
        @change="changeSpeed"
      />
    </div>
  </div>
</template>

<script setup>
/* -------------------------------- 引入 -------------------------------- */
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

/* -------------------------------- props -------------------------------- */
const props = defineProps({
  // 模型地址（支持相对 / 绝对 / cdn）
  url: {
    type: String,
    required: true
  },
  // 是否自动播放
  autoplay: {
    type: Boolean,
    default: true
  },
  // 背景色
  background: {
    type: String,
    default: '#1e1e1e'
  }
})

/* -------------------------------- 响应式 -------------------------------- */
const container = ref(null)      // 画布挂载点
const isPlaying = ref(false)     // 动画播放状态
const speed = ref(1)             // 播放倍速

/* -------------------------------- three 相关 -------------------------------- */
let scene, camera, renderer, controls
let mixer        // 动画混合器
let clock = new THREE.Clock()
let animationId  // requestAnimationFrame id

/* -------------------------------- 方法 -------------------------------- */
/* 初始化 three 环境 */
function initThree () {
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  /* 场景 */
  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.background)

  /* 相机 */
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(5, 5, 10)

  /* 渲染器 */
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)

  /* 轨道控制器 */
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  /* 灯光 */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(hemi)
  const dir = new THREE.DirectionalLight(0xffffff, 1)
  dir.position.set(5, 10, 7.5)
  scene.add(dir)

  /* 窗口 resize */
  window.addEventListener('resize', handleResize)
}

/* 加载模型 */
function loadModel () {
  const loader = new GLTFLoader()
  loader.load(
    props.url,
    gltf => {
      const model = gltf.scene
      scene.add(model)

      /* 如果存在动画 */
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model)
        gltf.animations.forEach(clip => {
          const action = mixer.clipAction(clip)
          action.play()
        })
        isPlaying.value = props.autoplay
      }

      /* 居中显示 */
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 5 / maxDim
      model.scale.multiplyScalar(scale)
      model.position.sub(center.multiplyScalar(scale))

      /* 让相机看向模型 */
      controls.target.copy(center)
      controls.update()
    },
    undefined,
    err => console.error('GLTF 加载失败:', err)
  )
}

/* 渲染循环 */
function animate () {
  animationId = requestAnimationFrame(animate)

  const delta = clock.getDelta()
  if (mixer && isPlaying.value) mixer.update(delta * speed.value)

  controls.update()
  renderer.render(scene, camera)//这里渲染就好，不用OrbitControls同时用，两者取其一即可 //https://www.bilibili.com/video/BV14r4y1G7h4?share_source=copy_web&vd_source=87fd4ba12cc3bed7aed51c523b6749af&spm_id_from=333.788.videopod.episodes&p=15
}

/* 播放 / 暂停 */
function togglePlay () {
  isPlaying.value = !isPlaying.value
}

/* 改变倍速 */
function changeSpeed (val) {
  speed.value = val
}

/* 窗口大小变化 */
function handleResize () {
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

/* -------------------------------- 生命周期 -------------------------------- */
onMounted(() => {
  initThree()
  loadModel()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  if (renderer) renderer.dispose()
  if (mixer) mixer.stopAllAction()
})
</script>

<style scoped>
.glb-viewer {
  position: relative;
  width: 100%;
  height: 100%;
}
.canvas-wrap {
  width: 100%;
  height: 100%;
}
.controls {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 12px;
  border-radius: 4px;
}
.speed-label {
  color: #fff;
  font-size: 12px;
  margin-left: 6px;
}
</style>