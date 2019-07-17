import { getStore as getMobxStore } from '@tarojs/mobx'
import { UserStore, userStore } from './user'
import { AuthModalStore, authModalStore } from './authModal'

export type Store = Partial<{
  userStore: UserStore
}>

type StoreWithAuth = Store & {
  authModalStore: AuthModalStore
}

export type WithStore<T> = T & Store

let allStore: any = null

export const getStore = <T extends keyof StoreWithAuth>(storeName: T): StoreWithAuth[T] => {
  if (!allStore) {
    allStore = getMobxStore()
  }
  return allStore[storeName] as StoreWithAuth[T]
}

export default {
  userStore,
  authModalStore,
}
