/**
 * 高德开放平台 Key 配置
 *
 * 方式一：直接把 Web 端 JS API Key / 安全密钥填写到下方常量中（随代码保存）
 * 方式二：启动系统后，在左下角「地图配置」中填写（仅保存在当前浏览器 localStorage）
 *
 * 申请地址：https://lbs.amap.com/api/javascript-api-v2/prerequisites
 * 注意：需申请「Web端(JS API)」类型 Key；2021-12-02 之后申请的 Key 需要配套安全密钥 securityJsCode
 */
export const AMAP_KEY = ''
export const AMAP_SECURITY_CODE = ''

const STORAGE_KEY = 'labor.map.config'
export const MAP_CONFIG_EVENT = 'labor:amap-config-changed'

export function getMapConfig() {
  let saved = {}
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch (e) {
    saved = {}
  }
  return {
    key: (saved.key || AMAP_KEY || '').trim(),
    securityCode: (saved.securityCode || AMAP_SECURITY_CODE || '').trim(),
  }
}

export function saveMapConfig({ key, securityCode }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ key: (key || '').trim(), securityCode: (securityCode || '').trim() })
  )
  window.dispatchEvent(new Event(MAP_CONFIG_EVENT))
}
