<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AmapContainer from './AmapContainer.vue'
import { normalizeAMapPath, polygonArea, formatArea } from '../../utils/geo'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const ready = ref(false)
const drawing = ref(false)
const editing = ref(false)

let AMap = null
let map = null
let polygon = null
let mouseTool = null
let polyEditor = null

const polygonStyle = {
  strokeColor: '#2563eb',
  strokeWeight: 2,
  strokeOpacity: 0.95,
  fillColor: '#3b82f6',
  fillOpacity: 0.16,
  strokeStyle: 'solid',
}

const pointCount = computed(() => props.modelValue.length)
const areaText = computed(() => formatArea(polygonArea(props.modelValue)))

function editorOpen() {
  if (!polyEditor || !polygon) return
  if (typeof polyEditor.open === 'function') polyEditor.open()
  else if (typeof polyEditor.startOpen === 'function') polyEditor.startOpen()
  editing.value = true
}

function editorClose() {
  if (!polyEditor) return
  if (typeof polyEditor.close === 'function') polyEditor.close()
  else if (typeof polyEditor.startClose === 'function') polyEditor.startClose()
  editing.value = false
}

function bindEditor(target) {
  // 编辑器全生命周期只构造一次：事件仅在构造时绑定，避免重复 .on() 造成监听器堆叠
  if (!polyEditor) {
    polyEditor = new AMap.PolygonEditor(map, target)
    bindEditorEvents()
    return
  }
  if (typeof polyEditor.setTarget === 'function') {
    polyEditor.setTarget(target)
    return
  }
  // 兜底：极旧版本无 setTarget，先关闭旧编辑器（其事件随旧实例一并释放）再重建
  editorClose()
  polyEditor = new AMap.PolygonEditor(map, target)
  bindEditorEvents()
}

function bindEditorEvents() {
  // 仅在 new PolygonEditor 之后调用一次，禁止在 setTarget 等路径重复调用
  const sync = () => syncFromPolygon()
  polyEditor.on('addnode', sync)
  polyEditor.on('removenode', sync)
  polyEditor.on('adjust', sync)
  polyEditor.on('move', sync)
  polyEditor.on('end', sync)
}

function syncFromPolygon() {
  if (!polygon) return
  const path = normalizeAMapPath(polygon.getPath())
  emit('update:modelValue', path)
}

function createPolygon(path) {
  polygon = new AMap.Polygon({ path, ...polygonStyle, bubble: false })
  map.add(polygon)
  bindEditor(polygon)
}

function clearPolygon() {
  editorClose()
  if (polygon) {
    map.remove(polygon)
    polygon = null
  }
  emit('update:modelValue', [])
}

function fitPolygon() {
  if (polygon) map.setFitView([polygon], false, [50, 20, 50, 20], 18)
}

function startDraw() {
  if (!ready.value) return
  editorClose()
  if (polygon) {
    map.remove(polygon)
    polygon = null
  }
  drawing.value = true
  ElMessage({
    message: '在地图上依次点击绘制工地边界，双击（或点击第一个顶点）完成绘制',
    type: 'info',
    duration: 3500,
  })
  mouseTool.polygon(polygonStyle)
}

function cancelDraw() {
  drawing.value = false
  mouseTool.close(true)
  if (!polygon && props.modelValue.length >= 3) {
    createPolygon(props.modelValue)
    fitPolygon()
  }
}

function toggleEdit() {
  if (editing.value) {
    editorClose()
  } else {
    editorOpen()
  }
}

function onReady(payload) {
  AMap = payload.AMap
  map = payload.map
  ready.value = true

  // PolygonEditor 延迟到首次绑定多边形时构造（见 bindEditor），事件随之只绑定一次
  mouseTool = new AMap.MouseTool(map)
  mouseTool.on('draw', (event) => {
    drawing.value = false
    mouseTool.close()
    polygon = event.obj
    polygon.setOptions(polygonStyle)
    bindEditor(polygon)
    syncFromPolygon()
    editorOpen()
    fitPolygon()
  })

  if (Array.isArray(props.modelValue) && props.modelValue.length >= 3) {
    createPolygon(props.modelValue)
    fitPolygon()
  }
}

onBeforeUnmount(() => {
  try {
    if (mouseTool) mouseTool.close(true)
    editorClose()
    if (polygon && map) map.remove(polygon)
  } catch (e) {
    // 容器销毁时忽略
  }
  polygon = null
  mouseTool = null
  polyEditor = null
  map = null
  AMap = null
})
</script>

<template>
  <div class="site-map-editor">
    <AmapContainer :zoom="16" height="440px" @ready="onReady">
      <template #tools>
        <el-button-group class="map-toolbar">
          <el-button
            type="primary"
            :disabled="!ready || drawing"
            @click="startDraw"
          >
            <el-icon><EditPen /></el-icon>&nbsp;{{ pointCount ? '重新绘制' : '绘制工地范围' }}
          </el-button>
          <el-button
            v-if="pointCount >= 3"
            :type="editing ? 'warning' : 'default'"
            :disabled="drawing"
            @click="toggleEdit"
          >
            {{ editing ? '完成编辑' : '编辑顶点' }}
          </el-button>
          <el-button
            v-if="drawing"
            @click="cancelDraw"
          >
            取消绘制
          </el-button>
          <el-button
            v-if="pointCount >= 3 && !drawing"
            @click="clearPolygon"
          >
            清除
          </el-button>
        </el-button-group>

        <div v-if="drawing" class="draw-hint">
          <el-icon><InfoFilled /></el-icon>
          单击添加边界点，双击完成
        </div>
      </template>
    </AmapContainer>

    <div class="range-meta">
      <template v-if="pointCount >= 3">
        <el-tag type="success" effect="light" round>
          <el-icon><CircleCheck /></el-icon>&nbsp;已圈定 {{ pointCount }} 个边界点
        </el-tag>
        <span class="area-text">估算占地面积：{{ areaText }}</span>
      </template>
      <el-tag v-else type="info" effect="plain" round>
        <el-icon><InfoFilled /></el-icon>&nbsp;尚未圈定工地范围
      </el-tag>
    </div>
  </div>
</template>

<style scoped lang="scss">
.site-map-editor {
  .map-toolbar {
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.15);
  }

  .draw-hint {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    font-size: 12px;
    color: #1d4ed8;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
  }

  .range-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    font-size: 13px;
    color: #4b5563;

    .area-text {
      font-weight: 500;
    }
  }
}
</style>
