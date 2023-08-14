<template>
  <transition
    :name="ns.b('fade')"
    @before-leave="onClose"
    @after-leave="$emit('destroy')"
  >
    <div
      v-show="visible"
      :id="id"
      ref="messageRef"
      :class="[
        ns.b(),
        { [ns.m(type)]: type && !icon },
        ns.is('center', center),
        ns.is('closable', showClose),
        customClass,
      ]"
      :style="customStyle"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <el-badge
        v-if="repeatNum > 1"
        :value="repeatNum"
        :type="badgeType"
        :class="ns.e('badge')"
      />
      <el-icon v-if="iconComponent" :class="[ns.e('icon'), typeClass]">
        <component :is="iconComponent" />
      </el-icon>
      <slot>
        <p v-if="!dangerouslyUseHTMLString" :class="ns.e('content')">
          {{ message }}
        </p>
        <!-- Caution here, message could've been compromised, never use user's input as message -->
        <p v-else :class="ns.e('content')" v-html="message" />
      </slot>
      <el-icon v-if="showClose" :class="ns.e('closeBtn')" @click.stop="close">
        <Close />
      </el-icon>
    </div>
  </transition>
</template>

<script lang="ts" setup>
/*
 *再来梳理下主要流程：
执行method.ts 中的 message函数, 它会调用normalizeOptions 函数去将用户的传递的对象和默认参数进行合并操作，
* 并根据 grouping属性 以及当前实例的数量 决定是走创建新实例的逻辑，还是使用原有的实例 并将其repeatNum属性自增
如果进入创建新实例逻辑，调用createMessage 函数，创建VNode渲染到页面上，
* 然后将实例添加进instances 中， 最后返回一个包含 close 函数的对象
 * */
import { computed, onMounted, ref, watch } from 'vue'
import { useEventListener, useResizeObserver, useTimeoutFn } from '@vueuse/core'
import { TypeComponents, TypeComponentsMap } from '@element-plus/utils'
import { EVENT_CODE } from '@element-plus/constants'
import ElBadge from '@element-plus/components/badge'
import { useGlobalComponentSettings } from '@element-plus/components/config-provider'
import { ElIcon } from '@element-plus/components/icon'
import { messageEmits, messageProps } from './message'
import { getLastOffset, getOffsetOrSpace } from './instance'
import type { BadgeProps } from '@element-plus/components/badge'
import type { CSSProperties } from 'vue'

const { Close } = TypeComponents
//unplugin-vue-macros 宏 用于设置组件名
defineOptions({
  name: 'ElMessage',
})

const props = defineProps(messageProps)
defineEmits(messageEmits)

const { ns, zIndex } = useGlobalComponentSettings('message')
const { currentZIndex, nextZIndex } = zIndex

const messageRef = ref<HTMLDivElement>()
const visible = ref(false)
const height = ref(0)

let stopTimer: (() => void) | undefined = undefined

//根据type类型 决定 message中的 图标类型
const badgeType = computed<BadgeProps['type']>(() =>
  props.type ? (props.type === 'error' ? 'danger' : props.type) : 'info'
)
//生成对应type类型 即 success warning...  的  icon字符的类名
const typeClass = computed(() => {
  const type = props.type
  return { [ns.bm('icon', type)]: type && TypeComponentsMap[type] }
})
//根据类型决定图标组件或者 用户传递指定图标的组件名
const iconComponent = computed(
  () => props.icon || TypeComponentsMap[props.type] || ''
)
//getLastOffset(instance.ts) 会取出当前实例的上一个创建的实例 如果没有就取0 的偏移值 有的话 取上一个实例暴露的bottom值
const lastOffset = computed(() => getLastOffset(props.id))
//offset 取的是 用户传递的偏移值 +  上一个实例的bottom, 没有的话  默认偏移值是16 (message.ts messageDefaults对象)
const offset = computed(
  () => getOffsetOrSpace(props.id, props.offset) + lastOffset.value
)
//bottom取的是 height值 + 偏移值
const bottom = computed((): number => height.value + offset.value)
//偏移值  层级
const customStyle = computed<CSSProperties>(() => ({
  top: `${offset.value}px`,
  zIndex: currentZIndex.value,
}))
//再组件实例挂载后  根据用户传递或者默认的duration 决定close调用
function startTimer() {
  if (props.duration === 0)
    return //hook会返回一个 stop函数用于关闭定时器的执行 它会赋值到全局上的stopTimer变量
  ;({ stop: stopTimer } = useTimeoutFn(() => {
    close()
  }, props.duration))
  /*
   * 这里使用了 useTimeoutFn ，它返回一个stop属性，这里赋值给了stopTimer 变量，
   * 在clearTimer函数中会调用它，很好理解 就是取消定时器，所以你接着看到这段watch函数代码的调用
   * */
}

function clearTimer() {
  stopTimer?.()
}
//隐藏组件的显示
function close() {
  visible.value = false
}
//监听 esc按下 触发close事件
function keydown({ code }: KeyboardEvent) {
  if (code === EVENT_CODE.esc) {
    // press esc to close the message
    close()
  }
}
//组件DOM挂载后 开启定时器 并显示容器
onMounted(() => {
  startTimer()
  nextZIndex()
  visible.value = true
})
/*
 * 组件挂载后，调用startTimer 函数，并且让组件显示.这里的逻辑很好理解，根据props的duration值,
 * 决定多久后隐藏组件，一旦隐藏显示后，就会触发 动画钩子,即前面说过的 onClose 和 onDestory事件
 * */
watch(
  () => props.repeatNum,
  () => {
    clearTimer()
    startTimer()
  }
)
/*
* 监听props中的repeatNum，前面有提到过它意味着如果开启了 grouping这个属性，
* 如果创建实例的文本内容出现重复的情况下，会直接使用这个重复的实例，并让实例的 repeatNum属性自增。
所以这里就很好理解，用户开启了grouping属性，一旦出现重复内容的实例，
* 不会创建新的实例，并被这个watch触发,执行关闭定时器再开启定时器的操作.
* */
useEventListener(document, 'keydown', keydown)
/*
 *这一块主要说明下 lastOffset、offset、bottom， 关键就是bottom ，
 * 它会被暴露出去用于在创建下一个Message组件时获取对应的偏移值，
 * 它的计算公式是： 偏移值 + Message组件的高度
 * */
useResizeObserver(messageRef, () => {
  //ResizeObserver监听元素的内容的尺寸变化，触发变化会赋值到 height变量上触发更新
  height.value = messageRef.value!.getBoundingClientRect().height
})

defineExpose({
  visible,
  bottom,
  close,
})
</script>
