import type { CreateEditorOptions, EditorInstance, ParsedCode } from './types';
import { defaultParser } from './parser';
import { ewCodeEditorAdapter } from './adapters';

const DEFAULT_IFRAME_STYLE = `
  body,html {
    height: 100%;
    overflow: hidden;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .ew-iframe {
    width: 100%;
    height: 100%;
    border: none;
    overflow: hidden;
  }
`;

  /** 默认重试延迟（毫秒），用于 waitForReady 的超时降级兜底 */
const DEFAULT_RETRY_DELAYS = [0, 300, 800, 1500, 3000];

const IFRAME_ID = 'ew-code-editor-iframe';
const STYLE_ID = 'ew-code-editor-style';

/**
 * 获取代码内容：优先使用直接传入的 code，否则从 requestUrl 加载
 */
async function resolveCode(
  code: ParsedCode | undefined,
  requestUrl: string | undefined,
  parser: (content: string) => ParsedCode,
): Promise<ParsedCode> {
  if (code) return code;
  if (requestUrl) {
    const response = await fetch(requestUrl);
    const scriptContent = await response.text();
    return parser(scriptContent);
  }
  return { html: '', css: '', js: '' };
}

/**
 * 创建一个嵌入代码编辑器的 iframe
 * 通过适配器模式支持多种编辑器（ew-code-editor、CodePen、JSFiddle、CodeSandbox 等）
 *
 * @param options - 配置项，adapter 不传则默认使用 ew-code-editor
 * @returns 包含 iframe 元素和销毁方法的实例
 *
 * @example
 * ```ts
 * import { createEditor } from 'ew-iframe-editor';
 *
 * // 默认使用 ew-code-editor
 * const { iframe, destroy } = createEditor({
 *   requestUrl: './demo.html',
 * });
 * ```
 */
export function createEditor(options: CreateEditorOptions): EditorInstance {
  const {
    adapter = ewCodeEditorAdapter(),
    requestUrl,
    code,
    iframeStyle = DEFAULT_IFRAME_STYLE,
    container,
    parser = defaultParser,
    retryDelays = DEFAULT_RETRY_DELAYS,
    onLoad,
    onError,
  } = options;

  // 解析挂载容器：支持 DOM 元素或选择器字符串，默认 body
  const mountEl =
    container instanceof HTMLElement
      ? container
      : typeof container === 'string'
        ? document.querySelector<HTMLElement>(container) ?? document.body
        : document.body;

  // 如果已存在，先清理旧的 iframe 和 style，避免重复添加
  const oldIframe = document.getElementById(IFRAME_ID);
  if (oldIframe) oldIframe.remove();
  const oldStyle = document.getElementById(STYLE_ID);
  if (oldStyle) oldStyle.remove();

  const iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  iframe.scrolling = 'no';
  iframe.title = 'code';
  iframe.setAttribute('frameborder', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.classList.add('ew-iframe');

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = iframeStyle;

  const handleError = (error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      console.error('[ew-iframe-editor] Failed to load initial code:', err);
    }
  };

  /** ready 到达前可能代码已就绪，或反之；都到齐才发送 */
  let readyArrived = false;
  let handshakeTimedOut = false;
  let pendingCode: ParsedCode | null = null;

  const trySendOnce = () => {
    if (readyArrived && pendingCode && !handshakeTimedOut) {
      adapter.sendCode(iframe, pendingCode);
    }
  };

  const trySendWithFallback = () => {
    if (readyArrived && pendingCode) {
      if (handshakeTimedOut) {
        // 握手超时降级：重试发送
        sendWithRetry(pendingCode);
      } else {
        adapter.sendCode(iframe, pendingCode);
      }
    }
  };

  const sendWithRetry = (code: ParsedCode) => {
    retryDelays.forEach((delay) => {
      setTimeout(() => adapter.sendCode(iframe, code), delay);
    });
  };

  // 如果适配器实现了 waitForReady，提前开始监听 ready 消息
  // 避免 iframe 从缓存加载极快、ready 先发了但 SDK 还没监听
  if (adapter.usesPostMessage && adapter.waitForReady) {
    adapter.waitForReady(
      iframe,
      () => {
        readyArrived = true;
        trySendOnce();
      },
      () => {
        // 握手超时降级：标记 ready 已到达，代码到后用重试发送
        handshakeTimedOut = true;
        readyArrived = true;
        trySendWithFallback();
      },
    );
  }

  // 先绑定 onload，确保不会错过 load 事件
  iframe.onload = function () {
    if (adapter.usesPostMessage) {
      // postMessage 型编辑器：iframe 加载后，获取代码
      resolveCode(code, requestUrl, parser)
        .then((parsedCode) => {
          pendingCode = parsedCode;

          if (adapter.waitForReady) {
            // 握手模式：等 ready 到齐
            trySendWithFallback();
          } else {
            // 第三方编辑器未实现 waitForReady，直接重试发送
            sendWithRetry(parsedCode);
          }
        })
        .catch(handleError);
    }
    onLoad?.(iframe);
  };

  if (adapter.usesPostMessage) {
    // postMessage 型编辑器：URL 不依赖代码，直接设置
    iframe.src = adapter.getUrl({ html: '', css: '', js: '' });
  } else {
    // URL 参数型编辑器：需要先获取代码再构建 URL
    resolveCode(code, requestUrl, parser)
      .then((parsedCode) => {
        iframe.src = adapter.getUrl(parsedCode);
      })
      .catch(handleError);
  }

  document.head.appendChild(style);
  mountEl.appendChild(iframe);

  const destroy = () => {
    iframe.onload = null;
    style.remove();
    iframe.remove();
  };

  return { iframe, destroy };
}
