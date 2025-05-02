# unplugin-jsx-await-expression [![npm](https://img.shields.io/npm/v/unplugin-jsx-await-expression.svg)](https://npmjs.com/package/unplugin-jsx-await-expression)

[![Unit Test](https://github.com/zhiyuanzmj/unplugin-jsx-await-expression/actions/workflows/unit-test.yml/badge.svg)](https://github.com/zhiyuanzmj/unplugin-jsx-await-expression/actions/workflows/unit-test.yml)

Await expressions for vue-jsx.

## Install

```bash
npm i -D unplugin-jsx-await-expression
```

## Usage

```tsx
export default defineComponent(() => {
  return () => (
    <Suspense v-slots={{ fallback: () => <div>Loading...</div> }}>
      {await fetch('/api/user')
        .then(({ data }) => data.map((user) => <div>{user.name}</div>))
        .catch((error) => <div>{error.message}</div>)}
    </Suspense>
  )
})
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import jsxAwaitExpression from 'unplugin-jsx-await-expression/vite'

export default defineConfig({
  plugins: [jsxAwaitExpression()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import jsxAwaitExpression from 'unplugin-jsx-await-expression/rollup'

export default {
  plugins: [jsxAwaitExpression()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-jsx-await-expression/esbuild')()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-jsx-await-expression/webpack')()],
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-jsx-await-expression/webpack')()],
  },
}
```

<br></details>

### Volar Config

```jsonc
// tsconfig.json
{
  // ...
  "vueCompilerOptions": {
    "plugins": ["unplugin-jsx-await-expression/volar"],
  },
}
```

### [TS Macro](https://github.com/ts-macro/ts-macro) Config

```ts [tsm.config.json]
import jsxAwaitExpression from 'unplugin-jsx-await-expression/volar'

export default {
  plugins: [jsxAwaitExpression()],
}
```

## License

[MIT](./LICENSE) License © 2023-PRESENT [zhiyuanzmj](https://github.com/zhiyuanzmj)
