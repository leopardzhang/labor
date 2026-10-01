<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getMapConfig, saveMapConfig } from '../config'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const form = ref({ key: '', securityCode: '' })
const saving = ref(false)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      const cfg = getMapConfig()
      form.value = { key: cfg.key, securityCode: cfg.securityCode }
    }
  }
)

function handleSave() {
  if (!form.value.key.trim()) {
    ElMessage.warning('请填写高德地图 Web 端 JS API Key')
    return
  }
  saving.value = true
  saveMapConfig(form.value)
  ElMessage.success('地图配置已保存')
  emit('update:modelValue', false)
  // 若地图 SDK 已用旧 Key 加载过，整页刷新以确保新 Key 生效
  setTimeout(() => {
    if (window.AMap) window.location.reload()
    saving.value = false
  }, 300)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="地图配置（高德地图 JS API）"
    width="520px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-alert type="info" :closable="false" show-icon class="key-tip">
      <template #title>
        工地范围绘制与打卡定位依赖高德地图。请前往
        <el-link
          type="primary"
          href="https://lbs.amap.com/api/javascript-api-v2/prerequisites"
          target="_blank"
          underlined="never"
        >
          高德开放平台
        </el-link>
        申请「Web端(JS API)」类型 Key；2021-12-02 之后申请的 Key 还需填写安全密钥（安全密钥可在控制台
        → 应用管理中查看）。配置仅保存在当前浏览器中。
      </template>
    </el-alert>

    <el-form label-position="top" class="key-form">
      <el-form-item label="JS API Key" required>
        <el-input
          v-model="form.key"
          placeholder="例如：a1b2c3d4e5f6..."
          clearable
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="安全密钥 securityJsCode（新版 Key 必填）">
        <el-input
          v-model="form.securityCode"
          placeholder="例如：xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          clearable
          autocomplete="off"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存并启用</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.key-tip {
  margin-bottom: 16px;
  line-height: 1.7;
}
.key-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
</style>
