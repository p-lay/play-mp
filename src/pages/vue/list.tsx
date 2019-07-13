import './list.scss'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { request } from '../../util/request'
import { path } from '../../util/path'

type Props = {}

type State = {
  memorias: GetMemoriaListRes['memorias']
}

@inject('counterStore')
@observer
class MemoriaList extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memorias',
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

  componentDidMount() {
    request('getMemoriaList', {}).then(res => {
      this.setState({
        memorias: res.memorias,
      })
    })
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

        <Button size='mini' onClick={this.onCreateMemoria} className='createMemoria'>Create memoria</Button>
      </View>
    )
  }
}

export default MemoriaList
