// makeInstaller配置
import { provideGlobalConfig } from '@element-plus/components/config-provider'
import { INSTALLED_KEY } from '@element-plus/constants'
// 版本信息
import { version } from './version'
// 类型声明文件引入
import type { App, Plugin } from '@vue/runtime-core'
// 类型引入
import type { ConfigProviderContext } from '@element-plus/components/config-provider'
// 导出对应配置
export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, options?: ConfigProviderContext) => {
    if (app[INSTALLED_KEY]) return

    app[INSTALLED_KEY] = true
    components.forEach((c) => app.use(c))

    if (options) provideGlobalConfig(options, app, true)
  }
  // 具体导出方法属性
  return {
    version,
    install,
  }
}
