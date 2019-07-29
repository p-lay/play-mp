import './update.scss'
import Taro from '@tarojs/taro'
import { View, Text, Image, Video } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AuthModal } from '../../components/authModal'
import { getDisplayTime } from '../../util/dayjs'
import { AtFab } from 'taro-ui'

type Props = {}

type State = {
  createTime: string
  isActionVisible: boolean
} & BaseMemoria &
  Partial<MemoriaAppendInfo>

@observer
class MemoriaDetail extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memoria',
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

  videoContext: Taro.VideoContext = null
  onVideoPlay = (id: string) => {
    this.videoContext = Taro.createVideoContext(id, this)
    this.videoContext.requestFullScreen({ direction: 0 })
  }

  onVideoFullscreenChange = ({ detail }) => {
    const { fullScreen } = detail
    if (!fullScreen) {
      this.videoContext.pause()
    }
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

  componentWillUnmount() {
    this.videoContext = null
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
      <View className="memoriaUpdate">
        <AuthModal />

        <View className="title">{title}</View>

        <View className="feeling">{feeling}</View>

        <View className="tagDisplay at-icon at-icon-tag">
          <Text className="text">{tags.map(x => x.name).join(',')}</Text>
        </View>

        <View className="time">{`时间: ${createTime}`}</View>

        <View className="photoContainer">
          {resources.map(x => {
            const isVideo = x.type == 'video'
            const idStr = x.id.toString()
            return (
              <View>
                {isVideo && (
                  <Video
                    src={x.url}
                    enableDanmu={true}
                    danmuBtn={true}
                    id={idStr}
                    onPlay={this.onVideoPlay.bind(this, idStr)}
                    playBtnPosition="center"
                    onFullscreenChange={this.onVideoFullscreenChange}
                  />
                )}
                {!isVideo && (
                  <Image src={x.url} className="photo" mode="aspectFill" />
                )}
              </View>
            )
          })}
        </View>
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
