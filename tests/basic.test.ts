import { describe, expect, test } from 'vitest'
import { transformJsxAwaitExpression } from '../src/raw'

describe('fixtures', () => {
  test('basic', async () => {
    const { code } = (await transformJsxAwaitExpression(
      `
defineComponent(()=>{
  const getList = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    return [1, 2, 3]
  }

  return () => <>{
    await getList(length.value)
    .then(items => items)
    .then((items) => items.map((i) => <div>{i}{length.value}</div>))
    .catch((e) => <>{e.message}</>)
  }</>
})
      `,
      'index.tsx',
    ))!
    expect(code).toMatchInlineSnapshot(`
      "
      import { createVNode as __MACROS_createVNode } from "vue";
      import { shallowRef as __MACROS_shallowRef } from "vue";
      import { watchEffect as __MACROS_watchEffect } from "vue";
      defineComponent(()=>{
        const getList = async () => {
          await new Promise((r) => setTimeout(r, 1000))
          return [1, 2, 3]
        }

        return () => <>{
          __MACROS_createVNode({async setup() {
                  const __MACROS_resolved = __MACROS_shallowRef()
                  const __MACROS_isReject = __MACROS_shallowRef()
                  await new Promise((resolve) =>
                    __MACROS_watchEffect(async () => resolve(await getList(length.value)
          .then(items => items)
          .then((items) => {__MACROS_isReject.value = false; __MACROS_resolved.value = items })
          .catch((e) => {__MACROS_isReject.value = true; __MACROS_resolved.value = e }))));return () => __MACROS_isReject.value ? (((e) => <>{e.message}</>))(__MACROS_resolved.value) : ((items) => items.map((i) => <div>{i}{length.value}</div>))(__MACROS_resolved.value)}})
        }</>
      })
            "
    `)
  })
})
