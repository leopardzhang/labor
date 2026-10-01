<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RecordDialog from '../components/record/RecordDialog.vue'
import RecordDetailDrawer from '../components/record/RecordDetailDrawer.vue'
import {
  addRecord,
  getSite,
  initData,
  listRecords,
  listSites,
  listTeams,
  removeRecord,
} from '../store/db'
import { pointInPolygon, formatCoord } from '../utils/geo'

const sites = computed(() => listSites())
const records = computed(() => listRecords())
const teams = computed(() => listTeams())

const dialogVisible = ref(false)

const drawerVisible = ref(false)
const currentRecord = ref(null)
const currentSite = computed(() =>
  currentRecord.value ? getSite(currentRecord.value.siteId) : null
)

const page = ref(1)
const pageSize = 10

const filters = reactive({
  siteId: '',
  team: '',
  keyword: '',
  dateRange: [],
  status: '',
})

function statusOf(record) {
  const site = getSite(record.siteId)
  if (!site || !Array.isArray(site.polygon) || site.polygon.length < 3) return 'unknown'
  return pointInPolygon([record.lng, record.lat], site.polygon) ? 'inside' : 'outside'
}

const filteredRecords = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()
  return records.value
    .filter((item) => {
      if (filters.siteId && item.siteId !== filters.siteId) return false
      if (filters.team && item.team !== filters.team) return false
      if (keyword) {
        const haystack = `${item.name || ''}${item.idCard || ''}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        const day = (item.time || '').slice(0, 10)
        if (day < filters.dateRange[0] || day > filters.dateRange[1]) return false
      }
      if (filters.status && statusOf(item) !== filters.status) return false
      return true
    })
    .sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))
})

const pagedRecords = computed(() =>
  filteredRecords.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

function resetFilters() {
  filters.siteId = ''
  filters.team = ''
  filters.keyword = ''
  filters.dateRange = []
  filters.status = ''
  page.value = 1
}

function siteNameOf(record) {
  return getSite(record.siteId)?.name || '工地已删除'
}

function openDetail(row) {
  currentRecord.value = row
  drawerVisible.value = true
}

function handleSubmit(payload) {
  addRecord(payload)
  dialogVisible.value = false
  ElMessage.success('打卡记录已保存')
  const maxPage = Math.max(1, Math.ceil(filteredRecords.value.length / pageSize))
  if (page.value > maxPage) page.value = maxPage
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」的这条打卡记录吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  removeRecord(row.id)
  if (currentRecord.value?.id === row.id) drawerVisible.value = false
  ElMessage.success('记录已删除')
  const maxPage = Math.max(1, Math.ceil(filteredRecords.value.length / pageSize))
  if (page.value > maxPage) page.value = maxPage
}

onMounted(() => {
  initData()
})
</script>

<template>
  <div class="record-page">
    <!-- 筛选区 -->
    <div class="page-card filter-card">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="工地">
          <el-select
            v-model="filters.siteId"
            placeholder="全部工地"
            clearable
            filterable
            style="width: 200px"
            @change="page = 1"
          >
            <el-option v-for="site in sites" :key="site.id" :label="site.name" :value="site.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班组">
          <el-select
            v-model="filters.team"
            placeholder="全部班组"
            clearable
            filterable
            style="width: 150px"
            @change="page = 1"
          >
            <el-option v-for="team in teams" :key="team" :label="team" :value="team" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 140px" @change="page = 1">
            <el-option label="在工地范围内" value="inside" />
            <el-option label="超出工地范围" value="outside" />
            <el-option label="无法判断" value="unknown" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="page = 1"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="姓名 / 身份证号"
            clearable
            style="width: 190px"
            @input="page = 1"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">
            <el-icon><RefreshLeft /></el-icon>&nbsp;重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区 -->
    <div class="page-card table-card">
      <div class="table-head">
        <div class="head-title">
          打卡明细
          <el-tag round effect="plain" type="info">{{ filteredRecords.length }} 条</el-tag>
        </div>
        <el-button type="primary" @click="dialogVisible = true">
          <el-icon><Plus /></el-icon>&nbsp;新增打卡
        </el-button>
      </div>

      <el-table :data="pagedRecords" style="width: 100%" empty-text="没有符合条件的打卡记录">
        <el-table-column label="打卡图片" width="92">
          <template #default="{ row }">
            <el-image
              :src="row.photo"
              :preview-src-list="[row.photo]"
              fit="cover"
              class="thumb"
              preview-teleported
            >
              <template #error>
                <div class="thumb-error"><el-icon><PictureFilled /></el-icon></div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="工人姓名" width="100">
          <template #default="{ row }">
            <span class="worker-name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="性别" width="60" prop="gender" />

        <el-table-column label="身份证号" width="180">
          <template #default="{ row }">
            <span class="mono">{{ row.idCard }}</span>
          </template>
        </el-table-column>

        <el-table-column label="班组" width="100">
          <template #default="{ row }">
            <el-tag effect="plain" round size="small">{{ row.team }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="所属工地" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ siteNameOf(row) }}</template>
        </el-table-column>

        <el-table-column label="打卡坐标" width="190">
          <template #default="{ row }">
            <span class="mono coord">
              {{ formatCoord(row.lng) }}, {{ formatCoord(row.lat) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="打卡时间" width="170" prop="time" sortable="custom" />

        <el-table-column label="考勤状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="statusOf(row) === 'inside'" type="success" effect="light" round>
              在范围内
            </el-tag>
            <el-tag v-else-if="statusOf(row) === 'outside'" type="danger" effect="light" round>
              超出范围
            </el-tag>
            <el-tag v-else type="info" effect="plain" round>无法判断</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">
              <el-icon><View /></el-icon>&nbsp;查看
            </el-button>
            <el-popconfirm
              title="确认删除该条打卡记录？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link>
                  <el-icon><Delete /></el-icon>&nbsp;删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filteredRecords.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </div>

    <RecordDialog
      v-model="dialogVisible"
      :sites="sites"
      :teams="teams"
      @submit="handleSubmit"
    />

    <RecordDetailDrawer
      v-model="drawerVisible"
      :record="currentRecord"
      :site="currentSite"
    />
  </div>
</template>

<style scoped lang="scss">
.record-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  padding: 16px 18px 0;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.table-card {
  padding: 16px 16px 14px;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .head-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
}

.thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: 1px solid #eef0f5;
  cursor: zoom-in;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumb-error {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f5f9;
  color: #cbd5e1;
  font-size: 20px;
}

.worker-name {
  font-weight: 600;
  color: #1f2937;
}

.mono {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  color: #4b5563;

  &.coord {
    color: #2563eb;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
