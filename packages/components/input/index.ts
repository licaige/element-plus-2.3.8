// 组件入口文件
import { withInstall } from '@element-plus/utils'

import Input from './src/input.vue'

export const ElInput = withInstall(Input)
export default ElInput

export * from './src/input'
export type { InputInstance } from './src/instance'
