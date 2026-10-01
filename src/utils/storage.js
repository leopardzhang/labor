const PREFIX = 'labor.'

export const STORAGE_KEYS = {
  sites: `${PREFIX}sites`,
  records: `${PREFIX}records`,
  seeded: `${PREFIX}seeded.v1`,
}

export function readStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    // 通常是存储空间不足（图片过大）
    console.error('本地存储写入失败', e)
    return false
  }
}

export function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}
