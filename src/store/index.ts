import { getStore as getMobxStore } from '@tarojs/mobx'
import { UserStore } from './user'

export type Store = Partial<{
  userStore: UserStore
}>

export type WithStore<T> = T & Store

let allStore: any = null

export const getStore = <T extends keyof Store>(storeName: T): Store[T] => {
  if (!allStore) {
    allStore = getMobxStore()
  }
  return allStore[storeName] as Store[T]
}
