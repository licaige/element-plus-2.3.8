/*
 * useNameSpace 函数会返回一系列用于生成和BEM命名规范的方法，本质上就是对_bem函数的再调用,
 *  如源码中的 ns.b() 根据一开始调用的 container，内部默认的defaultNamespace值为 el，
 * 最终会生成类名 el-container, 如果是 ns.be('harexs') 则是 el-container__harexs
 * */

import { computed, getCurrentInstance, inject, ref, unref } from 'vue'

import type { InjectionKey, Ref } from 'vue'

export const defaultNamespace = 'el'
const statePrefix = 'is-'

const _bem = (
  namespace: string,
  block: string,
  blockSuffix: string,
  element: string,
  modifier: string
) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
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
  const namespace = computed(() => {
    return unref(derivedNamespace) || defaultNamespace
  })
  return namespace
}

export const useNamespace = (
  block: string,
  namespaceOverrides?: Ref<string | undefined>
) => {
  //得到默认的命名空间 没有声明的情况下默认是 el
  const namespace = useGetDerivedNamespace(namespaceOverrides)
  // 使用b函数 生成字符如block为container 生成字符el-container
  const b = (blockSuffix = '') =>
    _bem(namespace.value, block, blockSuffix, '', '')
  // 使用e函数 生成字符如block为container el-container-xxx
  const e = (element?: string) =>
    element ? _bem(namespace.value, block, '', element, '') : ''
  const m = (modifier?: string) =>
    modifier ? _bem(namespace.value, block, '', '', modifier) : ''
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element
      ? _bem(namespace.value, block, blockSuffix, element, '')
      : ''
  const em = (element?: string, modifier?: string) =>
    element && modifier
      ? _bem(namespace.value, block, '', element, modifier)
      : ''
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier
      ? _bem(namespace.value, block, blockSuffix, '', modifier)
      : ''
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier
      ? _bem(namespace.value, block, blockSuffix, element, modifier)
      : ''
  //state 判断传入的形参数量是否大于1个  statePrefix is- 比如传的是vertical 就是 is-vertical
  //如果 args有传入则默认则取一个值本身 没传直接就是true
  /*
   * 判断是否有传递第二个参数，有则 取值，没有默认True 然后判断条件成立，为真时 则返回类名is-name，否则空
   * */
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ''
  }

  // for css var
  // --el-xxx: value;
  //通过对象遍历返回符合css变量格式的新对象
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
  //非对象形式生成
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

export type UseNamespaceReturn = ReturnType<typeof useNamespace>
