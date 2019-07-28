import './update.scss'
import Taro from '@tarojs/taro'
import { View, Text, Input, Textarea, Video } from '@tarojs/components'
import { request } from '../../util/request'
import { uploadFiles } from '../../util/qiniu'
import { Component, Config, observer } from '../util/component'
import { path } from '../../util/path'
import { AtCalendar, AtImagePicker, AtButton, AtSwitch } from 'taro-ui'
import { getStrictDisplayTime, getUnix } from '../../util/dayjs'

type ResourceFiles = {
  url: string
}[]

type Props = {}

type State = {
  selectDate: string
  isCalendarVisible: boolean
  existResources: BaseResource[]
  newImageFiles: ResourceFiles
  existImageFiles: ResourceFiles
  newVideoFiles: ResourceFiles
  existVideoFiles: ResourceFiles
} & BaseMemoria &
  Partial<MemoriaAppendInfo>

@observer
class MemoriaUpdate extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'create & edit',
  }

  state: State = {
    selectDate: getStrictDisplayTime(),
    newImageFiles: [],
    existImageFiles: [],
    newVideoFiles: [],
    existVideoFiles: [],
  } as any

  get memoriaId() {
    return this.$router.params.id
  }

  get isEditPage() {
    return !!this.memoriaId
  }
  get isEditPageFromDetail() {
    return !!this.memoriaId && this.$router.params.from == 'detail'
  }

  onTitleChange(event: any) {
    this.setState({
      title: event.detail.value,
    })
  }

  onFeelingChange(event: any) {
    this.setState({
      feeling: event.detail.value,
    })
  }

  onAddVideo = async () => {
    const res = await Taro.chooseVideo()
    this.setState(prevState => ({
      newVideoFiles: prevState.newVideoFiles.concat({ url: res.tempFilePath }),
    }))
  }

  onSelectDate = ({ value }) => {
    this.setState({
      selectDate: value.start,
      isCalendarVisible: false,
    })
  }

  onShowCalendar() {
    this.setState({
      isCalendarVisible: true,
    })
  }

  onRemoveExistImage = (
    existImageFiles: any[],
    operationType: string,
    index: number,
  ) => {
    this.setState({ existImageFiles })
  }

  onImagePickerChange = (
    newImageFiles: any[],
    operationType: string,
    index: number,
  ) => {
    this.setState({
      newImageFiles,
    })
  }

  onExistVideoRemove(index: number) {
    this.setState(prevState => ({
      existVideoFiles: prevState.existVideoFiles.filter((x, i) => i != index),
    }))
  }

  onVideoRemove(index: number) {
    this.setState(prevState => ({
      newVideoFiles: prevState.newVideoFiles.filter((x, i) => i != index),
    }))
  }

  onLargeDataFlagChange = () => {
    this.setState(prevState => ({
      isLargeData: !prevState.isLargeData,
    }))
  }

  onSave = async () => {
    const {
      title,
      feeling,
      selectDate,
      existResources,
      newImageFiles,
      existImageFiles,
      newVideoFiles,
      existVideoFiles,
      isLargeData,
    } = this.state
    const resource = newImageFiles.concat(newVideoFiles)
    const uploadResult = await uploadFiles(resource.map(x => x.url))
    if (uploadResult.filter(x => !!x.uploadedUrl).length != resource.length) {
      return
    }

    const resources = uploadResult.map((x, index) => {
      const result: BaseResource = {
        url: x.uploadedUrl,
        type: 'image',
      }
      if (index >= newImageFiles.length) {
        result.type = 'video'
      }
      return result
    })
    let thumb = ''
    if (this.isEditPage) {
      const existResourceUrls = existImageFiles
        .concat(existVideoFiles)
        .map(x => x.url)
      const resultExistResources = existResources.filter(x =>
        existResourceUrls.includes(x.url),
      )
      const firstExistImage = resultExistResources.find(x => x.type == 'image')
      if (firstExistImage) {
        thumb = firstExistImage.url
      } else if (resources.length) {
        const image = (resources.find(x => x.type == 'image') ||
          {}) as BaseResource
        thumb = image.url
      }

      await request('updateMemoria', {
        id: this.memoriaId,
        title,
        feeling,
        resources,
        tags: [],
        create_time: getUnix(selectDate),
        existResourceIds: resultExistResources.map(x => x.id),
        thumb,
        isLargeData,
      })
    } else {
      if (resources.length) {
        const image = (resources.find(x => x.type == 'image') ||
          {}) as BaseResource
        thumb = image.url
      }
      await request('addMemoria', {
        user_id: this.userId,
        title,
        feeling,
        resources,
        tags: [],
        create_time: getUnix(selectDate),
        thumb,
        isLargeData,
      })
    }
    path.home.redirect()
  }

  async componentDidMount() {
    let state = null
    if (this.isEditPageFromDetail) {
      state = this.memoriaState.res as State
    } else if (this.isEditPage) {
      const res = await request('getMemoria', {
        id: this.memoriaId,
      })
      state = res
    }

    state.selectDate = getStrictDisplayTime(state.create_time)
    state.existResources = state.resources
    state.existImageFiles = state.resources
      .filter(x => x.type == 'image')
      .map(x => ({ url: x.url }))
    state.existVideoFiles = state.resources
      .filter(x => x.type == 'video')
      .map(x => ({ url: x.url }))
    this.setState(state)
  }

  render() {
    const {
      title,
      feeling,
      newImageFiles,
      existImageFiles,
      newVideoFiles,
      existVideoFiles,
      selectDate,
      isCalendarVisible,
      isLargeData,
    } = this.state

    return (
      <View className="memoriaUpdate">
        <Text>标题</Text>
        <Input
          onInput={this.onTitleChange}
          value={title}
          className="title update"
        />
        <Text>想法</Text>
        <Textarea
          onInput={this.onFeelingChange}
          value={feeling}
          className="feeling update"
        />

        <View className="dateDisplay" onClick={this.onShowCalendar}>
          <View className="at-icon at-icon-calendar"></View>
          {selectDate}
        </View>
        {isCalendarVisible && (
          <AtCalendar
            onSelectDate={this.onSelectDate}
            currentDate={selectDate}
          />
        )}

        <AtSwitch
          title="多图预警"
          checked={isLargeData}
          onChange={this.onLargeDataFlagChange}
          border={false}
        ></AtSwitch>

        <View className="photoContainer">
          {this.isEditPage && (
            <AtImagePicker
              files={existImageFiles}
              onChange={this.onRemoveExistImage}
              showAddBtn={false}
            />
          )}
          <AtImagePicker
            multiple
            files={newImageFiles}
            onChange={this.onImagePickerChange}
          />
          {this.isEditPage && (
            <View className="videoContainer">
              {existVideoFiles.map((x, index) => {
                return (
                  <View className="video">
                    <View
                      className="at-icon at-icon-subtract-circle icon"
                      onClick={this.onExistVideoRemove.bind(this, index)}
                    ></View>
                    <Video
                      src={x.url}
                      className="resource"
                      showCenterPlayBtn={false}
                      showPlayBtn={false}
                    />
                  </View>
                )
              })}
            </View>
          )}
          <View className="videoContainer">
            {newVideoFiles.map((x, index) => {
              return (
                <View className="video">
                  <View
                    className="at-icon at-icon-subtract-circle icon"
                    onClick={this.onVideoRemove.bind(this, index)}
                  ></View>
                  <Video
                    src={x.url}
                    className="resource"
                    showCenterPlayBtn={false}
                    showPlayBtn={false}
                  />
                </View>
              )
            })}
          </View>
        </View>

        <View
          className="at-icon at-icon-file-video"
          onClick={this.onAddVideo}
        ></View>

        <View className="saveBtn">
          <AtButton onClick={this.onSave} type="primary">
            Save
          </AtButton>
        </View>
      </View>
    )
  }
}

export default MemoriaUpdate
