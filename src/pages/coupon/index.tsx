import './index.scss'
import Taro from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { request } from '../../util/request'
import { Component, Config, observer } from '../util/component'
import { AtInput } from 'taro-ui'

type Props = {}

type State = {
  md5Str: string
  message: string
}

@observer
class Coupon extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: '屁蕾券券',
  }

  onMd5InputChange = (md5Str: string) => {
    this.setState({
      md5Str,
    })
  }

  onGetMessage = async () => {
    const { md5Str } = this.state
    const res = await request('decryptCoupon', { md5: md5Str })
    if (!res.decryptFailed && res.message) {
      this.setState({
        message: res.message,
      })
    } else {
      this.setState({
        message: '兑换失败',
      })
    }
  }

  render() {
    const { md5Str, message } = this.state
    return (
      <View className="coupon">
        输入兑换码兑换
        <View className="inputItem">
          <AtInput
            name="md5Input"
            onChange={this.onMd5InputChange}
            value={md5Str}
          />
        </View>
        <Button onClick={this.onGetMessage}>兑换</Button>
        <View>{message}</View>
      </View>
    )
  }
}

export default Coupon
