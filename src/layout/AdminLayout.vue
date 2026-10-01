<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '')
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
    </el-aside>

    <el-container class="main-container">
      <el-header class="topbar" height="56px">
        <div class="page-title">{{ pageTitle }}</div>
      </el-header>

      <el-main class="page-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
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

.main-container {
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
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
}

.page-main {
  padding: 20px 24px 24px;
  background: #f3f5f9;
  overflow-y: auto;
}
</style>
