import type { Options } from './core/options'
import unplugin from '.'

export default (options: Options) => ({
  name: 'unplugin-jsx-await-expression',
  hooks: {
    'astro:config:setup': (astro: any) => {
      astro.config.vite.plugins ||= []
      astro.config.vite.plugins.push(unplugin.vite(options))
    },
  },
})
