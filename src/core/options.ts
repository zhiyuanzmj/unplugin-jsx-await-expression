import {
  REGEX_NODE_MODULES,
  REGEX_SUPPORTED_EXT,
  type BaseOptions,
} from '@vue-macros/common'

export interface Options extends Pick<BaseOptions, 'include' | 'exclude'> {}

export type OptionsResolved = Pick<Required<Options>, 'include'> &
  Pick<Options, 'exclude'>

export const ignore = []

export function resolveOption(options: Options): OptionsResolved {
  return {
    include: [REGEX_SUPPORTED_EXT],
    exclude: [REGEX_NODE_MODULES],
    ...options,
  }
}
