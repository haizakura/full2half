import type { ImageQueueItem, SplitSettings } from '~/types/image'
import { DEFAULT_SETTINGS, isSupportedImage } from '~/utils/image'

export interface AddFilesResult {
  addedCount: number
  rejectedCount: number
}

const createSettings = (): SplitSettings => ({ ...DEFAULT_SETTINGS })

export const useImageQueue = () => {
  const queue = ref<ImageQueueItem[]>([])
  const activeId = ref<string>()

  const activeItem = computed(() => queue.value.find((item) => item.id === activeId.value))
  const totalSize = computed(() => queue.value.reduce((sum, item) => sum + item.size, 0))
  const completedCount = computed(() => queue.value.filter((item) => item.status === 'done').length)

  const addFiles = (files: File[]): AddFilesResult => {
    const supported = files.filter(isSupportedImage)
    const rejectedCount = files.length - supported.length
    const knownFiles = new Set(queue.value.map((item) => `${item.name}:${item.size}`))
    const unique = supported.filter((file) => !knownFiles.has(`${file.name}:${file.size}`))

    queue.value.push(
      ...unique.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        status: 'ready' as const,
        settings: createSettings()
      }))
    )

    if (!activeId.value && queue.value[0]) activeId.value = queue.value[0].id

    return { addedCount: unique.length, rejectedCount }
  }

  const removeItem = (id: string) => {
    const index = queue.value.findIndex((item) => item.id === id)
    if (index === -1) return
    queue.value.splice(index, 1)

    if (activeId.value === id) {
      activeId.value = queue.value[Math.min(index, queue.value.length - 1)]?.id
    }
  }

  const clearQueue = () => {
    queue.value = []
    activeId.value = undefined
  }

  const updateActiveSettings = (settings: SplitSettings) => {
    if (activeItem.value) activeItem.value.settings = settings
  }

  const applySettingsToAll = (settings: SplitSettings) => {
    for (const item of queue.value) item.settings = { ...settings }
  }

  const resetActiveSettings = () => updateActiveSettings(createSettings())

  return {
    queue,
    activeId,
    activeItem,
    totalSize,
    completedCount,
    addFiles,
    removeItem,
    clearQueue,
    updateActiveSettings,
    applySettingsToAll,
    resetActiveSettings
  }
}
