<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import LocationPicker from '../map/LocationPicker.vue'
import { fileToCompressedDataURL } from '../../utils/image'
import { parseIdCard, nowDateTime } from '../../utils/format'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sites: { type: Array, default: () => [] },
  teams: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const saving = ref(false)
const compressing = ref(false)

const defaultForm = () => ({
  siteId: '',
  name: '',
  gender: '男',
  idCard: '',
  team: '',
  address: '',
  lng: null,
  lat: null,
  photo: '',
  time: nowDateTime(),
})

const form = reactive(defaultForm())
const point = ref(null)

const rules = {
  siteId: [{ required: true, message: '请选择所属工地', trigger: 'change' }],
  name: [
    { required: true, message: '请输入工人姓名', trigger: 'blur' },
    { max: 20, message: '姓名不超过 20 个字符', trigger: 'blur' },
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号应为 18 位', trigger: 'blur' },
  ],
  team: [{ required: true, message: '请输入班组', trigger: 'blur' }],
  time: [{ required: true, message: '请选择打卡时间', trigger: 'change' }],
}

function onIdCardChange() {
  const info = parseIdCard(form.idCard.trim())
  if (info) form.gender = info.gender
}

async function onPickFile(uploadFile) {
  const raw = uploadFile.raw
  if (!raw) return
  compressing.value = true
  try {
    form.photo = await fileToCompressedDataURL(raw)
    ElMessage.success('照片已添加')
  } catch (e) {
    ElMessage.error(e.message || '照片处理失败，请更换图片')
  } finally {
    compressing.value = false
  }
}

function removePhoto() {
  form.photo = ''
}

function onPointChange(coords) {
  form.lng = coords[0]
  form.lat = coords[1]
}

function resetForm() {
  Object.assign(form, defaultForm())
  point.value = null
  formRef.value?.clearValidate()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      Object.assign(form, defaultForm())
      point.value = null
    }
  }
)

async function handleSubmit() {
  await formRef.value.validate((valid) => {
    if (!valid) return
    if (!form.photo) {
      ElMessage.warning('请上传打卡现场照片')
      return
    }
    if (form.lng === null || form.lat === null) {
      ElMessage.warning('请通过地图点选或 GPS 定位获取打卡坐标')
      return
    }
    saving.value = true
    emit('submit', {
      siteId: form.siteId,
      name: form.name.trim(),
      gender: form.gender,
      idCard: form.idCard.trim().toUpperCase(),
      team: form.team.trim(),
      address: form.address.trim(),
      lng: form.lng,
      lat: form.lat,
      photo: form.photo,
      time: form.time,
    })
    setTimeout(() => {
      saving.value = false
    }, 300)
  })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="新增打卡记录"
    width="780px"
    top="5vh"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="92px"
      class="record-form"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属工地" prop="siteId">
            <el-select v-model="form.siteId" placeholder="请选择工地" filterable style="width: 100%">
              <el-option
                v-for="site in sites"
                :key="site.id"
                :label="site.name"
                :value="site.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="打卡时间" prop="time">
            <el-date-picker
              v-model="form.time"
              type="datetime"
              placeholder="选择打卡时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="工人姓名" prop="name">
            <el-input v-model="form.name" placeholder="与身份证一致" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别">
            <el-radio-group v-model="form.gender">
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="班组" prop="team">
            <el-select
              v-model="form.team"
              placeholder="选择或输入班组"
              filterable
              allow-create
              default-first-option
              style="width: 100%"
            >
              <el-option v-for="team in teams" :key="team" :label="team" :value="team" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="身份证号" prop="idCard">
        <el-input
          v-model="form.idCard"
          placeholder="18 位身份证号，填写后自动识别性别"
          maxlength="18"
          @change="onIdCardChange"
        />
      </el-form-item>

      <el-form-item label="打卡照片">
        <div class="photo-field">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onPickFile"
          >
            <div v-if="form.photo" class="photo-preview-wrap">
              <img :src="form.photo" class="photo-preview" alt="打卡照片" />
              <span class="photo-mask"><el-icon><RefreshRight /></el-icon>&nbsp;重新上传</span>
            </div>
            <div v-else v-loading="compressing" class="photo-placeholder">
              <el-icon><Camera /></el-icon>
              <span>上传打卡照片</span>
              <em>手机端可直接拍照</em>
            </div>
          </el-upload>
          <el-button v-if="form.photo" link type="danger" @click="removePhoto">
            <el-icon><Delete /></el-icon>&nbsp;移除照片
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="打卡位置">
        <div class="location-field">
          <LocationPicker
            :model-value="point"
            @update:model-value="onPointChange"
            @update:address="form.address = $event"
          />
          <el-input
            v-model="form.address"
            class="address-input"
            placeholder="详细地址（定位后自动填充，可手动修改）"
            maxlength="100"
          >
            <template #prefix><el-icon><Location /></el-icon></template>
          </el-input>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存记录</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.photo-field {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}

.photo-preview-wrap {
  position: relative;
  width: 168px;
  height: 126px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e3e7ef;

  .photo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #fff;
    background: rgba(15, 23, 42, 0.55);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .photo-mask {
    opacity: 1;
  }
}

.photo-placeholder {
  width: 168px;
  height: 126px;
  border: 1.5px dashed #c7cedb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #64748b;
  background: #f8fafc;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;

  .el-icon {
    font-size: 26px;
  }

  span {
    font-size: 13px;
  }

  em {
    font-style: normal;
    font-size: 11px;
    color: #94a3b8;
  }

  &:hover {
    border-color: #2563eb;
    color: #2563eb;
  }
}

.location-field {
  width: 100%;

  .address-input {
    margin-top: 10px;
  }
}
</style>
