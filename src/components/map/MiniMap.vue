<script setup>
import { ref } from 'vue'
import AmapContainer from './AmapContainer.vue'

const props = defineProps({
  point: { type: Array, default: null }, // [lng, lat]
  polygon: { type: Array, default: () => [] },
  height: { type: String, default: '260px' },
})

const ready = ref(false)
let AMap = null
let map = null

function onReady(payload) {
  AMap = payload.AMap
  map = payload.map
  ready.value = true

  const overlays = []

  if (Array.isArray(props.polygon) && props.polygon.length >= 3) {
    const polygon = new AMap.Polygon({
      path: props.polygon,
      strokeColor: '#2563eb',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      fillColor: '#3b82f6',
      fillOpacity: 0.14,
    })
    map.add(polygon)
    overlays.push(polygon)
  }

  if (Array.isArray(props.point) && props.point.length === 2) {
    const marker = new AMap.Marker({
      position: props.point,
      anchor: 'bottom-center',
    })
    map.add(marker)
    overlays.push(marker)
  }

  if (overlays.length) {
    map.setFitView(overlays, false, [60, 30, 40, 30], 18)
  }
}
</script>

<template>
  <AmapContainer
    :center="point && point.length === 2 ? point : [116.4074, 39.909]"
    :zoom="16"
    :height="height"
    @ready="onReady"
  />
</template>
