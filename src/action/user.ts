import Taro from '@tarojs/taro'
import { getStore } from '../store'
import { request } from '../util/request'

const action = {
  /*
      Taro.login拿到临时code，通过后端腾讯api拿到openid
      新用户时接口GetUserInfo返回一条初始记录，设置authSetting userInfo为false 并弹出授权button并通过接口UpdateUserInfo更新用户数据到后端
     */
  async login() {
    const store = getStore('userStore')
    const res = await Taro.login()
    if (res.code) {
      const userInfoRes = await request('getUserInfo', { code: res.code })
      if (userInfoRes) {
        store.setUserInfo(userInfoRes)
      } else {
        store.setIsNew(true)
        store.setUserInfoAuthSetting(false)
      }
    } else {
      throw new Error('Wechat login failed')
    }
  },

  updateWechatAuthSetting() {
    const store = getStore('userStore')
    return Taro.getSetting().then(settingRes => {
      return store.setWeChatAuthSetting({
        userInfo: settingRes.authSetting['scope.userInfo'],
      })
    })
  },

  updateUserInfo() {
    // const store = getStore("userStore")
    // if (store.authSetting.userInfo) {
    //   Taro.getUserInfo().then((userInfoRes) => {
    //     const { nickName, avatarUrl, gender } = userInfoRes.userInfo
    //     const { id, self_introduction } = store.userInfo
    //     UpdateUserInfo({
    //       id,
    //       nickname: nickName,
    //       avatar: avatarUrl,
    //       self_introduction,
    //       gender: Number(gender)
    //     }).then((updateRes) => {
    //       if (updateRes && updateRes.user_info) {
    //         store.setUserInfo(updateRes.user_info)
    //         store.setIsNew(false)
    //       }
    //     })
    //   })
    // }
  },

  checkAndUpdateUserInfo() {
    this.updateWechatAuthSetting().then(res => {
      this.updateUserInfo()
    })
  },
}

export const UserAction = action
