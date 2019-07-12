import './update.scss'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { request } from '../../util/request'
import { path } from '../../util/path'

type Props = {}

// add and edit => BaseVue & Partial<VueAppendInfo>
type State = {} & BaseVue & Partial<VueAppendInfo>

@inject('counterStore')
@observer
class MemoriaDetail extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memoria',
  }

  state: State = {
    resources: [],
  } as any

  async onEdit() {
    path.memoria.update.navigate()
  }

  componentDidMount() {
    request('getVue', { vue_id: this.$router.params.id }).then(res => {
      this.setState({
        title: res.title,
        feeling: res.feeling,
        resources: res.resources,
      })
    })
  }

  render() {
    const { title, feeling, resources } = this.state
    return (
      <View className="vueUpdate">
        <Text>标题</Text>
        <View className="title">{title}</View>
        <Text>想法</Text>
        <View className="feeling">{feeling}</View>
        <View className="photoContainer">
          {resources.map(x => {
            return <Image src={x.url} className="photo" />
          })}
        </View>
        <Button onClick={this.onEdit}>Edit</Button>
      </View>
    )
  }
}

export default MemoriaDetail
