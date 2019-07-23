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
    const authModalStore = getStore('authModalStore')
    const res = await Taro.login()
    if (res.code) {
      const userInfoRes = await request('getUserInfo', { code: res.code })
      store.setUserInfo(userInfoRes)
      if (userInfoRes.isNew) {
        authModalStore.openUserInfo()
      }
    } else {
      throw new Error('Wechat login failed')
    }
  },

  async updateWechatAuthSetting() {
    const store = getStore('userStore')
    const settingRes = await Taro.getSetting()
    await store.setWeChatAuthSetting({
      userInfo: settingRes.authSetting['scope.userInfo'],
    })
  },

  async updateUserInfo() {
    const store = getStore('userStore')
    if (store.authSetting.userInfo) {
      const res = await Taro.getUserInfo()
      const wechatUserInfo = res.userInfo as UserInfo
      const { userId } = store.userInfo
      const userInfo = { userId, ...wechatUserInfo }
      await request('updateUserInfo', userInfo)
      const authModalStore = getStore('authModalStore')
      store.setUserInfo(userInfo)
      authModalStore.closeUserInfo()
    }
  },

  async checkAndUpdateUserInfo() {
    await this.updateWechatAuthSetting()
    await this.updateUserInfo()
  },
}

export const UserAction = action
