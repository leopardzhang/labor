/**
 * 地理几何工具（坐标均为高德 GCJ-02 经纬度，[lng, lat]）
 */

/**
 * 点是否在多边形范围内（射线法），边界点视为范围内
 */
export function pointInPolygon(point, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return false
  const [x, y] = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = Number(polygon[i][0])
    const yi = Number(polygon[i][1])
    const xj = Number(polygon[j][0])
    const yj = Number(polygon[j][1])
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * 多边形面积（平方米）。按中心纬度做等距圆柱投影后使用鞋带公式，
 * 工地尺度下误差可忽略。
 */
export function polygonArea(polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return 0
  const pts = polygon.map((p) => [Number(p[0]), Number(p[1])])
  const avgLat = pts.reduce((s, p) => s + p[1], 0) / pts.length
  const mPerLng = 111320 * Math.cos((avgLat * Math.PI) / 180)
  const mPerLat = 110540
  const projected = pts.map(([lng, lat]) => [lng * mPerLng, lat * mPerLat])

  let area = 0
  for (let i = 0, j = projected.length - 1; i < projected.length; j = i++) {
    area += projected[j][0] * projected[i][1] - projected[i][0] * projected[j][1]
  }
  return Math.abs(area / 2)
}

/**
 * 格式化面积：>=10000 ㎡ 时同时显示公顷/亩
 */
export function formatArea(squareMeters) {
  if (!squareMeters || squareMeters <= 0) return '0 ㎡'
  if (squareMeters < 10000) return `${squareMeters.toFixed(0)} ㎡`
  const mu = squareMeters / 666.67
  return `${(squareMeters / 10000).toFixed(2)} 万㎡（约 ${mu.toFixed(1)} 亩）`
}

/**
 * 多边形外接矩形中心
 */
export function polygonCenter(polygon) {
  if (!polygon || !polygon.length) return null
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  polygon.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, Number(lng))
    maxLng = Math.max(maxLng, Number(lng))
    minLat = Math.min(minLat, Number(lat))
    maxLat = Math.max(maxLat, Number(lat))
  })
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
}

/**
 * 归一化高德路径返回值（LngLat 对象 / 数组）为 [[lng, lat], ...]
 */
export function normalizeAMapPath(path) {
  if (!Array.isArray(path)) return []
  return path.map((p) => {
    if (Array.isArray(p)) return [Number(p[0]), Number(p[1])]
    if (typeof p.getLng === 'function') return [p.getLng(), p.getLat()]
    return [Number(p.lng), Number(p.lat)]
  })
}

export function formatCoord(value) {
  return Number(value).toFixed(6)
}

/**
 * 两点间距离（米），Haversine
 */
export function distanceBetween(a, b) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
