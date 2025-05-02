import { createPlugin, replaceSourceRange } from 'ts-macro'

export default createPlugin(({ ts }) => {
  return {
    name: 'jsx-await-expression',
    resolveVirtualCode({ codes, ast, source }) {
      ts.forEachChild(ast, walk)

      function walk(node: import('typescript').Node) {
        ts.forEachChild(node, walk)
        if (
          ts.isJsxExpression(node) &&
          node.expression &&
          ts.isAwaitExpression(node.expression)
        ) {
          replaceSourceRange(
            codes,
            source,
            node.expression.pos,
            node.expression.expression.pos,
          )
        }
      }
    },
  }
})
