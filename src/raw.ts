import {
  createFilter,
  generateTransform,
  HELPER_PREFIX,
  importHelperFn,
  MagicStringAST,
  walkAST,
} from '@vue-macros/common'
import { resolveOption, type Options } from './core/options'
import type { Node } from 'oxc-parser'
import type { UnpluginOptions } from 'unplugin'

let parseSync: typeof import('oxc-parser').parseSync

export async function transformJsxAwaitExpression(code: string, id: string) {
  if (!parseSync) {
    const oxcParser = await import(
      // @ts-ignore
      typeof window !== 'undefined'
        ? 'https://cdn.jsdelivr.net/npm/@oxc-parser/binding-wasm32-wasi/browser-bundle.mjs'
        : 'oxc-parser'
    )
    parseSync = oxcParser.parseSync
  }

  const s = new MagicStringAST(code)
  const { program } = parseSync('index.tsx', code, {
    sourceType: 'module',
  })

  walkAST<Node>(program, {
    enter(node) {
      if (
        node.type === 'JSXExpressionContainer' &&
        node.expression.type === 'AwaitExpression'
      ) {
        const { expression } = node
        const createVNode = importHelperFn(s, 0, 'createVNode')
        const shallowRef = importHelperFn(s, 0, 'shallowRef')
        const watchEffect = importHelperFn(s, 0, 'watchEffect')
        let resolvedFn = ''
        let injectedFn = ''
        s.appendRight(
          expression.start,
          `${createVNode}({async setup() {
            const ${HELPER_PREFIX}resolved = ${shallowRef}()
            const ${HELPER_PREFIX}isInject = ${shallowRef}()
            await new Promise((resolve) =>
              ${watchEffect}(async () => resolve(`,
        )
        const { argument } = expression
        processArgument(argument)
        function processArgument(argument: Node) {
          if (
            argument.type === 'CallExpression' &&
            argument.callee.type === 'MemberExpression'
          ) {
            const {
              callee: { property, object },
              arguments: [arg],
            } = argument
            if (
              property.type === 'Identifier' &&
              (arg?.type === 'ArrowFunctionExpression' ||
                arg?.type === 'FunctionExpression')
            ) {
              if (property.name === 'then' && !resolvedFn) {
                resolvedFn = `(${s.sliceNode(arg)})`
                s.overwriteNode(
                  arg.body!,
                  `{${HELPER_PREFIX}isInject.value = false; ${HELPER_PREFIX}resolved.value = ${s.sliceNode(arg.params[0])} }`,
                )
              } else if (property.name === 'catch' && !injectedFn) {
                injectedFn = `(${s.sliceNode(arg)})`
                s.overwriteNode(
                  arg.body!,
                  `{${HELPER_PREFIX}isInject.value = true; ${HELPER_PREFIX}resolved.value = ${s.sliceNode(arg.params[0])} }`,
                )
              }
            }
            if (object.type === 'CallExpression') {
              processArgument(object)
            }
          }
        }

        if (!injectedFn && !resolvedFn) {
          s.appendLeft(
            expression.end,
            `.then(i => ${HELPER_PREFIX}resolved.value = i)`,
          )
        }
        s.appendLeft(
          expression.end,
          `)));return () => ${injectedFn ? `${HELPER_PREFIX}isInject.value ? (${injectedFn})(${HELPER_PREFIX}resolved.value) :` : ''} ${resolvedFn}(${HELPER_PREFIX}resolved.value)`,
        )
        s.appendLeft(expression.end, `}})`)
      }
    },
  })

  return generateTransform(s, id)
}

const plugin = (rawOptions: Options = {}): UnpluginOptions => {
  const options = resolveOption(rawOptions)
  const filter = createFilter(options)

  const name = 'unplugin-jsx-await-expression'
  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },
    transform: transformJsxAwaitExpression,
  }
}
export default plugin
