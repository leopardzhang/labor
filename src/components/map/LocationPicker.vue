<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AmapContainer from './AmapContainer.vue'
import { reverseGeocode } from '../../utils/amap'
import { formatCoord } from '../../utils/geo'

const props = defineProps({
  modelValue: { type: Array, default: null }, // [lng, lat]
})
const emit = defineEmits(['update:modelValue', 'update:address'])

const ready = ref(false)
const locating = ref(false)
const searchEl = ref(null)

let AMap = null
let map = null
let marker = null
let geolocation = null
let autoComplete = null

const hasPoint = () => Array.isArray(props.modelValue) && props.modelValue.length === 2

function applyPoint(lnglat, regeo = true) {
  const lng = Number(lnglat[0])
  const lat = Number(lnglat[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
  marker.show()
  marker.setPosition([lng, lat])
  map.setCenter([lng, lat])
  emit('update:modelValue', [Number(lng.toFixed(6)), Number(lat.toFixed(6))])
  if (regeo) {
    reverseGeocode(AMap, lng, lat).then((address) => {
      if (address) emit('update:address', address)
    })
  }
}

function useMyLocation() {
  if (!ready.value || locating.value) return
  locating.value = true
  geolocation.getCurrentPosition((status, result) => {
    locating.value = false
    if (status === 'complete' && result.position) {
      const { lng, lat } = result.position
      applyPoint([lng, lat])
      map.setZoom(17)
      ElMessage.success('已定位到当前位置')
    } else {
      ElMessage.error(
        `定位失败：${result?.message || '请检查浏览器定位权限，可直接在地图上点选打卡位置'}`
      )
    }
  })
}

async function onReady(payload) {
  AMap = payload.AMap
  map = payload.map
  ready.value = true
  await nextTick()

  marker = new AMap.Marker({
    position: props.center || [116.4074, 39.909],
    anchor: 'bottom-center',
    visible: hasPoint(),
  })
  map.add(marker)

  geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    showButton: false,
    showMarker: false,
    showCircle: false,
    panToLocation: false,
    zoomToAccuracy: false,
  })
  map.addControl(geolocation)

  map.on('click', (event) => {
    applyPoint(event.lnglat)
  })

  const inputEl =
    searchEl.value?.$el?.querySelector?.('input') || searchEl.value || undefined
  if (inputEl) {
    autoComplete = new AMap.AutoComplete({ input: inputEl, city: '全国' })
    autoComplete.on('select', (event) => {
      const loc = event.pointee?.location || event.poi?.location
      if (loc) {
        applyPoint([loc.lng, loc.lat])
        map.setZoom(17)
      }
    })
  }

  if (hasPoint()) {
    marker.setPosition(props.modelValue)
    map.setZoom(16)
    map.setCenter(props.modelValue)
  }
}

onBeforeUnmount(() => {
  try {
    if (autoComplete && searchEl.value) autoComplete.setCity?.('')
  } catch (e) {
    // ignore
  }
  AMap = null
  map = null
  marker = null
  geolocation = null
  autoComplete = null
})
</script>

<template>
  <div class="location-picker">
    <AmapContainer :zoom="15" height="340px" @ready="onReady">
      <template #tools>
        <div class="search-box">
          <el-input
            ref="searchEl"
            placeholder="搜索地点，或直接点击地图点选"
            clearable
            size="default"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-button type="primary" :loading="locating" @click="useMyLocation">
          <el-icon><Aim /></el-icon>&nbsp;GPS 定位
        </el-button>
      </template>

      <div v-if="hasPoint()" class="coord-bar">
        <el-icon><LocationInformation /></el-icon>
        <span>经度 {{ formatCoord(modelValue[0]) }}</span>
        <span>纬度 {{ formatCoord(modelValue[1]) }}</span>
      </div>
      <div v-else class="coord-bar placeholder">
        <el-icon><InfoFilled /></el-icon>&nbsp;点击地图或使用 GPS 定位获取打卡坐标
      </div>
    </AmapContainer>
  </div>
</template>

<style scoped lang="scss">
.location-picker {
  .search-box {
    width: 280px;
  }

  :deep(.amap-tools) {
    right: 12px;
    justify-content: flex-end;
  }

  .coord-bar {
    position: absolute;
    left: 12px;
    bottom: 12px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 7px 14px;
    font-size: 12px;
    color: #1e40af;
    background: rgba(239, 246, 255, 0.96);
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.12);

    &.placeholder {
      color: #6b7280;
      background: rgba(255, 255, 255, 0.94);
      border-color: #e5e7eb;
    }
  }
}
</style>
