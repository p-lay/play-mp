import './index.scss'
import Taro from '@tarojs/taro'
import { View, Video, Image, Swiper, SwiperItem } from '@tarojs/components'
import { Component, observer } from '@p/util/component'
import { AtIcon } from 'taro-ui'

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
    const { photos } = this.props
    this.setState({
      viewIndex: detail.current,
    })

    this.videoContext && this.videoContext.pause()

    const current = photos.find((x, index) => index == detail.current)
    if (current.type == 'video') {
      this.videoContext = Taro.createVideoContext(current.id.toString(), this)
      this.videoContext.play()
    }
  }

  render() {
    const { photos } = this.props
    const { isFullscreen, viewIndex } = this.state
    return (
      <View className="photoViewer">
        {isFullscreen && (
          <View className="closeBtn" onClick={this.onCloseView} />
        )}
        {isFullscreen && (
          <View className="fullscreen">
            <Swiper
              current={viewIndex}
              onChange={this.onViewChange}
              duration={200}
            >
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
                        playBtnPosition="center"
                        className="resource"
                        autoplay={false}
                      />
                    )}
                    {!isVideo && (
                      <Image
                        src={x.url}
                        className="resource"
                        mode="aspectFit"
                      />
                    )}
                  </SwiperItem>
                )
              })}
            </Swiper>
          </View>
        )}

        <View className="preview">
          {photos.map((x, index) => {
            const isVideo = x.type == 'video'
            return (
              <View
                className="photoItem"
                onClick={this.onOpenView.bind(this, x, index)}
              >
                <Image src={x.thumb} className="resource" mode="aspectFill" />
                {isVideo && (
                  <View className="resource previewVideo">
                    <AtIcon value="play" size={40} />
                    {x.duration}s
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}
