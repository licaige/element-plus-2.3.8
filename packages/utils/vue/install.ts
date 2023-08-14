import { NOOP } from '@vue/shared'

import type { App, Directive } from 'vue'
import type { SFCInstallWithContext, SFCWithInstall } from './typescript'
/*
 * 传递两个参数，main类型为泛型T，extra是一个对象，通过Object.values 将 extra 中的属性值提取为一个数组，
 * 并进行遍历进行 组件的注册. 如果extra不为空则通过 迭代器遍历 Object.entries 转换后的 二维数组，
 * 将extra所有属性和值 挂载到 main 对象下
 * */
export const withInstall = <T, E extends Record<string, any>>(
  main: T,
  extra?: E
) => {
  ;(main as SFCWithInstall<T>).install = (app): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp)
    }
  }

  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      ;(main as any)[key] = comp
    }
  }
  return main as SFCWithInstall<T> & E
}
/*
 *这个函数干的事情很简单，就是进行组件的注册
 * */
export const withInstallFunction = <T>(fn: T, name: string) => {
  ;(fn as SFCWithInstall<T>).install = (app: App) => {
    ;(fn as SFCInstallWithContext<T>)._context = app._context
    app.config.globalProperties[name] = fn
  }

  return fn as SFCInstallWithContext<T>
}
/*
将其代码简化后再看就很好理解了
将Message 的默认导出函数 包装install方法，用于Vue.use的组件注册
我们在代码中的import {Elmessage} from 'element-plus 获取的 也是这一处的导出
* */

/*
import Message from './src/method'
export const withInstallFunction = (fn, name) => {
  fn.install = (app) => {
    fn._context = app._context
    app.config.globalProperties[name] = fn
  }
  return fn
}
*/
export const withInstallDirective = <T extends Directive>(
  directive: T,
  name: string
) => {
  ;(directive as SFCWithInstall<T>).install = (app: App): void => {
    app.directive(name, directive)
  }

  return directive as SFCWithInstall<T>
}
/*
 *它将使用这个函数调用的组件的install属性 重置为一个空函数了
 * */
export const withNoopInstall = <T>(component: T) => {
  ;(component as SFCWithInstall<T>).install = NOOP

  return component as SFCWithInstall<T>
}
