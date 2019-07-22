import './update.scss'
import Taro from '@tarojs/taro'
import {
  View,
  Button,
  Text,
  Input,
  Textarea,
  Image,
  Video,
} from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AuthModal } from '../../components/authModal'

type Props = {}

type State = {} & BaseMemoria & Partial<MemoriaAppendInfo>

@observer
class MemoriaDetail extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memoria',
  }

  state: State = {
    resources: [],
  } as any

  get memoriaId() {
    return this.$router.params.id
  }

  async onEdit() {
    path.memoria.update.navigate({
      id: this.memoriaId,
      action: 'edit',
    })
  }

  async onDelete() {
    await request('deleteMemoria', {
      id: this.memoriaId,
    })
    path.home.redirect()
  }

  componentDidMount() {
    request('getMemoria', { id: this.memoriaId }).then(res => {
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
      <View className="memoriaUpdate">
        <AuthModal />
        <Text>标题</Text>
        <View className="title">{title}</View>
        <Text>想法</Text>
        <View className="feeling">{feeling}</View>
        <View className="photoContainer">
          {resources.map(x => {
            const isVideo = x.type == 'video'
            return (
              <View>
                {isVideo && <Video src={x.url} />}
                {!isVideo && <Image src={x.url} className="photo" />}
              </View>
            )
          })}
        </View>
        <Button onClick={this.onEdit}>Edit</Button>
        <Button onClick={this.onDelete}>Delete</Button>
      </View>
    )
  }
}

export default MemoriaDetail
