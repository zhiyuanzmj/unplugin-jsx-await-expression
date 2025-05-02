import { Suspense, defineComponent, ref } from 'vue'

const getList = async (length: number) => {
  await new Promise((r) => setTimeout(r, 1000))
  if (length > 4) throw new Error(`can't large than 3`)
  return Array.from({ length }).map((_, i) => i + 1)
}

const Comp = defineComponent(async () => {
  const length = ref(3)
  const foo = ref(0)

  return (
    <>
      {length.value}
      <button onClick={() => length.value++}>+</button>
      <button onClick={() => length.value--}>-</button>
      <Suspense v-slots={{ fallback: () => <div>Loading...</div> }}>
        {await getList(length.value)
          .then((items) => {
            return items.map((i) => (
              <div onClick={() => foo.value++}>
                {i}
                {foo.value}
              </div>
            ))
          })
          .catch((error) => <>{error.message}</>)}
      </Suspense>
    </>
  )
})

export default defineComponent(() => {
  return (
    <Suspense>
      <Comp />
    </Suspense>
  )
})
