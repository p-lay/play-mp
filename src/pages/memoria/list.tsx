import './list.scss'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AuthModal } from '../../components/authModal/index'
import { AtButton, AtCard } from 'taro-ui'

type Props = {}

type State = {
  memorias: GetMemoriaListRes['memorias']
}

@observer
class MemoriaList extends Component<Props, State> {
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

  onCreateMemoria() {
    path.memoria.update.navigate()
  }

  onGoIndividual() {
    path.individual.navigate()
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
    const { memorias } = this.state
    return (
      <View className="memorias">
        <AuthModal allowClose />
        {memorias.map(x => {
          return (
            <AtCard
              note="小Tips"
              title={x.title}
              onClick={this.onMemoriaClick.bind(this, x.id)}
              className="memoriaCard"
            >
              这也是内容区 可以随意定义功能
            </AtCard>
          )
        })}

        <AtButton
          type="primary"
          size="small"
          onClick={this.onCreateMemoria}
          className="memoriaActionBtn"
        >
          创建 Memoria
        </AtButton>
        <AtButton
          type="primary"
          size="small"
          onClick={this.onGoIndividual}
          className="memoriaActionBtn"
        >
          个人页
        </AtButton>
      </View>
    )
  }
}

export default MemoriaList
