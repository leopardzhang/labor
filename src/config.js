/**
 * 高德开放平台 Key 配置（已内置，无需在系统中手动填写）
 *
 * 申请地址：https://lbs.amap.com/api/javascript-api-v2/prerequisites
 * 注意：需使用「Web端(JS API)」类型 Key；2021-12-02 之后申请的 Key 需要配套安全密钥 securityJsCode
 * 安全建议：请在高德控制台为该 Key 配置域名白名单（允许的部署域名/localhost），避免被盗刷
 */
export const AMAP_KEY = 'f9d76025b3b3fa7b779e5ac851421821'
export const AMAP_SECURITY_CODE = '53ab07ea8ffb250cc8d6ac562e9de65b'

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
    key: (AMAP_KEY || saved.key || '').trim(),
    securityCode: (AMAP_SECURITY_CODE || saved.securityCode || '').trim(),
  }
}

export function saveMapConfig({ key, securityCode }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ key: (key || '').trim(), securityCode: (securityCode || '').trim() })
  )
  window.dispatchEvent(new Event(MAP_CONFIG_EVENT))
}
