import './update.scss'
import Taro from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { request } from '../../util/request'
import { uploadFiles } from '../../util/qiniu'
import { Component, Config, observer } from '../util/component'
import { path } from '../../util/path'
import { AtCalendar } from 'taro-ui'
import { getDisplayTime, getUnix } from '../util/dayjs'

type Props = {}

type State = {
  selectDate: string
  isCalendarVisible: boolean
} & BaseMemoria &
  Partial<MemoriaAppendInfo>

@observer
class MemoriaUpdate extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'create & edit',
  }

  state: State = {
    resources: [],
    selectDate: getDisplayTime(),
  } as any

  get memoriaId() {
    return this.$router.params.id
  }

  get action(): 'edit' {
    return this.$router.params.action
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

  async onAddImage() {
    const res = await Taro.chooseImage()
    const uploadResult = await uploadFiles(res.tempFilePaths)
    this.setState(prevState => ({
      resources: prevState.resources.concat(
        uploadResult.map(x => ({ url: x.uploadedUrl })),
      ),
    }))
  }

  async onAddVideo() {
    const res = await Taro.chooseVideo()
    const urls = [res.tempFilePath, (res as any).thumbTempFilePath].filter(
      x => x,
    )
    const uploadResult = await uploadFiles(urls)
    const videoResource: BaseResource = {
      url: uploadResult[0].uploadedUrl,
      thumb: '',
      type: 'video',
    }
    if (uploadResult.length == 2) {
      videoResource.thumb = uploadResult[1].uploadedUrl
    }
    this.setState(prevState => ({
      resources: prevState.resources.concat(videoResource),
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

  async onSave() {
    const { title, feeling, resources, selectDate } = this.state
    if (this.action == 'edit') {
      await request('updateMemoria', {
        id: this.memoriaId,
        title,
        feeling,
        resources,
        tags: [],
        create_time: getUnix(selectDate),
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
    if (this.action == 'edit') {
      request('getMemoria', { id: this.memoriaId }).then(res => {
        const state = res as State
        state.selectDate = getDisplayTime(res.create_time)
        this.setState(state)
      })
    }
  }

  render() {
    const {
      title,
      feeling,
      resources,
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
          {resources.map(x => {
            const url = x.thumb || x.url
            return <Image src={url} className="photo" />
          })}
        </View>
        <Button onClick={this.onAddImage}>Add Photo</Button>
        <Button onClick={this.onAddVideo}>Add Video</Button>
        <Button onClick={this.onSave}>Save</Button>
      </View>
    )
  }
}

export default MemoriaUpdate
