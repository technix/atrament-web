import { defineConfig } from 'vite'; /* eslint-disable-line */
import bundlesize from 'vite-plugin-bundlesize';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    bundlesize({
      limits: [
        { name: 'atrament.js', limit: '30 kB', mode: 'gzip' },
        { name: 'index.cjs', limit: '30 kB', mode: 'gzip' },
        { name: 'index.mjs', limit: '30 kB', mode: 'gzip' }
      ]
    })
  ],
  build: {
    sourcemap: 'hidden',
    lib: {
      entry: resolve(__dirname, 'src/index.js')
    },
    rollupOptions: {
      output: [{
        entryFileNames: '[name].cjs',
        format: 'cjs',
        dir: 'dist'
      }, {
        entryFileNames: '[name].mjs',
        format: 'es',
        dir: 'dist'
      }, {
        entryFileNames: 'atrament.js',
        name: 'atrament',
        format: 'umd',
        dir: 'dist'
      }]
    }
  }
});
