import { makeInstaller } from './make-installer'
import Components from './component'
import Plugins from './plugin'
// 大概率是把组件统一处理下
export default makeInstaller([...Components, ...Plugins])
