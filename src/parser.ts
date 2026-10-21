import type { ParsedCode } from './types';

/**
 * 默认内容解析器
 * 从文本中提取 <html>、<style>、<script> 标签内的内容
 */
export function defaultParser(content: string): ParsedCode {
  let html = '';
  let css = '';
  let js = '';

  const cssMatch = content.match(/<style>[\s\S]*?<\/style>/i);
  if (cssMatch) {
    css = cssMatch[0].replace(/<\/?style>/gi, '');
  }

  const htmlMatch = content.match(/<html>[\s\S]*?<\/html>/i);
  if (htmlMatch) {
    html = htmlMatch[0].replace(/<\/?html>/gi, '');
  }

  const jsMatch = content.match(/<script>[\s\S]*?<\/script>/i);
  if (jsMatch) {
    js = jsMatch[0].replace(/<\/?script>/gi, '');
  }

  return { html, css, js };
}

/**
 * 将解析后的代码转换为发送给 iframe 的消息数组
 */
export function toMessages(code: ParsedCode) {
  return [
    { type: 'html', content: code.html },
    { type: 'css', content: code.css },
    { type: 'js', content: code.js },
  ] as const;
}
