import './list.scss'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AuthModal } from '../../components/authModal/index'
import { AtCard, AtFab } from 'taro-ui'

type Props = {}

type State = {
  memorias: GetMemoriaListRes['memorias']
  isActionVisible: boolean
}

@observer
class MemoriaList extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memorias',
    enablePullDownRefresh: true,
  }

  state: State = {
    memorias: [],
    isActionVisible: false,
  }

  onMemoriaClick(id: number) {
    path.memoria.detail.navigate({
      id,
    })
  }

  onGoCreateMemoria = () => {
    this.setState({
      isActionVisible: false,
    })
    path.memoria.update.navigate()
  }

  onGoIndividual = () => {
    this.setState({
      isActionVisible: false,
    })
    path.individual.navigate()
  }

  onFabClick = () => {
    this.setState(prev => ({
      isActionVisible: !prev.isActionVisible,
    }))
  }

  async fetchData() {
    await request('getMemoriaList', {}).then(res => {
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
    const { memorias, isActionVisible } = this.state
    return (
      <View className="memorias">
        <AuthModal allowClose />
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
        <View className="fabBtn">
          <AtFab onClick={this.onFabClick} size="small">
            <Text className="at-fab__icon at-icon at-icon-menu"></Text>
          </AtFab>
        </View>
        {isActionVisible && (
          <View className="fabBtn memoriaBtn">
            <AtFab onClick={this.onGoCreateMemoria} size="small">
              <Text className="at-fab__icon at-icon at-icon-add-circle"></Text>
            </AtFab>
          </View>
        )}
        {isActionVisible && (
          <View className="fabBtn individualBtn">
            <AtFab onClick={this.onGoIndividual} size="small">
              <Text className="at-fab__icon at-icon at-icon-user"></Text>
            </AtFab>
          </View>
        )}
      </View>
    )
  }
}

export default MemoriaList
