import './index.scss'
import Taro from '@tarojs/taro'
import { View, Video, Image, Swiper, SwiperItem } from '@tarojs/components'
import { Component, observer } from '@p/util/component'
import { AtIcon } from 'taro-ui'
import { debounce } from 'lodash'
import cns from 'classnames'

type Props = {
  photos: BaseResource[]
  defaultOpenIndex?: number
}

type State = {
  isFullscreen: boolean
  viewIndex: number
  isDownloading: boolean
}

@observer
class PhotoViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isFullscreen: false,
      viewIndex: 0,
      isDownloading: false,
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

  startTouchedClientY = 0
  endTouchedClientY = 0
  onSwiperTouchMove = debounce(() => {
    const value = this.endTouchedClientY - this.startTouchedClientY
    if (value < -50) {
      // 上滑
      Taro.navigateBack()
    } else if (value > 50) {
      this.onCloseView()
    }
    this.startTouchedClientY = 0
    this.endTouchedClientY = 0
  }, 200)

  onSwiperTouchStart = event => {
    this.startTouchedClientY = event.changedTouches[0].clientY
  }

  onSwiperTouchEnd = event => {
    this.endTouchedClientY = event.changedTouches[0].clientY
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

  onDownloadFile = () => {
    this.setState({
      isDownloading: true,
    })
    const { photos } = this.props
    const { viewIndex } = this.state
    const current = photos.find((x, index) => index == viewIndex)
    Taro.downloadFile({
      url: current.url,
      success: res => {
        if (current.type === 'video') {
          Taro.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              Taro.showToast({ title: '下载成功' })
            },
          } as any)
        } else {
          Taro.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              Taro.showToast({ title: '下载成功' })
            },
          } as any)
        }
        this.setState({
          isDownloading: false,
        })
      },
      fail: err => {
        Taro.showToast({ title: '下载失败' })
        this.setState({
          isDownloading: false,
        })
      },
    })
  }

  componentDidMount() {
    const { defaultOpenIndex, photos } = this.props
    if (defaultOpenIndex != null) {
      setTimeout(() => {
        const currentPhoto = photos[defaultOpenIndex]
        this.onOpenView(currentPhoto, defaultOpenIndex)
      })
    }
  }

  render() {
    const { photos } = this.props
    const { isFullscreen, viewIndex, isDownloading } = this.state
    return (
      <View className="photoViewer">
        {isFullscreen && <View className="closeBtn">上下滑动关闭</View>}
        {isFullscreen && (
          <View
            className={cns('downloadBtn', {
              loading: isDownloading,
            })}
            onClick={this.onDownloadFile}
          >
            <AtIcon value={isDownloading ? 'loading' : 'download'} size={30} />
          </View>
        )}
        {isFullscreen && (
          <View className="fullscreen">
            <Swiper
              current={viewIndex}
              onChange={this.onViewChange}
              duration={200}
              onTouchStart={this.onSwiperTouchStart}
              onTouchEnd={this.onSwiperTouchEnd}
              onTouchMove={this.onSwiperTouchMove}
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
                        danmuBtn={false}
                        id={idStr}
                        playBtnPosition="center"
                        className="resource"
                        autoplay={false}
                        showFullscreenBtn={false}
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

export default PhotoViewer
