import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtCurtain, AtButton } from 'taro-ui'
import { Component, observer, inject } from '../../pages/util/component'
import { AuthModalStore } from '../../store/authModal'

type Props = {
  allowClose?: boolean
  authModalStore?: AuthModalStore
}

@inject('authModalStore')
@observer
export class AuthModal extends Component<Props> {
  get isUserInfoVisible() {
    return this.props.authModalStore.isUserInfoVisible
  }

  onClose = () => {
    const { allowClose, authModalStore } = this.props
    if (allowClose) {
      authModalStore.closeUserInfo()
    }
  }

  render() {
    return (
      <AtCurtain isOpened={this.isUserInfoVisible} onClose={this.onClose}>
        <View>Test</View>
      </AtCurtain>
    )
  }
}
