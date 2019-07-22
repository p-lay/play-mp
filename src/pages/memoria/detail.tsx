import './update.scss'
import Taro from '@tarojs/taro'
import { View, Text, Image, Video } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AuthModal } from '../../components/authModal'
import { getDisplayTime } from '../../util/dayjs'
import { AtButton } from 'taro-ui'

type Props = {}

type State = {
  createTime: string
} & BaseMemoria &
  Partial<MemoriaAppendInfo>

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

  onEdit = () => {
    path.memoria.update.navigate({
      id: this.memoriaId,
      action: 'edit',
    })
  }

  onDelete = async () => {
    await request('deleteMemoria', {
      id: this.memoriaId,
    })
    path.home.redirect()
  }

  componentDidMount() {
    request('getMemoria', { id: this.memoriaId }).then(res => {
      this.memoriaStore.setRes(res)
      this.setState({
        title: res.title,
        feeling: res.feeling,
        resources: res.resources,
        createTime: getDisplayTime(res.create_time),
        create_by: res.create_by
      })
    })
  }

  render() {
    const { title, feeling, resources, createTime, create_by } = this.state
    return (
      <View className="memoriaUpdate">
        <AuthModal />
        <Text>标题</Text>
        <View className="title">{title}</View>
        <Text>想法</Text>
        <View className="feeling">{feeling}</View>
        <View>{`时间: ${createTime}`}</View>
        <View className="photoContainer">
          {resources.map(x => {
            const isVideo = x.type == 'video'
            return (
              <View>
                {isVideo && <Video src={x.url} />}
                {!isVideo && (
                  <Image src={x.url} className="photo" mode="aspectFill" />
                )}
              </View>
            )
          })}
        </View>
        {create_by == this.userId && (
          <AtButton onClick={this.onEdit} type="primary" size='small'>
            Edit
          </AtButton>
        )}
        {create_by == this.userId && (
          <AtButton onClick={this.onDelete} type="primary" size='small'>
            Delete
          </AtButton>
        )}
      </View>
    )
  }
}

export default MemoriaDetail
