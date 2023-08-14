import { computed, getCurrentInstance, inject, ref, unref } from 'vue'
import { isNumber } from '@element-plus/utils'

import type { InjectionKey, Ref } from 'vue'

const zIndex = ref(0)
export const defaultInitialZIndex = 2000

export const zIndexContextKey: InjectionKey<Ref<number | undefined>> =
  Symbol('zIndexContextKey')
/*
 *取出全局下的zIndex  每次创建实例都会 自增一次 保证层级不重复
 * */
export const useZIndex = (zIndexOverrides?: Ref<number>) => {
  const zIndexInjection =
    zIndexOverrides ||
    (getCurrentInstance() ? inject(zIndexContextKey, undefined) : undefined)
  const initialZIndex = computed(() => {
    const zIndexFromInjection = unref(zIndexInjection)
    return isNumber(zIndexFromInjection)
      ? zIndexFromInjection
      : defaultInitialZIndex
  })
  const currentZIndex = computed(() => initialZIndex.value + zIndex.value)

  const nextZIndex = () => {
    zIndex.value++
    return currentZIndex.value
  }

  return {
    initialZIndex,
    currentZIndex,
    nextZIndex,
  }
}

export type UseZIndexReturn = ReturnType<typeof useZIndex>
