/*
 *这个是我们的组件创建的核心文件， 也是我们在代码中调用ElMessage()的核心逻辑
 *message 核心函数，用于调用normalizeOptions 函数得到最终配置，调用createMessage 创建组件在页面上显示并将实例添加进instances 中
 *
 * */
import { createVNode, render } from 'vue'
import {
  debugWarn,
  isClient,
  isElement,
  isFunction,
  isNumber,
  isString,
  isVNode,
} from '@element-plus/utils'
import { messageConfig } from '@element-plus/components/config-provider'
import MessageConstructor from './message.vue'
import { messageDefaults, messageTypes } from './message'
import { instances } from './instance'

import type { MessageContext } from './instance'
import type { AppContext } from 'vue'
import type {
  Message,
  MessageFn,
  MessageHandler,
  MessageOptions,
  MessageParams,
  MessageParamsNormalized,
  messageType,
} from './message'

let seed = 1

// TODO: Since Notify.ts is basically the same like this file. So we could do some encapsulation against them to reduce code duplication.
/*
 * 处理用户传递的对象配置,和默认的参数进行合并，并且确定最终组件插入到页面上的位置
 * */
const normalizeOptions = (params?: MessageParams) => {
  const options: MessageOptions =
    !params || isString(params) || isVNode(params) || isFunction(params)
      ? { message: params }
      : params

  const normalized = {
    ...messageDefaults,
    ...options,
  }

  if (!normalized.appendTo) {
    //如果没传这个属性  则默认插到body
    normalized.appendTo = document.body
  } else if (isString(normalized.appendTo)) {
    //如果声明了字符 则在页面上去找这个元素
    let appendTo = document.querySelector<HTMLElement>(normalized.appendTo)
    // should fallback to default value with a warning
    //如果 声明的元素不存在 则警告并插到 body  兜底处理
    if (!isElement(appendTo)) {
      debugWarn(
        'ElMessage',
        'the appendTo option is not an HTMLElement. Falling back to document.body.'
      )
      appendTo = document.body
    }

    normalized.appendTo = appendTo
  }

  return normalized as MessageParamsNormalized
}
/*
 *用于移除组件的实例，并且关闭对应组件在页面的显示
 * */
const closeMessage = (instance: MessageContext) => {
  const idx = instances.indexOf(instance)
  if (idx === -1) return
  //存在的话 从数组中移除这个实例
  instances.splice(idx, 1)
  //取出 close事件执行
  const { handler } = instance
  handler.close()
}
/*
 *获取message.vue 组件 创建虚拟节点并传递配置到props,最终挂载到页面上显示
 * */
const createMessage = (
  { appendTo, ...options }: MessageParamsNormalized,
  context?: AppContext | null
): MessageContext => {
  const id = `message_${seed++}`
  //取出用户定义的 关闭回调
  const userOnClose = options.onClose
  //容器  包裹 message组件
  const container = document.createElement('div')
  //格式化所有 属性， zIndex取 默认索引+1
  /*
   *这一部分代码都比较好理解， 首先是取 递增的 zIndex值， 处理多个Message之间的层叠问题。 并且取出用户的关闭回调，最终定义了props 对象
其内部还增加了 onClose 以及 onDestroy 方法，这两个函数在组件内的 动画离开钩子前后都会被触发
这里要再说明下 render(null, container)的作用， 它在onClose 被执行后，紧接着组件内的动画钩子会执行 onDestroy 函数
render 渲染器函数接收两个参数，第一个参数为新的VNode节点，第二个参数是Container容器节点，
 它会拿新的VNode节点和 Container容器节点内的VNode节点进行新旧比对，更新Container它内部的VNode节点
onDestroy 最终做的事情就是将容器内的 所有Message实例 清空，即页面上的HTML节点进行移除， 那么这里的这两个函数的作用就是：
执行用户的关闭回调
执行实例的删除以及组件隐藏
移除页面上的DOM 释放内存
   * */
  const props = {
    ...options,
    // now the zIndex will be used inside the message.vue component instead of here.
    // zIndex: nextIndex() + options.zIndex
    id,
    //vue组件内的transition before-leave钩子会触发这个函数 去移除实例并 隐藏组件
    onClose: () => {
      userOnClose?.()
      //先执行关闭回调 再执行 message的关闭和实例的移除
      //这里的instance 再还没被执行之前是未定义的， 等它被实际调用时 会去拿下面的instance
      closeMessage(instance)
    },

    // clean message element preventing mem leak
    //vue组件内的transition after-leave钩子会通过emit触发这个函数 将容器的DOM置空
    onDestroy: () => {
      // since the element is destroy, then the VNode should be collected by GC as well
      // we do not want cause any mem leak because we have returned vm as a reference to users
      // so that we manually set it to false.
      render(null, container)
    },
  }
  /*
  * 需要注意第三个参数会处理 props对象中 不为文本类型的message值，
  *  非文本的值会传递到 组件内的slot 插槽去响应。 因为你可以看到它最终的结果是一个 {default:xxx} 的对象，
  * 组件内使用了默认插槽去使用它
后面通过render 函数将其渲染到容器内，最终插入到了页面上
  * */
  const vnode = createVNode(
    //即message组件本身， 通过Vue暴露的createVNode 函数，传递之前得到props对象传递到组件内部使用
    MessageConstructor,
    props,
    isFunction(props.message) || isVNode(props.message)
      ? {
          default: isFunction(props.message)
            ? props.message
            : () => props.message,
        }
      : null
  )
  //没传递指向的话  默认是null
  vnode.appContext = context || message._context
  //render 函数会将 vnode作为新节点 和 contaiiner中的vnode作为旧节点 进行 对比更新， 这里通常是首次挂载
  //这里将message组件的VNODE通过render函数 渲染到 container中， 但container作为DOM容器用于承载 message组件但实际挂载时我们不会用到它
  render(vnode, container)
  // instances will remove this item when close function gets called. So we do not need to worry about it.
  //最终当组件执行close 移除了instance 和 组件的隐藏  之后会触发 onDestroy 会将container中的DOM销毁
  appendTo.appendChild(container.firstElementChild!)
  //执行到这里的时候 页面上就已经挂载Message组件了
  const vm = vnode.component!
  //handler 暴露close方法 调用后 会改变组件内的 visible属性值
  //exposed 即被手动暴露出来的属性或者方法
  const handler: MessageHandler = {
    // instead of calling the onClose function directly, setting this value so that we can have the full lifecycle
    // for out component, so that all closing steps will not be skipped.
    close: () => {
      vm.exposed!.visible.value = false
    },
  }
  //最终返回 instance实例 包含自增的ID， 组件渲染的VNode, 组件的实例component，handler方法，组件内部要接收的props
  const instance: MessageContext = {
    //自增的id
    id,
    //组件创建的 虚拟节点
    vnode,
    //组件本身
    vm,
    //包含 close方法的 handler
    handler,
    //组件传递的props
    props: (vnode.component as any).props,
  }

  return instance
}
/*
 *message函数对应的就是 我们代码中 ElMessage函数 的调用
 * */
const message: MessageFn &
  Partial<Message> & { _context: AppContext | null } = (
  options = {},
  context
) => {
  //判断浏览器环境
  if (!isClient) return { close: () => undefined }
  //默认没有max  如果有在全局配置或者  config-provider 注入到所有组件并配置了这个值 则生效
  //创建的 message 实例超出上限则不再创建
  if (isNumber(messageConfig.max) && instances.length >= messageConfig.max) {
    return { close: () => undefined }
  }
  //normalizeOptions 处理传进来的配置和默认配置进行合并 并确定message是插到body还是哪里
  const normalized = normalizeOptions(options)
  //如果用户定义 合并消息相同的message 并且当前实例数量大于0
  if (normalized.grouping && instances.length) {
    //寻找所有的实例 属性message 和 传入的 message一致的实例
    const instance = instances.find(
      ({ vnode: vm }) => vm.props?.message === normalized.message
    )
    //如果找到了消息相同的 取新传进来的 类型 并且自增自身的重复属性，并返回实例的handler
    if (instance) {
      instance.props.repeatNum += 1
      instance.props.type = normalized.type
      return instance.handler
    }
  }
  /*
   * 这里主要看 grouping 部分，这里判断了 是否要合并相同消息的Message，如果开启了这个属性则 直接返回这个消息的实例，并让这个实例属性 repeatNum 自增，
   *  它的自增会触发 组件内的 watch 函数 重新开启组件的定时器
   * */
  //创建实例
  const instance = createMessage(normalized, context)
  //将实例push进我们的数组
  instances.push(instance)
  //返回实例的 handler方法

  //到这里就清楚了 import {ElMessage} from 'element-plus' 那取到的message方法， 调用该函数并传递配置属性
  //我们还可以手动去调用 ElMessage.closeAll() 方法，它会遍历所有实例去调用 close方法
  //返回一个包含close方法的对象，它会将组件内的 visable设为 false隐藏
  //剩下的就是 message vue组件内部的运行逻辑了
  return instance.handler
  /*
   * 创建实例，将实例添加进 instances这个 浅层响应式的数组中，并将 handler 返回， 所以你如果调用函数之后，会得到一个包含close函数的对象
   * */
}
//messageTypes 即[]['success', 'info', 'warning', 'error'], 它默认会去遍历所有type 然后 给 message函数 去挂载对应type的函数
//type函数最终逻辑 就是调用了一遍message函数然后返回一个message实例, 那么我们就可以通过 ElMessage.success() 这样的形式去指定创建的消息类型
messageTypes.forEach((type) => {
  message[type] = (options = {}, appContext) => {
    const normalized = normalizeOptions(options)
    return message({ ...normalized, type }, appContext)
  }
})
/*
 * 这里就是通过循环依次通过message函数的调用，给message添加对应Type 类型的属性， 所以你会发现可以通过这种形式去调用：
 *ElMessage.success('我成功了')
ElMessage.warning('我警告了')
ElMessage.info('我信息了')
 * */
export function closeAll(type?: messageType): void {
  for (const instance of instances) {
    if (!type || type === instance.props.type) {
      instance.handler.close()
    }
  }
}

message.closeAll = closeAll
message._context = null

export default message as Message
