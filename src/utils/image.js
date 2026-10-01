/**
 * 将图片文件压缩为 JPEG DataURL，控制 localStorage 占用。
 * 最长边超过 maxSize 时等比缩小。
 */
export function fileToCompressedDataURL(file, maxSize = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('图片解析失败'))
      img.onload = () => {
        let { width, height } = img
        if (width >= height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > width && height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        // 白底，避免透明 PNG 转 JPEG 后发黑
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        try {
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch (e) {
          reject(new Error('图片压缩失败'))
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
