import installer from './defaults'
export * from '@element-plus/components'
export * from '@element-plus/constants'
export * from '@element-plus/directives'
export * from '@element-plus/hooks'
export * from './make-installer'

export const install = installer.install
export const version = installer.version
export default installer
// 时间插件
export { default as dayjs } from 'dayjs'
