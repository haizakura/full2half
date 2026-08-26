# Full2Half

一个在浏览器本地运行的半格胶片扫描切分工具。将包含左右两幅半格照片的扫描图像切成独立文件，支持 TIFF、JPEG、PNG 和 WebP 输入。导入后会逐张自动识别分割位置和中缝宽度，也可手动微调分割线、中缝宽度与旋转方向，并批量打包下载。

## 本地开发

项目使用 [mise](https://mise.jdx.dev/) 管理 Node.js 版本，当前配置为 Node.js 24。

```bash
mise install
mise exec -- corepack pnpm install
mise exec -- corepack pnpm dev
```

开发服务器默认运行在 `http://localhost:3000`。

## 检查与构建

```bash
mise exec -- corepack pnpm check
mise exec -- corepack pnpm build
```

## 代码结构

- `app/pages`：只负责页面组合和跨模块事件协调。
- `app/components/film`：无业务状态所有权的展示与表单组件，通过 props / emits 复用。
- `app/composables`：文件队列、图像预览和批量导出工作流。
- `app/utils`：图像解码、裁切、旋转及格式转换等纯工具函数。

- `oxlint` 负责代码检查。
- `oxfmt` 负责格式化。
- 图像处理完全在浏览器内完成，不会上传到服务器。
- 自动切分会分析中央区域的纵向亮度、纹理和边界变化；无法可靠识别中缝时不会主动移除像素。
- TIFF 会在浏览器中解码；输出支持 JPEG、PNG 与 WebP。PNG 是无损选项，但批量输出时会占用更多内存。
