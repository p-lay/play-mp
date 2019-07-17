import { observable } from 'mobx'

const store = {
  modal: {
    isUserInfoVisible: false,
  },

  openUserInfo() {
    this.modal.isUserInfoVisible = true
  },

  closeUserInfo() {
    this.modal.isUserInfoVisible = false
  },

  get isUserInfoVisible() {
    return this.modal.isUserInfoVisible
  },
}

export type AuthModalStore = typeof store

export const authModalStore = observable(store)
