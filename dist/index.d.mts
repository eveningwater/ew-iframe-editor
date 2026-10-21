/** 解析后的代码内容 */
interface ParsedCode {
    /** HTML 内容 */
    html: string;
    /** CSS 内容 */
    css: string;
    /** JavaScript 内容 */
    js: string;
}
/** 发送给 iframe 的消息 */
interface EditorMessage {
    type: 'html' | 'css' | 'js';
    content: string;
}
/**
 * 编辑器适配器接口
 * 不同的代码编辑器（ew-code-editor、OneCompiler、JDoodle 等）实现此接口，
 * 核心 createEditor 函数通过适配器与具体编辑器解耦。
 */
interface EditorAdapter {
    /** 适配器名称 */
    name: string;
    /**
     * 根据代码内容生成 iframe 的 src URL
     * 对于 URL 参数型编辑器，代码会编码进 URL；
     * 对于 postMessage 型编辑器，返回编辑器地址即可。
     */
    getUrl(code: ParsedCode): string;
    /**
     * 向编辑器发送代码
     * 对于 postMessage 型编辑器，通过 postMessage 发送；
     * 对于 URL 参数型编辑器，此方法为空操作。
     */
    sendCode(iframe: HTMLIFrameElement, code: ParsedCode): void;
    /**
     * 是否通过 postMessage 传递代码
     * 为 true 时会等待编辑器 ready 后再发送；
     * 为 false 时代码已在 URL 中，无需发送。
     */
    usesPostMessage?: boolean;
    /**
     * 等待编辑器就绪的钩子（可选）
     * 实现握手协议：编辑器初始化完成后会发送 ready 消息，
     * SDK 收到后再发送代码，避免固定延迟盲发。
     *
     * 如果适配器不实现此方法，SDK 会使用降级重试（retryDelays）。
     *
     * @param iframe - 编辑器 iframe 元素
     * @param onReady - 收到 ready 消息后的回调（在此回调中发送代码）
     * @param fallback - 超时兜底回调（用重试发送）
     */
    waitForReady?(iframe: HTMLIFrameElement, onReady: () => void, fallback: () => void): void;
}
/** createEditor 配置项 */
interface CreateEditorOptions {
    /**
     * 编辑器适配器
     * 不传则默认使用 ew-code-editor
     */
    adapter?: EditorAdapter;
    /**
     * 代码内容请求地址，返回的文本会被 parser 解析为 html/css/js
     * 与 code 二选一，优先使用 code
     */
    requestUrl?: string;
    /** 直接传入代码内容，与 requestUrl 二选一 */
    code?: ParsedCode;
    /** iframe 自定义样式 */
    iframeStyle?: string;
    /**
     * 挂载容器
     * 传入 DOM 元素或选择器字符串，iframe 和 style 会挂载到该容器内；
     * 不传则默认挂载到 document.body
     */
    container?: HTMLElement | string;
    /**
     * 自定义内容解析器
     * 入参为 requestUrl 返回的文本内容，返回解析后的 html/css/js
     * 不传则使用默认解析器（从 <html>/<style>/<script> 标签中提取）
     */
    parser?: (content: string) => ParsedCode;
    /**
     * 重试发送消息的延迟数组（毫秒），仅对 usesPostMessage=true 的适配器生效
     * 编辑器的消息监听器在 ES module 中异步注册，iframe onload 时可能还没准备好，
     * 所以需要按延迟数组多次发送，确保监听器就绪后能收到。
     * 默认 [0, 300, 800, 1500, 3000]
     */
    retryDelays?: number[];
    /** iframe 加载完成回调 */
    onLoad?: (iframe: HTMLIFrameElement) => void;
    /** 加载失败回调 */
    onError?: (error: Error) => void;
}
/** createEditor 返回值 */
interface EditorInstance {
    /** iframe DOM 元素 */
    iframe: HTMLIFrameElement;
    /** 销毁实例，移除 iframe 和样式 */
    destroy: () => void;
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
declare function createEditor(options: CreateEditorOptions): EditorInstance;

/**
 * 默认内容解析器
 * 从文本中提取 <html>、<style>、<script> 标签内的内容
 */
declare function defaultParser(content: string): ParsedCode;

/**
 * ew-code-editor 适配器
 * 通过 postMessage 向编辑器发送 html/css/js 代码
 *
 * 使用握手协议：编辑器初始化完成后会向 parent 发送
 *   window.parent.postMessage({ type: 'ready' }, '*')
 * SDK 收到 ready 后再发送代码，避免固定延迟盲发。
 * 如果超时未收到 ready，降级为 fallback（重试发送）。
 */
declare class EwCodeEditorAdapter implements EditorAdapter {
    name: string;
    usesPostMessage: boolean;
    private codeUrl;
    constructor(codeUrl?: string);
    getUrl(): string;
    sendCode(iframe: HTMLIFrameElement, code: ParsedCode): void;
    /**
     * 握手模式：监听编辑器发送的 ready 消息
     * 超时后降级为 fallback（重试发送）
     *
     * @param iframe 编辑器 iframe
     * @param onReady 收到 ready 后的回调，SDK 在此回调中发送代码
     * @param fallback 超时兜底（重试发送），作为 onReady 的替代路径
     */
    waitForReady(iframe: HTMLIFrameElement, onReady: () => void, fallback: () => void): void;
}
/** ew-code-editor 适配器工厂函数 */
declare function ewCodeEditorAdapter(codeUrl?: string): EwCodeEditorAdapter;

export { type CreateEditorOptions, type EditorAdapter, type EditorInstance, type EditorMessage, EwCodeEditorAdapter, type ParsedCode, createEditor, defaultParser, ewCodeEditorAdapter };
