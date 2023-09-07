<template>
  <i :class="ns.b()" :style="style" v-bind="$attrs">
    <slot />
  </i>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { addUnit, isUndefined } from '@element-plus/utils'
import { useNamespace } from '@element-plus/hooks'
import { iconProps } from './icon'
import type { CSSProperties } from 'vue'
// 定义组件名字的
defineOptions({
  name: 'ElIcon',
  inheritAttrs: false,
})
const props = defineProps(iconProps)
const ns = useNamespace('icon')
// CSSProperties 是 Vue3 提供的 CSS 属性的类型
const style = computed<CSSProperties>(() => {
  const { size, color } = props
  if (!size && !color) return {}

  return {
    fontSize: isUndefined(size) ? undefined : addUnit(size),
    //因为 $ 被 Sass 用掉了，@ 被 Less 用掉了。为了不产生冲突，官方的 CSS 变量就改用两根连词线了
    //CSS 变量（CSS variable）又叫做 "CSS 自定义属性"（CSS custom properties），
    // 声明变量的时候，变量名前面要加两根连词线（--）
    '--color': color, // 通过 CSS 变量方式进行设置 color
  }
})
</script>
