import './index.scss'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { request } from '@u/request'
import { path } from '@u/path'
import { Component, Config, observer } from '../../util/component'
import { AuthModal } from '@c/authModal'
import { getDisplayTime } from '@u/dayjs'
import { AtFab } from 'taro-ui'
import PhotoViewer from '@c/photoViewer/index'

type Props = {}

type State = {
  createTime: string
  isActionVisible: boolean
} & BaseMemoria &
  Partial<MemoriaAppendInfo>

@observer
class MemoriaDetail extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: '相册',
  }

  state: State = {
    resources: [],
    tags: [],
    isActionVisible: false,
  } as any

  get memoriaId() {
    return this.$router.params.id
  }

  onEdit = () => {
    this.setState({
      isActionVisible: false,
    })
    path.memoria.update.navigate({
      id: this.memoriaId,
      from: 'detail',
    })
  }

  onDelete = async () => {
    await request('deleteMemoria', {
      id: this.memoriaId,
    })
    path.home.redirect()
  }

  onFabClick = () => {
    this.setState(prev => ({
      isActionVisible: !prev.isActionVisible,
    }))
  }

  componentDidMount() {
    request('getMemoria', { id: this.memoriaId }).then(res => {
      this.memoriaStore.setRes(res)
      this.config.shareTitle = res.title
      this.config.shareUrl = path.memoria.detail.str({ id: this.memoriaId })
      this.setState({
        title: res.title,
        feeling: res.feeling,
        resources: res.resources,
        createTime: getDisplayTime(res.create_time),
        create_by: res.create_by,
        isLargeData: res.isLargeData,
        tags: res.tags,
      })
    })
  }

  render() {
    const {
      title,
      feeling,
      resources,
      createTime,
      create_by,
      isActionVisible,
      tags,
    } = this.state
    return (
      <View className="memoriaDetail">
        <AuthModal />

        <View className="title">{title}</View>

        <View className="feeling">{feeling}</View>

        <View className="tagDisplay at-icon at-icon-tag">
          <Text className="text">{tags.map(x => x.name).join(',')}</Text>
        </View>

        <View className="time at-icon at-icon-calendar">
          <Text className="text">{createTime}</Text>
        </View>

        <View className="at-fab__icon at-icon at-icon-image"></View>
        {resources.length && (
          <PhotoViewer photos={resources} defaultOpenIndex={0} />
        )}

        {create_by == this.userId && (
          <View className="fabBtn">
            <AtFab onClick={this.onFabClick}>
              <Text className="at-fab__icon at-icon at-icon-menu"></Text>
            </AtFab>
          </View>
        )}
        {isActionVisible && (
          <View className="fabBtn topBtn">
            <AtFab onClick={this.onEdit}>
              <Text className="at-fab__icon at-icon at-icon-edit"></Text>
            </AtFab>
          </View>
        )}
        {isActionVisible && (
          <View className="fabBtn leftBtn">
            <AtFab onClick={this.onDelete}>
              <Text className="at-fab__icon at-icon at-icon-trash"></Text>
            </AtFab>
          </View>
        )}
      </View>
    )
  }
}

export default MemoriaDetail
