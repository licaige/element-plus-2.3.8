import { computed, getCurrentInstance, inject, ref, unref } from 'vue'

import type { InjectionKey, Ref } from 'vue'

export const defaultNamespace = 'el'
const statePrefix = 'is-'
// BEM 命名字符拼接函数
const _bem = (
  namespace: string,
  block: string,
  blockSuffix: string,
  element: string,
  modifier: string
) => {
  // 默认是 Block
  let cls = `${namespace}-${block}`
  // 如果存在 Block 后缀，也就是 Block 里面还有 Block，例如：el-form 下面还有一个 el-form-item
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  // 如果存在元素
  if (element) {
    cls += `__${element}`
  }
  // 如果存在修改器
  if (modifier) {
    cls += `--${modifier}`
  }
  //这里值得注意的是 Block 有可能有后缀，也就是 Block 里面还有 Block，例如：el-form 下面还有一个 el-form-item
  return cls
}

export const namespaceContextKey: InjectionKey<Ref<string | undefined>> =
  Symbol('namespaceContextKey')

export const useGetDerivedNamespace = (
  namespaceOverrides?: Ref<string | undefined>
) => {
  const derivedNamespace =
    namespaceOverrides ||
    (getCurrentInstance()
      ? inject(namespaceContextKey, ref(defaultNamespace))
      : ref(defaultNamespace))
  // 命名前缀也就是命名空间
  const namespace = computed(() => {
    return unref(derivedNamespace) || defaultNamespace
  })
  return namespace
}

export const useNamespace = (
  block: string,
  namespaceOverrides?: Ref<string | undefined>
) => {
  const namespace = useGetDerivedNamespace(namespaceOverrides)
  // 创建块 例如：el-form
  const b = (blockSuffix = '') =>
    _bem(namespace.value, block, blockSuffix, '', '')
  // 创建元素 例如：el-input__inner
  const e = (element?: string) =>
    element ? _bem(namespace.value, block, '', element, '') : ''
  // 创建块修改器 例如：el-form--default
  const m = (modifier?: string) =>
    modifier ? _bem(namespace.value, block, '', '', modifier) : ''
  // 创建后缀块元素 例如：el-form-item
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element
      ? _bem(namespace.value, block, blockSuffix, element, '')
      : ''
  // 创建元素修改器 例如：el-scrollbar__wrap--hidden-default
  const em = (element?: string, modifier?: string) =>
    element && modifier
      ? _bem(namespace.value, block, '', element, modifier)
      : ''
  // 创建块后缀修改器 例如：el-form-item--default
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier
      ? _bem(namespace.value, block, blockSuffix, '', modifier)
      : ''
  // 创建块元素修改器 例如：el-form-item__content--xxx
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier
      ? _bem(namespace.value, block, blockSuffix, element, modifier)
      : ''
  // 创建动作状态 例如：is-success is-required
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ''
  }

  // for css var
  // --el-xxx: value;
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${key}`] = object[key]
      }
    }
    return styles
  }
  // with block
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${block}-${key}`] = object[key]
      }
    }
    return styles
  }

  const cssVarName = (name: string) => `--${namespace.value}-${name}`
  const cssVarBlockName = (name: string) =>
    `--${namespace.value}-${block}-${name}`

  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
    // css
    cssVar,
    cssVarName,
    cssVarBlock,
    cssVarBlockName,
  }
}
/*
*
创建块 el-form、
创建元素 el-input__inner、
创建块修改器 el-form--default、
创建块后缀元素 el-form-item、
创建元素修改器 el-scrollbar__wrap--hidden-default、
创建动作状态 例如：is-success is-required
* */
export type UseNamespaceReturn = ReturnType<typeof useNamespace>
