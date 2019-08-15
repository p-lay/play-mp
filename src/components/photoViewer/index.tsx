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

  static defaultProps = {
    photos: [],
  }

  onVideoPlay = (idStr: string) => {
    this.videoContext = Taro.createVideoContext(idStr, this)
  }

  onVideoFullscreenChange = ({ detail }) => {
    console.log('on fullscreen')
    // const { fullScreen } = detail
    // if (!fullScreen) {
    //   this.videoContext.pause()
    // }
  }

  videoContext: Taro.VideoContext = null
  onOpenView = (photo: BaseResource, index: number) => {
    this.setState(
      {
        isFullscreen: true,
        viewIndex: index,
      },
      () => {
        if (photo.type == 'video') {
          this.videoContext = Taro.createVideoContext(photo.id.toString(), this)
          this.videoContext.play()
        }
      },
    )
  }

  onCloseView = () => {
    const { photos } = this.props
    const { viewIndex } = this.state
    const current = photos.find((x, index) => index == viewIndex)
    if (current.type == 'video') {
      this.videoContext && this.videoContext.pause()
    }
    this.setState({
      isFullscreen: false,
    })
  }

  onViewChange = ({ detail }) => {
    this.setState({
      viewIndex: detail.current,
    })

    this.videoContext && this.videoContext.pause()
  }

  render() {
    const { photos } = this.props
    const { isFullscreen, viewIndex } = this.state
    return (
      <View className="photoViewer">
        {isFullscreen && (
          <View className="closeBtn" onClick={this.onCloseView} />
        )}
        <View className={`fullscreen ${isFullscreen && 'visible'}`}>
          <Swiper current={viewIndex} onChange={this.onViewChange} duration={200}>
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
            return (
              <View
                className="photoItem"
                onClick={this.onOpenView.bind(this, x, index)}
              >
                {isVideo && (
                  <Video
                    src={x.url}
                    className="resource previewVideo"
                    showFullscreenBtn={false}
                    showPlayBtn={false}
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
