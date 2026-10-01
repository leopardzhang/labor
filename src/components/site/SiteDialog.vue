<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SiteMapEditor from '../map/SiteMapEditor.vue'
import { uuid } from '../../utils/storage'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  site: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const saving = ref(false)

const defaultForm = () => ({
  id: '',
  name: '',
  address: '',
  remark: '',
  checkers: [{ id: uuid(), name: '', phone: '' }],
  polygon: [],
})

const form = reactive(defaultForm())

const rules = {
  name: [
    { required: true, message: '请输入工地名称', trigger: 'blur' },
    { min: 2, max: 40, message: '长度 2-40 个字符', trigger: 'blur' },
  ],
}

function addChecker() {
  form.checkers.push({ id: uuid(), name: '', phone: '' })
}

function removeChecker(id) {
  if (form.checkers.length === 1) {
    ElMessage.warning('至少保留一名打卡负责人')
    return
  }
  form.checkers = form.checkers.filter((item) => item.id !== id)
}

function resetForm() {
  Object.assign(form, defaultForm())
  formRef.value?.clearValidate()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    if (props.site) {
      Object.assign(form, {
        ...defaultForm(),
        ...JSON.parse(JSON.stringify(props.site)),
        checkers:
          props.site.checkers?.length
            ? JSON.parse(JSON.stringify(props.site.checkers))
            : [{ id: uuid(), name: '', phone: '' }],
        polygon: Array.isArray(props.site.polygon) ? [...props.site.polygon] : [],
      })
    } else {
      Object.assign(form, defaultForm())
    }
  }
)

async function handleSubmit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    const checkers = form.checkers.filter((item) => item.name.trim())
    if (!checkers.length) {
      ElMessage.warning('请至少设置一名负责打卡的人员（填写姓名）')
      return
    }
    for (const checker of checkers) {
      if (checker.phone && !/^1\d{10}$/.test(checker.phone)) {
        ElMessage.warning(`负责人「${checker.name}」的手机号格式不正确`)
        return
      }
    }
    if (!form.polygon.length || form.polygon.length < 3) {
      ElMessage.warning('请在地图上绘制工地范围（至少 3 个边界点）')
      return
    }

    saving.value = true
    try {
      emit('submit', {
        id: form.id || undefined,
        name: form.name.trim(),
        address: form.address.trim(),
        remark: form.remark.trim(),
        checkers: checkers.map((item) => ({
          id: item.id,
          name: item.name.trim(),
          phone: item.phone.trim(),
        })),
        polygon: form.polygon.map((p) => [Number(p[0]), Number(p[1])]),
      })
    } finally {
      saving.value = false
    }
  })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="site ? '编辑工地' : '新增工地'"
    width="900px"
    top="6vh"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="site-form"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="工地名称" prop="name">
            <el-input v-model="form.name" placeholder="例如：北京国贸在建项目" maxlength="40" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工地地址">
            <el-input v-model="form.address" placeholder="选填，例如：朝阳区建国门外大街" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="打卡负责人">
        <div class="checker-list">
          <div v-for="(checker, index) in form.checkers" :key="checker.id" class="checker-row">
            <el-input
              v-model="checker.name"
              placeholder="负责人姓名"
              maxlength="20"
              class="checker-name"
            />
            <el-input
              v-model="checker.phone"
              placeholder="手机号（选填）"
              maxlength="11"
              class="checker-phone"
            />
            <el-button
              circle
              plain
              type="danger"
              :disabled="form.checkers.length === 1"
              @click="removeChecker(checker.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
            <span v-if="index === 0" class="checker-badge">负责该工地的打卡管理</span>
          </div>
          <el-button type="primary" link @click="addChecker">
            <el-icon><Plus /></el-icon>&nbsp;添加负责人
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="工地范围">
        <SiteMapEditor v-model="form.polygon" />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="2"
          placeholder="选填，例如打卡通道、考勤要求等"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.site-form {
  margin-top: 4px;
}

.checker-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checker-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .checker-name {
    width: 180px;
    flex: none;
  }

  .checker-phone {
    width: 200px;
    flex: none;
  }

  .checker-badge {
    font-size: 12px;
    color: #94a3b8;
  }
}
</style>
