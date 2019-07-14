import { observable } from "mobx"

type AuthSetting = {
  userInfo: boolean
  email?: boolean
}

const store = {
  userInfo: {
    id: 0,
    role_id: 0,
    nickname: "",
    avatar: "",
    self_introduction: "",
    points: 0,
    gender: 0,
    email: "",
    status: "",
    phone_number: "",
    user_tag: []
  },

  isNew: false,

  authSetting: {
    userInfo: true,
    email: false
  },

  setUserInfo(userInfo: any) {
    this.userInfo = userInfo
    console.log(`user info init ${JSON.stringify(userInfo)}`)
  },

  setUserEmailVerification(res: any) {
    this.userInfo.status = res.status
    this.userInfo.email = res.email
  },
  setWeChatAuthSetting(authSetting: AuthSetting) {
    authSetting.email = this.authSetting.email
    this.authSetting = authSetting
  },

  setEmailAuthSetting(value: boolean) {
    this.authSetting.email = value
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
  get isEmailVerified() {
    return this.userInfo.status == "VERIFIED"
  }
}

export type UserStore = typeof store

export default observable(store)
