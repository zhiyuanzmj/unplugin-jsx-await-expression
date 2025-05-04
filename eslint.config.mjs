import { sxzz } from '@sxzz/eslint-config'

export default sxzz().overrideRules({
  'unused-imports/no-unused-vars': 'off',
  'unused-imports/no-unused-imports': 'off',
  'import/no-default-export': 'off',
})
