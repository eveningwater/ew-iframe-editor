import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'EwIframeEditor',
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  outExtension({ format }) {
    return {
      js: format === 'iife' ? '.global.js' : format === 'esm' ? '.esm.js' : '.cjs.js',
    };
  },
});
