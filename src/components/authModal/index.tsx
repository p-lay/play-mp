import Taro from '@tarojs/taro'
import { AtCurtain, AtButton } from 'taro-ui'
import { observer, inject } from '../../util/component'
import { AuthModalStore } from '../../store/authModal'
import { UserAction } from '../../action/user'
import { config } from '../../config'
import { View } from '@tarojs/components'

type Props = {
  allowClose?: boolean
  authModalStore?: AuthModalStore
}

@inject('authModalStore')
@observer
export class AuthModal extends Taro.Component<Props> {
  get isUserInfoVisible() {
    return this.props.authModalStore.isUserInfoVisible
  }

  onClose = () => {
    const { allowClose, authModalStore } = this.props
    if (allowClose) {
      authModalStore.closeUserInfo()
    }
  }

  onGetUserInfo() {
    UserAction.checkAndUpdateUserInfo()
  }

  render() {
    if (config.isWechatBuild) {
      return (
        <AtCurtain isOpened={this.isUserInfoVisible} onClose={this.onClose}>
          <AtButton
            onGetUserInfo={this.onGetUserInfo}
            openType="getUserInfo"
            className="user-info-auth-button"
            type="primary"
          >
            授权
          </AtButton>
        </AtCurtain>
      )
    } else {
      return <View />
    }
  }
}
