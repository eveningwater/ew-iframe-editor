import type { EditorAdapter, ParsedCode } from '../types';
import { toMessages } from '../parser';

const DEFAULT_CODE_URL = 'https://ew-code-editor.eveningwater.com';

/** 握手超时时间（毫秒），超时后降级为重试 */
const HANDSHAKE_TIMEOUT = 5000;

/**
 * ew-code-editor 适配器
 * 通过 postMessage 向编辑器发送 html/css/js 代码
 *
 * 使用握手协议：编辑器初始化完成后会向 parent 发送
 *   window.parent.postMessage({ type: 'ready' }, '*')
 * SDK 收到 ready 后再发送代码，避免固定延迟盲发。
 * 如果超时未收到 ready，降级为 fallback（重试发送）。
 */
export class EwCodeEditorAdapter implements EditorAdapter {
  name = 'ew-code-editor';
  usesPostMessage = true;

  private codeUrl: string;

  constructor(codeUrl: string = DEFAULT_CODE_URL) {
    this.codeUrl = codeUrl;
  }

  getUrl(): string {
    return this.codeUrl;
  }

  sendCode(iframe: HTMLIFrameElement, code: ParsedCode): void {
    const messages = toMessages(code);
    iframe.contentWindow?.postMessage(messages, '*');
  }

  /**
   * 握手模式：监听编辑器发送的 ready 消息
   * 超时后降级为 fallback（重试发送）
   *
   * @param iframe 编辑器 iframe
   * @param onReady 收到 ready 后的回调，SDK 在此回调中发送代码
   * @param fallback 超时兜底（重试发送），作为 onReady 的替代路径
   */
  waitForReady(
    iframe: HTMLIFrameElement,
    onReady: () => void,
    fallback: () => void,
  ): void {
    let settled = false;

    const handler = (e: MessageEvent) => {
      if (
        !settled &&
        e.data &&
        typeof e.data === 'object' &&
        e.data.type === 'ready' &&
        e.source === iframe.contentWindow
      ) {
        settled = true;
        window.removeEventListener('message', handler);
        onReady();
      }
    };

    window.addEventListener('message', handler);

    // 超时兜底
    setTimeout(() => {
      if (!settled) {
        settled = true;
        window.removeEventListener('message', handler);
        fallback();
      }
    }, HANDSHAKE_TIMEOUT);
  }
}

/** ew-code-editor 适配器工厂函数 */
export function ewCodeEditorAdapter(codeUrl?: string): EwCodeEditorAdapter {
  return new EwCodeEditorAdapter(codeUrl);
}
