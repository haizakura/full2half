import UTIF from 'utif'

import type { CropRect, DecodedImage, ExportFormat, Rotation, SplitSettings } from '~/types/image'

export const DEFAULT_SETTINGS: SplitSettings = {
  center: 0.5,
  gap: 0.018,
  leftRotation: 0,
  rightRotation: 0
}

export const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff']

export const isSupportedImage = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension ? SUPPORTED_EXTENSIONS.includes(extension) : false
}

export const isTiff = (file: File) => /\.(tif|tiff)$/i.test(file.name)

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`
}

const decodeImageRaw = async (file: File): Promise<DecodedImage> => {
  if (isTiff(file)) {
    const buffer = await file.arrayBuffer()
    const ifds = UTIF.decode(buffer)
    const ifd = ifds[0]

    if (!ifd) throw new Error('TIFF 文件中没有可读取的图像')

    UTIF.decodeImage(buffer, ifd)
    const rgba = UTIF.toRGBA8(ifd)
    const pixels = new Uint8ClampedArray(rgba.byteLength)
    pixels.set(rgba)
    const canvas = document.createElement('canvas')
    canvas.width = ifd.width
    canvas.height = ifd.height
    const context = canvas.getContext('2d')

    if (!context) throw new Error('浏览器无法创建图像画布')

    context.putImageData(new ImageData(pixels, ifd.width, ifd.height), 0, 0)

    return {
      source: canvas,
      width: ifd.width,
      height: ifd.height,
      dispose: () => {
        canvas.width = 0
        canvas.height = 0
      }
    }
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    dispose: () => bitmap.close()
  }
}

// Some browsers can leave concurrent createImageBitmap calls unresolved. Keeping
// decoding serial also caps peak memory when a batch contains large TIFF scans.
let decodeQueue = Promise.resolve()

export const decodeImage = (file: File): Promise<DecodedImage> => {
  const decoded = decodeQueue.then(() => decodeImageRaw(file))
  decodeQueue = decoded.then(
    () => undefined,
    () => undefined
  )
  return decoded
}

export const calculateCropRects = (
  width: number,
  height: number,
  settings: SplitSettings
): [CropRect, CropRect] => {
  const splitX = Math.round(width * settings.center)
  const halfGap = Math.round((width * settings.gap) / 2)
  const leftEnd = Math.max(1, Math.min(width - 1, splitX - halfGap))
  const rightStart = Math.max(1, Math.min(width - 1, splitX + halfGap))

  return [
    { x: 0, y: 0, width: leftEnd, height },
    { x: rightStart, y: 0, width: Math.max(1, width - rightStart), height }
  ]
}

const canvasToBlob = (canvas: HTMLCanvasElement, format: ExportFormat, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图像编码失败'))),
      `image/${format}`,
      format === 'png' ? undefined : quality
    )
  })

export const renderCrop = async (
  decoded: DecodedImage,
  rect: CropRect,
  rotation: Rotation,
  format: ExportFormat,
  quality: number
) => {
  const swapped = rotation === 90 || rotation === 270
  const canvas = document.createElement('canvas')
  canvas.width = swapped ? rect.height : rect.width
  canvas.height = swapped ? rect.width : rect.height
  const context = canvas.getContext('2d')

  if (!context) throw new Error('浏览器无法创建导出画布')

  context.save()
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate((rotation * Math.PI) / 180)
  context.drawImage(
    decoded.source,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    -rect.width / 2,
    -rect.height / 2,
    rect.width,
    rect.height
  )
  context.restore()

  const blob = await canvasToBlob(canvas, format, quality)
  canvas.width = 0
  canvas.height = 0
  return blob
}

export const baseName = (name: string) => name.replace(/\.[^.]+$/, '')

export const outputExtension = (format: ExportFormat) => (format === 'jpeg' ? 'jpg' : format)

export const rotateClockwise = (rotation: Rotation): Rotation => ((rotation + 90) % 360) as Rotation

export const rotateCounterClockwise = (rotation: Rotation): Rotation =>
  ((rotation + 270) % 360) as Rotation
