<template>
  <header class="border-b border-film-900/10 bg-film-100/85 backdrop-blur-xl">
    <div class="mx-auto flex h-17 max-w-[1680px] items-center justify-between px-5 lg:px-8">
      <div class="flex items-center gap-3">
        <div class="brand-mark" aria-hidden="true">
          <span />
          <span />
        </div>
        <div>
          <p class="font-mono text-[10px] leading-none tracking-[0.24em] text-film-500 uppercase">
            Half-frame lab
          </p>
          <h1 class="mt-1 text-[17px] leading-none font-semibold tracking-tight">Full2Half</h1>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs text-film-600">
        <UIcon name="i-lucide-shield-check" class="size-4" />
        <span class="hidden sm:inline">图像仅在本地处理，不会上传</span>
        <span class="sm:hidden">本地处理</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.brand-mark {
  display: grid;
  grid-template-columns: repeat(2, 8px);
  gap: 2px;
  width: 22px;
  height: 30px;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--color-film-900) 55%, transparent);
  border-radius: 2px;
}

.brand-mark span {
  background: var(--color-film-900);
}
</style>
