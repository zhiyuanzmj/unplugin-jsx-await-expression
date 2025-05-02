import {
  HELPER_PREFIX,
  MagicStringAST,
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  createFilter,
  generateTransform,
  getLang,
  importHelperFn,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import { type Options, resolveOption } from './core/options'
import type { Node } from 'oxc-parser'
import type { UnpluginOptions } from 'unplugin'

const { parseSync } = await import(
  // @ts-ignore
  typeof window !== 'undefined'
    ? 'https://cdn.jsdelivr.net/npm/@oxc-parser/binding-wasm32-wasi/browser-bundle.mjs'
    : 'oxc-parser'
)

function transform(code: string, s: MagicStringAST) {
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
}

export function transformJSXAwaitExpression(code: string, id: string) {
  const lang = getLang(id)
  let asts: {
    text: string
    offset: number
  }[] = []
  if (lang === 'vue' || REGEX_SETUP_SFC.test(id)) {
    const { scriptSetup, script } = parseSFC(code, id)
    if (script?.content) {
      asts.push({
        text: script.content,
        offset: script.loc.start.offset,
      })
    }
    if (scriptSetup) {
      asts.push({
        text: scriptSetup.content!,
        offset: scriptSetup.loc.start.offset,
      })
    }
  } else if (REGEX_SRC_FILE.test(id)) {
    asts = [{ text: code, offset: 0 }]
  } else {
    return
  }

  const s = new MagicStringAST(code)

  for (const { text, offset } of asts) {
    s.offset = offset
    transform(text, s)
  }

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
    transform: transformJSXAwaitExpression,
  }
}
export default plugin
