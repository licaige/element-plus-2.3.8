import { withInstall } from '@element-plus/utils'

import Icon from './src/icon.vue'

//通过 withInstall 方法给 Icon 添加了一个 install 方法
export const ElIcon = withInstall(Icon)
export default ElIcon
// 导出 Icon 组件的 props
export * from './src/icon'
