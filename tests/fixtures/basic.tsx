import { defineComponent } from 'vue'

export default defineComponent(()=>{
  const getList = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    return [1, 2, 3]
  }

  return () => <>{await getList()}</>
})


import { createVNode as __MACROS_createVNode } from "vue";
import { shallowRef as __MACROS_shallowRef } from "vue";
import { watchEffect as __MACROS_watchEffect } from "vue";
defineComponent(()=>{
  const getList = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    return [1, 2, 3]
  }

  return () => <>{__MACROS_createVNode({async setup() {
    const _result = __MACROS_shallowRef()
    return await new Promise((resolve) => __MACROS_watchEffect(async () => resolve(
      _result.value = await getList()
    )))}})}</>
})
