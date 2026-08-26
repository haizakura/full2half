<script setup lang="ts">
import type { ImageQueueItem, SplitSettings } from '~/types/image'
import { baseName } from '~/utils/image'

const FILE_INPUT_ID = 'scan-file-input'

const toast = useToast()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const {
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
} = useImageQueue()

const { decoded, isLoading } = useImagePreview(activeItem, {
  onError: (item, message) => {
    toast.add({ title: `无法读取 ${item.name}`, description: message, color: 'error' })
  }
})

const {
  format,
  quality,
  exporting,
  progress: exportProgress,
  progressLabel: exportLabel,
  exportItems
} = useImageExport()

const pickFiles = () => fileInput.value?.click()

const acceptFiles = (files: File[]) => {
  const { rejectedCount } = addFiles(files)
  if (rejectedCount) {
    toast.add({
      title: `已忽略 ${rejectedCount} 个不支持的文件`,
      description: '支持 TIFF、JPEG、PNG 与 WebP。',
      color: 'warning'
    })
  }
}

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) acceptFiles([...input.files])
  input.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) acceptFiles([...event.dataTransfer.files])
}

const updateCenter = (center: number) => {
  if (activeItem.value) updateActiveSettings({ ...activeItem.value.settings, center })
}

const applyCurrentSettingsToAll = () => {
  if (!activeItem.value) return
  applySettingsToAll(activeItem.value.settings)
  toast.add({ title: '已应用到全部图像', color: 'success' })
}

const runExport = async (items: ImageQueueItem[], archiveName: string) => {
  try {
    const result = await exportItems(items, archiveName)
    if (!result) return

    toast.add({
      title: result.failedCount ? `导出完成，${result.failedCount} 个文件失败` : '切分完成',
      description: `已生成 ${result.generatedCount} 张图像。`,
      color: result.failedCount ? 'warning' : 'success'
    })
  } catch (error) {
    toast.add({
      title: '导出失败',
      description: error instanceof Error ? error.message : '无法生成压缩包',
      color: 'error'
    })
  }
}

const exportAll = () => runExport(queue.value, `full2half-${new Date().toISOString().slice(0, 10)}`)

const exportCurrent = () => {
  if (activeItem.value) runExport([activeItem.value], baseName(activeItem.value.name))
}

const updateSettings = (settings: SplitSettings) => updateActiveSettings(settings)
</script>

<template>
  <div
    class="film-grain flex min-h-screen flex-col"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.self="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <FilmAppHeader />

    <input
      ref="fileInput"
      :id="FILE_INPUT_ID"
      class="pointer-events-none fixed top-0 left-0 size-px opacity-0"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp,image/tiff,.tif,.tiff"
      @change="handleInput"
    />

    <FilmUploadEmptyState
      v-if="!queue.length"
      class="w-full flex-1"
      :file-input-id="FILE_INPUT_ID"
      :is-dragging="isDragging"
      @pick="pickFiles"
    />

    <main
      v-else
      class="mx-auto grid w-full max-w-[1680px] flex-1 lg:h-[calc(100vh-108px)] lg:grid-cols-[260px_minmax(0,1fr)_300px]"
    >
      <FilmImageQueue
        :items="queue"
        :active-id="activeId"
        :total-size="totalSize"
        @select="activeId = $event"
        @add="pickFiles"
        @remove="removeItem"
        @clear="clearQueue"
      />

      <FilmImagePreview
        :name="activeItem?.name"
        :error="activeItem?.error"
        :settings="activeItem?.settings"
        :decoded="decoded"
        :loading="isLoading"
        @update:center="updateCenter"
      />

      <FilmImageControls
        v-if="activeItem"
        :settings="activeItem.settings"
        :format="format"
        :quality="quality"
        :completed-count="completedCount"
        :total-count="queue.length"
        :exporting="exporting"
        :export-progress="exportProgress"
        :export-label="exportLabel"
        @update:settings="updateSettings"
        @update:format="format = $event"
        @update:quality="quality = $event"
        @apply-all="applyCurrentSettingsToAll"
        @reset="resetActiveSettings"
        @export-all="exportAll"
        @export-current="exportCurrent"
      />
    </main>

    <FilmAppFooter />

    <FilmDropOverlay v-if="isDragging" />
  </div>
</template>
