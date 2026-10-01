<script setup>
import { computed } from 'vue'
import MiniMap from '../map/MiniMap.vue'
import { pointInPolygon, formatCoord } from '../../utils/geo'
import { parseIdCard } from '../../utils/format'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
  site: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const inRange = computed(() => {
  if (!props.record || !props.site?.polygon?.length) return null
  return pointInPolygon([props.record.lng, props.record.lat], props.site.polygon)
})

const idInfo = computed(() =>
  props.record ? parseIdCard(props.record.idCard) : null
)
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    title="打卡详情"
    size="430px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="record" class="detail-body">
      <el-image
        :src="record.photo"
        :preview-src-list="[record.photo]"
        fit="cover"
        class="detail-photo"
        preview-teleported
      >
        <template #error>
          <div class="photo-error"><el-icon><PictureFilled /></el-icon>照片加载失败</div>
        </template>
      </el-image>

      <div class="detail-section">
        <div class="section-title">
          <el-icon><User /></el-icon>&nbsp;工人信息
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>姓名</label>
            <span>{{ record.name }}</span>
          </div>
          <div class="info-item">
            <label>性别</label>
            <span>{{ record.gender }}</span>
          </div>
          <div class="info-item">
            <label>班组</label>
            <span>{{ record.team }}</span>
          </div>
          <div class="info-item">
            <label>出生日期</label>
            <span>{{ idInfo?.birth || '—' }}</span>
          </div>
          <div class="info-item span-2">
            <label>身份证号</label>
            <span class="mono">{{ record.idCard }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">
          <el-icon><Clock /></el-icon>&nbsp;打卡信息
        </div>
        <div class="info-grid">
          <div class="info-item span-2">
            <label>所属工地</label>
            <span>{{ site?.name || '工地已删除' }}</span>
          </div>
          <div class="info-item span-2">
            <label>打卡时间</label>
            <span>{{ record.time }}</span>
          </div>
          <div class="info-item span-2">
            <label>考勤状态</label>
            <span>
              <el-tag v-if="inRange === true" type="success" effect="light" round>
                在工地范围内
              </el-tag>
              <el-tag v-else-if="inRange === false" type="danger" effect="light" round>
                超出工地范围
              </el-tag>
              <el-tag v-else type="info" effect="plain" round>无法判断（工地未设置范围）</el-tag>
            </span>
          </div>
          <div class="info-item">
            <label>经度</label>
            <span class="mono">{{ formatCoord(record.lng) }}</span>
          </div>
          <div class="info-item">
            <label>纬度</label>
            <span class="mono">{{ formatCoord(record.lat) }}</span>
          </div>
          <div class="info-item span-2" v-if="record.address">
            <label>定位地址</label>
            <span>{{ record.address }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="site?.polygon?.length || record.lng">
        <div class="section-title">
          <el-icon><MapLocation /></el-icon>&nbsp;位置与工地围栏
        </div>
        <MiniMap
          :point="[record.lng, record.lat]"
          :polygon="site?.polygon || []"
          height="240px"
        />
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.detail-body {
  padding: 18px 20px 28px;
}

.detail-photo {
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.photo-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 13px;

  .el-icon {
    font-size: 30px;
  }
}

.detail-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;

  .el-icon {
    color: #2563eb;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #eef1f6;
  border-radius: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 13px;
  color: #1f2937;

  &.span-2 {
    grid-column: span 2;
  }

  label {
    font-size: 12px;
    color: #94a3b8;
  }

  .mono {
    font-family: 'SFMono-Regular', Consolas, monospace;
    letter-spacing: 0.3px;
  }
}
</style>
