import './update.scss'
import Taro from '@tarojs/taro'
import { View, Text, Input, Textarea, Video } from '@tarojs/components'
import { request } from '../../util/request'
import { uploadFiles } from '../../util/qiniu'
import { Component, Config, observer } from '../util/component'
import { path } from '../../util/path'
import { AtCalendar, AtImagePicker, AtButton } from 'taro-ui'
import { getDisplayTime, getUnix } from '../util/dayjs'

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
    selectDate: getDisplayTime(),
    newImageFiles: [],
    existImageFiles: [],
    newVideoFiles: [],
    existVideoFiles: [],
  } as any

  get memoriaId() {
    return this.$router.params.id
  }

  get isEditPage() {
    return this.$router.params.action == 'edit'
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
      existVideoFiles: prevState.existVideoFiles.filter(
        (x, i) => i != index,
      ),
    }))
  }

  onVideoRemove(index: number) {
    this.setState(prevState => ({
      newVideoFiles: prevState.newVideoFiles.filter(
        (x, i) => i != index,
      ),
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
    if (this.isEditPage) {
      const existResourceUrls = existImageFiles
        .concat(existVideoFiles)
        .map(x => x.url)
      const existResourceIds = existResources
        .filter(x => existResourceUrls.includes(x.url))
        .map(x => x.id)
      await request('updateMemoria', {
        id: this.memoriaId,
        title,
        feeling,
        resources,
        tags: [],
        create_time: getUnix(selectDate),
        existResourceIds,
      })
    } else {
      await request('addMemoria', {
        user_id: this.userId,
        title,
        feeling,
        resources,
        tags: [],
        create_time: getUnix(selectDate),
      })
    }
    path.home.redirect()
  }

  componentDidMount() {
    if (this.isEditPage) {
      request('getMemoria', { id: this.memoriaId }).then(res => {
        const state = res as State
        state.selectDate = getDisplayTime(res.create_time)
        state.existResources = res.resources
        state.existImageFiles = res.resources
          .filter(x => x.type != 'video')
          .map(x => ({ url: x.url }))
        state.existVideoFiles = res.resources
          .filter(x => x.type == 'video')
          .map(x => ({ url: x.url }))
        this.setState(state)
      })
    }
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
    } = this.state
    return (
      <View className="memoriaUpdate">
        <Text>标题</Text>
        <Input onInput={this.onTitleChange} value={title} className="title" />
        <Text>想法</Text>
        <Textarea
          onInput={this.onFeelingChange}
          value={feeling}
          className="feeling"
        />
        <View
          className="dateDisplay"
          onClick={this.onShowCalendar}
        >{`时间: ${selectDate}`}</View>
        {isCalendarVisible && (
          <AtCalendar
            onSelectDate={this.onSelectDate}
            currentDate={selectDate}
          />
        )}
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
                    <Video src={x.url} className="resource" />
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
                  <Video src={x.url} className="resource" />
                </View>
              )
            })}
          </View>
        </View>
        <AtButton onClick={this.onAddVideo} type="primary" size="small">
          Video
        </AtButton>
        <AtButton
          onClick={this.onSave}
          type="primary"
          size="small"
          className="saveBtn"
        >
          Save
        </AtButton>
      </View>
    )
  }
}

export default MemoriaUpdate
