<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { loadAMap, AmapKeyMissingError } from '../../utils/amap'
import { saveMapConfig, MAP_CONFIG_EVENT, getMapConfig } from '../../config'

const props = defineProps({
  center: { type: Array, default: () => [116.4074, 39.909] },
  zoom: { type: Number, default: 15 },
  height: { type: String, default: '420px' },
})

const emit = defineEmits(['ready', 'need-key'])

const mapEl = ref(null)
const loading = ref(false)
const mapReady = ref(false)
const missingKey = ref(false)
const loadError = ref('')
const keyForm = ref({ key: '', securityCode: '' })

let map = null
let destroyed = false

async function initMap() {
  loading.value = true
  missingKey.value = false
  loadError.value = ''
  mapReady.value = false
  try {
    const AMap = await loadAMap()
    if (destroyed) return
    if (map) {
      map.destroy()
      map = null
    }
    map = new AMap.Map(mapEl.value, {
      zoom: props.zoom,
      center: props.center,
      viewMode: '2D',
    })
    map.addControl(new AMap.Scale())
    mapReady.value = true
    emit('ready', { AMap, map })
  } catch (e) {
    if (e instanceof AmapKeyMissingError) {
      missingKey.value = true
      emit('need-key')
    } else {
      loadError.value =
        (e && e.message) || '地图加载失败，请检查 Key、安全密钥及网络后重试'
    }
  } finally {
    loading.value = false
  }
}

function saveInlineKey() {
  if (!keyForm.value.key.trim()) return
  saveMapConfig(keyForm.value)
  // MAP_CONFIG_EVENT 会触发 onConfigChanged -> initMap
}

function onConfigChanged() {
  keyForm.value = { ...getMapConfig() }
  initMap()
}

defineExpose({ retry: initMap })

onMounted(() => {
  keyForm.value = { ...getMapConfig() }
  initMap()
  window.addEventListener(MAP_CONFIG_EVENT, onConfigChanged)
})

onBeforeUnmount(() => {
  destroyed = true
  window.removeEventListener(MAP_CONFIG_EVENT, onConfigChanged)
  if (map) {
    map.destroy()
    map = null
  }
})
</script>

<template>
  <div class="amap-container" :style="{ height }">
    <div ref="mapEl" class="amap-el" />

    <div v-if="mapReady" class="amap-tools">
      <slot name="tools" />
    </div>

    <slot />

    <div v-if="loading" class="amap-mask">
      <el-icon class="is-loading spin-icon"><Loading /></el-icon>
      <div class="mask-title">地图加载中…</div>
    </div>

    <div v-else-if="missingKey" class="amap-mask config-panel">
      <el-icon class="mask-icon"><MapLocation /></el-icon>
      <div class="mask-title">需要配置高德地图 Key</div>
      <p class="mask-desc">
        绘制工地范围、打卡定位均依赖高德地图 JS API。
        请前往
        <el-link
          type="primary"
          href="https://lbs.amap.com/api/javascript-api-v2/prerequisites"
          target="_blank"
          underlined="never"
        >
          高德开放平台
        </el-link>
        免费申请「Web端(JS API)」Key。
      </p>
      <div class="key-inputs">
        <el-input
          v-model="keyForm.key"
          placeholder="JS API Key"
          clearable
          autocomplete="off"
          size="small"
        />
        <el-input
          v-model="keyForm.securityCode"
          placeholder="安全密钥 securityJsCode（新版 Key 必填）"
          clearable
          autocomplete="off"
          size="small"
        />
        <el-button type="primary" size="small" @click="saveInlineKey">
          保存并加载地图
        </el-button>
      </div>
    </div>

    <div v-else-if="loadError" class="amap-mask config-panel">
      <el-icon class="mask-icon error"><WarningFilled /></el-icon>
      <div class="mask-title">地图加载失败</div>
      <p class="mask-desc error-text">{{ loadError }}</p>
      <div class="key-inputs">
        <el-input
          v-model="keyForm.key"
          placeholder="JS API Key"
          clearable
          autocomplete="off"
          size="small"
        />
        <el-input
          v-model="keyForm.securityCode"
          placeholder="安全密钥 securityJsCode"
          clearable
          autocomplete="off"
          size="small"
        />
        <el-button type="primary" size="small" @click="saveInlineKey">
          重新配置并重试
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.amap-container {
  position: relative;
  width: 100%;
  border: 1px solid #e3e7ef;
  border-radius: 10px;
  overflow: hidden;
  background: #eef1f6;
}

.amap-el {
  width: 100%;
  height: 100%;
}

.amap-tools {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.amap-mask {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(180deg, #f7f9fc, #edf0f6);
  padding: 24px;
}

.spin-icon {
  font-size: 28px;
  color: #2563eb;
}

.mask-icon {
  font-size: 34px;
  color: #2563eb;
  margin-bottom: 10px;

  &.error {
    color: #ef4444;
  }
}

.mask-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.mask-desc {
  max-width: 420px;
  font-size: 13px;
  line-height: 1.8;
  color: #6b7280;
  margin: 0 0 14px;

  &.error-text {
    color: #dc2626;
    word-break: break-all;
  }
}

.config-panel {
  justify-content: center;
}

.key-inputs {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
