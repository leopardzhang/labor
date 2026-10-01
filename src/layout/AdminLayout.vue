<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMapConfig } from '../config'
import MapKeyDialog from '../components/MapKeyDialog.vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '')

const keyDialogVisible = ref(false)
const hasMapKey = computed(() => !!getMapConfig().key)
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="sidebar">
      <div class="brand">
        <div class="brand-logo">
          <el-icon><Tools /></el-icon>
        </div>
        <div class="brand-text">
          <div class="brand-name">劳务打卡管理</div>
          <div class="brand-sub">Labor Attendance</div>
        </div>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="side-menu"
        router
        background-color="transparent"
        text-color="#b9c0d0"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/sites">
          <el-icon><OfficeBuilding /></el-icon>
          <span>工地管理</span>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><Postcard /></el-icon>
          <span>打卡记录</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <button class="map-config-btn" @click="keyDialogVisible = true">
          <el-icon><Setting /></el-icon>
          <span>地图配置</span>
          <span class="status-dot" :class="{ ok: hasMapKey }" />
        </button>
      </div>
    </el-aside>

    <el-container class="main-container">
      <el-header class="topbar" height="56px">
        <div class="page-title">{{ pageTitle }}</div>
        <div class="topbar-right">
          <el-tag v-if="!hasMapKey" type="warning" effect="plain" round @click="keyDialogVisible = true">
            <el-icon><WarningFilled /></el-icon>&nbsp;未配置地图 Key，点此配置
          </el-tag>
          <el-tag v-else type="success" effect="plain" round>
            <span class="status-dot ok" />高德地图已启用
          </el-tag>
        </div>
      </el-header>

      <el-main class="page-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <MapKeyDialog v-model="keyDialogVisible" />
  </el-container>
</template>

<style scoped lang="scss">
.admin-layout {
  height: 100%;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #17233d 0%, #101a30 100%);
  box-shadow: 2px 0 8px rgba(15, 23, 42, 0.15);
  position: relative;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  padding: 0 18px;
  color: #fff;

  .brand-logo {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
  }

  .brand-name {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.3;
  }

  .brand-sub {
    font-size: 11px;
    color: #7d89a3;
    letter-spacing: 1px;
  }
}

.side-menu {
  flex: 1;
  border-right: none;
  padding: 8px 12px;

  :deep(.el-menu-item) {
    height: 46px;
    line-height: 46px;
    border-radius: 8px;
    margin-bottom: 4px;
    font-size: 14px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    &.is-active {
      background: linear-gradient(90deg, #2563eb, #3b82f6);
      color: #fff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.map-config-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #b9c0d0;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }

  .status-dot {
    margin-left: auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f59e0b;

    &.ok {
      background: #22c55e;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
    }
  }
}

.main-container {
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #eceef3;
  padding: 0 24px;

  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 16px;
      border-radius: 2px;
      background: #2563eb;
      margin-right: 10px;
      vertical-align: -2px;
    }
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-tag {
      cursor: pointer;
    }

    .status-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      margin-right: 2px;
    }
  }
}

.page-main {
  padding: 20px 24px 24px;
  background: #f3f5f9;
  overflow-y: auto;
}
</style>
