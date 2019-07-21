import { inject as mobxInject, observer as mobxObserver } from '@tarojs/mobx'
import { Component as TaroComponent, Config as TaroConfig } from '@tarojs/taro'
import { Store } from '../../store'
import { path } from '../../util/path'

export const inject = mobxInject
export const observer = mobxObserver

export type Config = TaroConfig & {
  shareTitle?: string
  shareUrl?: string
}

@inject('userStore')
export class Component<Props = {}, State = {}> extends TaroComponent<
  Props & Store,
  State
> {
  constructor(props?: any) {
    super(props)
  }

  get userStore(): Store['userStore'] {
    try {
      return this.props.userStore
    } catch (err) {
      throw 'Inject userStore before'
    }
  }

  get userState() {
    return this.userStore
  }

  get userId() {
    return this.userStore.userInfo.userId
  }

  onShareAppMessage() {
    const config = this.config as Config
    return {
      title: config.shareTitle || '分享页面',
      path: config.shareUrl || path.home.str(),
    }
  }
}
