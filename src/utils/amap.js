import AMapLoader from '@amap/amap-jsapi-loader'
import { getMapConfig } from '../config'

const PLUGINS = [
  'AMap.Scale',
  'AMap.ToolBar',
  'AMap.Geolocation',
  'AMap.Geocoder',
  'AMap.AutoComplete',
  'AMap.MouseTool',
  'AMap.PolygonEditor',
]

let loaderPromise = null

export class AmapKeyMissingError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AmapKeyMissingError'
  }
}

/**
 * 加载高德 JS API（全局单例，重复调用复用同一个 Promise）
 */
export function loadAMap() {
  const { key, securityCode } = getMapConfig()
  if (!key) {
    return Promise.reject(new AmapKeyMissingError('未配置高德地图 Web 端 JS API Key'))
  }
  // 安全密钥必须在 loader 请求之前挂载到 window
  window._AMapSecurityConfig = securityCode ? { securityJsCode: securityCode } : undefined

  if (window.AMap) return Promise.resolve(window.AMap)

  if (!loaderPromise) {
    loaderPromise = AMapLoader.load({
      key,
      version: '2.0',
      plugins: PLUGINS,
    })
      .then((AMap) => {
        window.AMap = AMap
        return AMap
      })
      .catch((err) => {
        loaderPromise = null
        throw err
      })
  }
  return loaderPromise
}

/**
 * 逆地理编码：坐标 -> 结构化地址
 */
export function reverseGeocode(AMap, lng, lat) {
  return new Promise((resolve) => {
    try {
      const geocoder = new AMap.Geocoder({ radius: 100, extensions: 'base' })
      geocoder.getAddress([Number(lng), Number(lat)], (status, result) => {
        if (status === 'complete' && result && result.regeocode) {
          resolve(result.regeocode.formattedAddress || '')
        } else {
          resolve('')
        }
      })
    } catch (e) {
      resolve('')
    }
  })
}
