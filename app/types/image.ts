export type Rotation = 0 | 90 | 180 | 270

export type ExportFormat = 'jpeg' | 'png' | 'webp'

export type QueueStatus = 'ready' | 'processing' | 'done' | 'error'

export interface SplitSettings {
  center: number
  gap: number
  leftRotation: Rotation
  rightRotation: Rotation
}

export interface ImageQueueItem {
  id: string
  file: File
  name: string
  size: number
  status: QueueStatus
  error?: string
  settings: SplitSettings
}

export interface DecodedImage {
  source: CanvasImageSource
  width: number
  height: number
  dispose: () => void
}

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}
