import { observable } from 'mobx'

const store = {
  res: null,

  setRes(res: any) {
    this.res = res
  },
}

export type MemoriaStore = typeof store

export const memoriaStore = observable(store)
