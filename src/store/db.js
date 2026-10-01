/**
 * 数据访问层：当前基于 localStorage 持久化。
 * 后续对接 O2OA / 后端接口时，只需替换本文件实现，视图层无需改动。
 */
import { ref } from 'vue'
import { readStorage, writeStorage, STORAGE_KEYS, uuid } from '../utils/storage'
import { seedSites, seedRecords } from '../data/seed'
import { nowDateTime } from '../utils/format'

const sites = ref([])
const records = ref([])
let initialized = false

function persistSites() {
  writeStorage(STORAGE_KEYS.sites, sites.value)
}

function persistRecords() {
  writeStorage(STORAGE_KEYS.records, records.value)
}

/** 应用启动时调用一次：首次进入写入演示数据 */
export function initData() {
  if (initialized) return
  if (!readStorage(STORAGE_KEYS.seeded)) {
    writeStorage(STORAGE_KEYS.sites, seedSites)
    writeStorage(STORAGE_KEYS.records, seedRecords)
    writeStorage(STORAGE_KEYS.seeded, true)
  }
  sites.value = readStorage(STORAGE_KEYS.sites, []) || []
  records.value = readStorage(STORAGE_KEYS.records, []) || []
  initialized = true
}

/* ---------------- 工地 ---------------- */

export function listSites() {
  return sites.value
}

export function getSite(id) {
  return sites.value.find((item) => item.id === id) || null
}

export function saveSite(data) {
  if (data.id) {
    const idx = sites.value.findIndex((item) => item.id === data.id)
    if (idx !== -1) {
      sites.value[idx] = { ...sites.value[idx], ...data }
    }
  } else {
    sites.value.unshift({
      ...data,
      id: uuid(),
      createdAt: nowDateTime(),
    })
  }
  persistSites()
}

export function removeSite(id) {
  sites.value = sites.value.filter((item) => item.id !== id)
  persistSites()
}

/* ---------------- 打卡记录 ---------------- */

export function listRecords() {
  return records.value
}

export function addRecord(data) {
  records.value.unshift({
    ...data,
    id: uuid(),
    createdAt: data.time || nowDateTime(),
  })
  persistRecords()
}

export function removeRecord(id) {
  records.value = records.value.filter((item) => item.id !== id)
  persistRecords()
}

/** 已有班组（供输入联想/筛选） */
export function listTeams() {
  return [...new Set(records.value.map((item) => item.team).filter(Boolean))]
}
