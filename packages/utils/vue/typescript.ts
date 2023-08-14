import type { AppContext, Plugin } from 'vue'
/*
 *通过泛型 将最后返回的 main 的类型 定义为 T & Plugin & E的交叉类型，为并且关系
 * */
export type SFCWithInstall<T> = T & Plugin

export type SFCInstallWithContext<T> = SFCWithInstall<T> & {
  _context: AppContext | null
}
