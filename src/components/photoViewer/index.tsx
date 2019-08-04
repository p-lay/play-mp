import './index.scss'
import Taro from '@tarojs/taro'
import { View, Video, Image, Swiper, SwiperItem } from '@tarojs/components'
import { Component, observer } from '@p/util/component'

type Props = {
  photos: BaseResource[]
}

type State = {
  isFullscreen: boolean
  viewIndex: number
}

@observer
export class PhotoViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isFullscreen: false,
      viewIndex: 0,
    }
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

  onPhotoView = (index: number) => {
    this.setState({
      isFullscreen: true,
      viewIndex: index,
    })
  }

  onCancelView = () => {
    this.setState({
      isFullscreen: false,
    })
  }

  componentWillUnmount() {
    this.videoContext = null
  }

  render() {
    const { photos = [] } = this.props
    const { isFullscreen, viewIndex } = this.state
    return (
      <View className="photoViewer">
        <View className={`fullscreen ${isFullscreen && 'visible'}`}>
          <Swiper onClick={this.onCancelView} current={viewIndex}>
            {photos.map(x => {
              const isVideo = x.type == 'video'
              const idStr = x.id.toString()
              return (
                <SwiperItem>
                  {isVideo && (
                    <Video
                      src={x.url}
                      enableDanmu={true}
                      danmuBtn={true}
                      id={idStr}
                      onPlay={this.onVideoPlay.bind(this, idStr)}
                      playBtnPosition="center"
                      onFullscreenChange={this.onVideoFullscreenChange}
                      className="resource"
                    />
                  )}
                  {!isVideo && (
                    <Image src={x.url} className="resource" mode="aspectFit" />
                  )}
                </SwiperItem>
              )
            })}
          </Swiper>
        </View>

        <View className="preview">
          {photos.map((x, index) => {
            const isVideo = x.type == 'video'
            const idStr = x.id.toString()
            return (
              <View
                className="photoItem"
                onClick={this.onPhotoView.bind(this, index)}
              >
                {isVideo && (
                  <Video
                    src={x.url}
                    enableDanmu={true}
                    danmuBtn={true}
                    id={idStr}
                    onPlay={this.onVideoPlay.bind(this, idStr)}
                    playBtnPosition="center"
                    onFullscreenChange={this.onVideoFullscreenChange}
                    className="resource"
                  />
                )}
                {!isVideo && (
                  <Image src={x.url} className="resource" mode="aspectFill" />
                )}
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}
