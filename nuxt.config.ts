export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  compatibilityDate: '2026-08-26',
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'Full2Half · 半格胶片切分工具',
      meta: [
        {
          name: 'description',
          content: '在浏览器本地批量切分半格胶片扫描图像。'
        },
        { name: 'theme-color', content: '#f4f0e8' }
      ]
    }
  }
})
