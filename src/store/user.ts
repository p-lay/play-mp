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
  } as GetUserInfoRes,

  isNew: false,

  authSetting: {
    userInfo: true,
  },

  setUserInfo(userInfo: any) {
    this.userInfo = userInfo
    console.log(`user info init ${JSON.stringify(userInfo)}`)
  },

  setWeChatAuthSetting(authSetting: AuthSetting) {
    this.authSetting = authSetting
  },

  setUserInfoAuthSetting(userInfo: boolean) {
    this.authSetting.userInfo = userInfo
  },

  setIsNew(isNew: boolean) {
    this.isNew = isNew
  },

  get isUserInfoAuthed() {
    return this.authSetting.userInfo
  },
}

export type UserStore = typeof store

export default observable(store)
