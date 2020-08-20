import './index.scss'
import Taro from '@tarojs/taro'
import { View, Button, Image, Text } from '@tarojs/components'
import { request } from '../../util/request'
import { Component, Config, observer } from '../util/component'
import { AtInput, AtTextarea } from 'taro-ui'

type Props = {}

type State = {
  md5InputStr: string
  msgInputStr: string
  encryptedMd5: string
  decryptedMsg: string
  createdBy: CouponUser
  usedBy: CouponUser
  useCouponMsg: string
}

@observer
class Coupon extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: '屁蕾说说',
  }

  onMd5InputChange = (md5Str: string) => {
    this.setState({
      md5InputStr: md5Str,
    })
  }

  onMessageInputChange = ({ detail }) => {
    this.setState({
      msgInputStr: detail.value,
    })
  }

  onDecrypt = async () => {
    const { md5InputStr: md5Str } = this.state
    const res = await request('decryptCoupon', { md5: md5Str })
    if (!res.decryptFailed && res.message) {
      this.setState({
        decryptedMsg: res.message,
        usedBy: res.usedBy,
        createdBy: res.createdBy,
      })
    } else {
      this.setState({
        decryptedMsg: '解密失败',
      })
    }
  }

  onEncrypt = async () => {
    const { msgInputStr } = this.state
    const res = await request('encryptCoupon', {
      message: msgInputStr,
      user_id: this.userId,
    })

    if (res.md5) {
      this.setState({
        encryptedMd5: res.md5,
      })
    } else {
      this.setState({
        encryptedMd5: '加密失败',
      })
    }
  }

  onUseCoupon = async () => {
    const { md5InputStr } = this.state
    const res = await request('useCoupon', {
      md5: md5InputStr,
      user_id: this.userId,
    })
    this.setState({
      useCouponMsg: res.useFailed
        ? '兑换失败, 请重试'
        : '兑换成功, 不可再次使用',
    })
  }

  render() {
    const {
      md5InputStr,
      decryptedMsg,
      msgInputStr,
      encryptedMd5,
      createdBy,
      usedBy,
      useCouponMsg,
    } = this.state
    return (
      <View className="coupon">
        <View className="inputItem">
          <AtInput
            name="md5Input"
            onChange={this.onMd5InputChange}
            value={md5InputStr}
            className="md5Input"
            placeholder="输入兑换码解密"
          />
        </View>
        <Button onClick={this.onDecrypt}>解密</Button>
        <View className="avatarWrapper">
          {createdBy.nickName}
          <Image className="avatar" src={createdBy.avatarUrl}></Image>
        </View>
        <View>{decryptedMsg}</View>

        {!usedBy && <Button onClick={this.onUseCoupon}>兑换使用</Button>}
        <View>{useCouponMsg}</View>
        {usedBy && (
          <View className="avatarWrapper used">
            兑换券已被{usedBy.nickName}
            <Image className="avatar" src={usedBy.avatarUrl}></Image>使用
          </View>
        )}

        <View className="inputItem marginTop">
          <AtTextarea
            value={msgInputStr}
            className="textarea"
            placeholder="输入信息加密"
            onChange={this.onMessageInputChange}
          />
        </View>
        <Button onClick={this.onEncrypt}>加密</Button>
        <View className="encryptedMd5">
          <Text selectable={true}>{encryptedMd5}</Text>
        </View>
      </View>
    )
  }
}

export default Coupon
