import './list.scss'
import Taro from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'

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
        {memorias.map(x => {
          return (
            <View
              onClick={this.onMemoriaClick.bind(this, x.id)}
              className="memoria"
            >
              {x.title}
            </View>
          )
        })}

        <Button
          size="mini"
          onClick={this.onCreateMemoria}
          className="createMemoria"
        >
          Create memoria
        </Button>
      </View>
    )
  }
}

export default MemoriaList
