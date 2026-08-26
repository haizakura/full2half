<script setup lang="ts">
import type { SplitSettings } from '~/types/image'

const props = defineProps<{ settings: SplitSettings }>()
const emit = defineEmits<{ 'update:settings': [settings: SplitSettings] }>()

const updateNumber = (key: 'center' | 'gap', event: Event) => {
  emit('update:settings', {
    ...props.settings,
    [key]: Number((event.target as HTMLInputElement).value)
  })
}
</script>

<template>
  <div class="border-b border-film-900/10 px-5 py-5">
    <p class="eyebrow">切分</p>
    <div class="mt-5 space-y-6">
      <label class="block">
        <span class="mb-3 flex items-center justify-between text-xs">
          <span class="font-medium">分割位置</span>
          <output class="font-mono text-[10px] text-film-500"
            >{{ (settings.center * 100).toFixed(1) }}%</output
          >
        </span>
        <input
          :value="settings.center"
          class="range"
          type="range"
          min="0.4"
          max="0.6"
          step="0.001"
          @input="updateNumber('center', $event)"
        />
      </label>

      <label class="block">
        <span class="mb-3 flex items-center justify-between text-xs">
          <span class="font-medium">移除中缝</span>
          <output class="font-mono text-[10px] text-film-500"
            >{{ (settings.gap * 100).toFixed(1) }}%</output
          >
        </span>
        <input
          :value="settings.gap"
          class="range"
          type="range"
          min="0"
          max="0.08"
          step="0.001"
          @input="updateNumber('gap', $event)"
        />
      </label>
    </div>
  </div>
</template>
