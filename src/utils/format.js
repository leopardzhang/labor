function pad(n) {
  return String(n).padStart(2, '0')
}

/** Date|string|timestamp -> 'YYYY-MM-DD HH:mm:ss' */
export function formatDateTime(input) {
  if (!input) return ''
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return String(input)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 当前时间 'YYYY-MM-DD HH:mm:ss' */
export function nowDateTime() {
  return formatDateTime(new Date())
}

/** 解析 18 位身份证：返回出生日期与性别（第 17 位奇男偶女） */
export function parseIdCard(idCard) {
  if (!idCard || !/^\d{17}[\dXx]$/.test(idCard)) return null
  const birth = `${idCard.slice(6, 10)}-${idCard.slice(10, 12)}-${idCard.slice(12, 14)}`
  const gender = Number(idCard.charAt(16)) % 2 === 1 ? '男' : '女'
  return { birth, gender }
}
