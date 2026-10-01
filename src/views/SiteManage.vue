<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SiteDialog from '../components/site/SiteDialog.vue'
import { initData, listSites, removeSite, saveSite } from '../store/db'
import { formatArea, polygonArea } from '../utils/geo'

const sites = computed(() => listSites())

const dialogVisible = ref(false)
const editingSite = ref(null)

const page = ref(1)
const pageSize = 8
const pagedSites = computed(() =>
  sites.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

onMounted(() => {
  initData()
})

function openCreate() {
  editingSite.value = null
  dialogVisible.value = true
}

function openEdit(row) {
  editingSite.value = row
  dialogVisible.value = true
}

function handleSubmit(payload) {
  saveSite(payload)
  dialogVisible.value = false
  ElMessage.success(payload.id ? '工地信息已更新' : '工地创建成功')
}

async function handleDelete(row) {
  await ElMessageBox.confirm(
    `确定删除工地「${row.name}」吗？已有的打卡记录会保留，但将无法关联该工地。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  )
  removeSite(row.id)
  ElMessage.success('工地已删除')
  const maxPage = Math.max(1, Math.ceil(sites.value.length / pageSize))
  if (page.value > maxPage) page.value = maxPage
}

function areaOf(row) {
  return formatArea(polygonArea(row.polygon))
}
</script>

<template>
  <div class="site-page">
    <div class="toolbar page-card">
      <div>
        <div class="toolbar-title">工地列表</div>
        <div class="toolbar-desc">维护工地基础信息、地图围栏范围与打卡负责人</div>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>&nbsp;新增工地
      </el-button>
    </div>

    <div class="page-card table-card">
      <el-table :data="pagedSites" style="width: 100%" empty-text="还没有工地，点击右上角新增">
        <el-table-column label="工地名称" min-width="220">
          <template #default="{ row }">
            <div class="site-name">
              <span class="site-dot"><el-icon><OfficeBuilding /></el-icon></span>
              <div>
                <div class="name-text">{{ row.name }}</div>
                <div class="name-address">{{ row.address || '未填写地址' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="工地范围" width="230">
          <template #default="{ row }">
            <el-tag v-if="row.polygon?.length >= 3" type="success" effect="light" round>
              {{ row.polygon.length }} 个边界点
            </el-tag>
            <el-tag v-else type="danger" effect="light" round>未圈定</el-tag>
            <div class="range-area">{{ areaOf(row) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="打卡负责人" min-width="220">
          <template #default="{ row }">
            <div class="checker-tags">
              <el-tooltip
                v-for="checker in row.checkers || []"
                :key="checker.id"
                :content="checker.phone || '未填写手机号'"
                placement="top"
              >
                <el-tag class="checker-tag" type="primary" effect="plain">
                  <el-icon><User /></el-icon>&nbsp;{{ checker.name }}
                </el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="170" />

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">
              <el-icon><Edit /></el-icon>&nbsp;编辑
            </el-button>
            <el-popconfirm
              title="确认删除该工地？"
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
          :total="sites.length"
          layout="共 {total} 个工地"
          background
        />
      </div>
    </div>

    <SiteDialog
      v-model="dialogVisible"
      :site="editingSite"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.site-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;

  .toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .toolbar-desc {
    margin-top: 4px;
    font-size: 12px;
    color: #94a3b8;
  }
}

.table-card {
  padding: 8px 16px 16px;
}

.site-name {
  display: flex;
  align-items: center;
  gap: 10px;

  .site-dot {
    width: 34px;
    height: 34px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: #2563eb;
    background: #eff6ff;
    font-size: 17px;
  }

  .name-text {
    font-weight: 600;
    color: #1f2937;
  }

  .name-address {
    margin-top: 2px;
    font-size: 12px;
    color: #94a3b8;
  }
}

.range-area {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.checker-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.checker-tag {
  border-radius: 14px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
