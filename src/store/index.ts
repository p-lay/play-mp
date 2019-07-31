import { getStore as getMobxStore } from '@tarojs/mobx'
import { UserStore, userStore } from './user'
import { AuthModalStore, authModalStore } from './authModal'
import { MemoriaStore, memoriaStore } from './memoria'

export type Store = Partial<{
  userStore: UserStore
  memoriaStore: MemoriaStore
}>

type StoreWithAuth = Store & {
  authModalStore: AuthModalStore
}

export type WithStore<T> = T & Store

let allStore: any = null

export const getStore = <T extends keyof StoreWithAuth>(
  storeName: T,
): StoreWithAuth[T] => {
  if (!getMobxStore) throw 'no getStore in mobx'

  if (!allStore) {
    allStore = getMobxStore()
  }
  return allStore[storeName] as StoreWithAuth[T]
}

export default {
  userStore,
  authModalStore,
  memoriaStore,
}
