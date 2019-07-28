import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AtCard, AtButton } from 'taro-ui'
import '../memoria/list.scss'

type Props = {}

type State = {
  memorias: SearchMemoriaRes['memorias']
}

@observer
class Individual extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memorias',
    enablePullDownRefresh: true,
  }

  state: State = {
    memorias: [],
  }

  onMemoriaClick(id: number) {
    path.memoria.detail.navigate({
      id,
    })
  }

  onGoTagManagement = () => {
    path.tagManagement.redirect()
  }

  async fetchData() {
    await request('searchMemoria', {
      create_by: this.userId,
    }).then(res => {
      this.setState({
        memorias: res.memorias,
      })
    })
  }

  async onPullDownRefresh() {
    Taro.showLoading({
      title: '加载中...',
    })
    await this.fetchData()
    Taro.stopPullDownRefresh()
    Taro.hideLoading()
  }

  componentDidMount() {
    this.fetchData()
  }

  render() {
    const { memorias } = this.state
    return (
      <View className="memorias">
        <View
          style={{
            marginLeft: '20rpx',
          }}
        >
          <AtButton
            onClick={this.onGoTagManagement}
            className="tagManagementBtn"
            size="small"
            type="primary"
          >
            标签管理
          </AtButton>
          <View>个人中心:</View>
        </View>

        {memorias.map(x => {
          return (
            <AtCard
              title={x.title}
              onClick={this.onMemoriaClick.bind(this, x.id)}
              className="memoriaCard"
            >
              <View className="cardContent">
                <Image src={x.thumb} className="image" mode="aspectFill" />
                <View className="feeling">{x.feeling}</View>
              </View>
            </AtCard>
          )
        })}
      </View>
    )
  }
}

export default Individual
