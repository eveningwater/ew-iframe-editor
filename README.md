# ew-iframe-editor

通用代码编辑器嵌入 SDK，通过**适配器模式**将在线代码编辑器（默认 ew-code-editor）嵌入网页并加载初始代码。支持通过 `requestUrl` 加载代码文件，或直接传入 `html/css/js` 代码内容。

**在线演示**：https://eveningwater.github.io/ew-iframe-editor/

## 安装

```bash
npm install ew-iframe-editor
# 或
pnpm add ew-iframe-editor
# 或
yarn add ew-iframe-editor
```

## 快速开始

默认使用 ew-code-editor，最简用法：

```ts
import { createEditor } from 'ew-iframe-editor';

const { iframe, destroy } = createEditor({
  requestUrl: './demo.html',
});
```

## 用法

### 通过 requestUrl 加载代码

```ts
import { createEditor, ewCodeEditorAdapter } from 'ew-iframe-editor';

createEditor({
  adapter: ewCodeEditorAdapter('https://ew-code-editor.eveningwater.com'),
  requestUrl: './demo.html',
});
```

### 直接传入代码内容

```ts
import { createEditor, ewCodeEditorAdapter } from 'ew-iframe-editor';

createEditor({
  adapter: ewCodeEditorAdapter(),
  code: {
    html: '<h1>Hello</h1>',
    css: 'h1 { color: red; }',
    js: 'console.log("hi");',
  },
});
```

### 指定挂载容器

```ts
createEditor({
  container: '#editor-container', // 或传入 HTMLElement
  requestUrl: './demo.html',
});
```

不传 `container` 时默认挂载到 `document.body`。

## CDN 使用

```html
<script src="https://unpkg.com/ew-iframe-editor/dist/index.global.js"></script>
<script>
  const { createEditor } = EwIframeEditor;
  createEditor({
    requestUrl: './demo.html',
  });
</script>
```

## API

### createEditor(options)

| 参数 | 类型 | 说明 |
|---|---|---|
| `options.adapter` | `EditorAdapter` | 编辑器适配器，**默认 ew-code-editor** |
| `options.requestUrl` | `string` | 初始代码内容的请求地址（与 `code` 二选一） |
| `options.code` | `{ html, css, js }` | 直接传入代码内容（与 `requestUrl` 二选一，优先） |
| `options.iframeStyle` | `string` | iframe 自定义 CSS |
| `options.container` | `HTMLElement \| string` | 挂载容器，传入元素或选择器，默认 `document.body` |
| `options.parser` | `(content) => { html, css, js }` | 自定义内容解析器 |
| `options.retryDelays` | `number[]` | postMessage 重试延迟，默认 `[0, 300, 800, 1500, 3000]` |
| `options.onLoad` | `(iframe) => void` | iframe 加载完成回调 |
| `options.onError` | `(error) => void` | 加载失败回调 |

**返回值**：`{ iframe: HTMLIFrameElement, destroy: () => void }`

### 内置适配器

| 适配器 | 类型 | 说明 |
|---|---|---|
| `ewCodeEditorAdapter(codeUrl?)` | postMessage | ew-code-editor，默认地址 `https://ew-code-editor.eveningwater.com` |

### 自定义适配器

实现 `EditorAdapter` 接口即可支持任意编辑器：

```ts
import type { EditorAdapter, ParsedCode } from 'ew-iframe-editor';

class MyEditorAdapter implements EditorAdapter {
  name = 'my-editor';
  usesPostMessage = true; // 或 false（URL 参数型）

  getUrl(code: ParsedCode): string {
    return 'https://my-editor.com';
  }

  sendCode(iframe: HTMLIFrameElement, code: ParsedCode): void {
    iframe.contentWindow?.postMessage(code, '*');
  }
}

createEditor({
  adapter: new MyEditorAdapter(),
  requestUrl: './demo.html',
});
```

## 默认解析规则

如果不传入 `parser`，会从 `requestUrl` 返回的文本中提取以下标签内容：

```html
<style>/* css 内容 */</style>
<html><!-- html 内容 --></html>
<script>// js 内容</script>
```

## License

ISC
