import { observable } from 'mobx'

type AuthSetting = {
  userInfo: boolean
}

const store = {
  userInfo: {
    nickName: '',
    avatarUrl: '',
    gender: 0,
    province: '',
    city: '',
    country: '',
    userId: 0,
    roleId: 0,
    isNew: true,
  } as GetUserInfoRes,

  authSetting: {
    userInfo: false,
  },

  setUserInfo(userInfo: any) {
    this.userInfo = userInfo
  },

  setWeChatAuthSetting(authSetting: AuthSetting) {
    this.authSetting = authSetting
  },

  get isLogon() {
    return this.userInfo && !this.userInfo.isNew
  },
}

export type UserStore = typeof store

export const userStore = observable(store)
