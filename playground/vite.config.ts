import VueJSX from '@vitejs/plugin-vue-jsx'
import jsxMacros from '@vue-jsx-vapor/macros/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import JsxAwaitExpression from '../src/vite'

export default defineConfig({
  plugins: [
    JsxAwaitExpression(),
    jsxMacros({
      defineComponent: {
        autoReturnFunction: true,
      },
    }),
    VueJSX(),
    Inspect({
      build: true,
    }),
  ],
})
