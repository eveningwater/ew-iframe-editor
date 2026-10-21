// 核心函数
export { createEditor } from './createEditor';

// 内容解析器
export { defaultParser } from './parser';

// 内置编辑器适配器
export {
  EwCodeEditorAdapter,
  ewCodeEditorAdapter,
} from './adapters';

// 类型
export type {
  EditorAdapter,
  CreateEditorOptions,
  EditorInstance,
  ParsedCode,
  EditorMessage,
} from './types';
