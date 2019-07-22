import './update.scss'
import Taro from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { request } from '../../util/request'
import { uploadFiles } from '../../util/qiniu'
import { Component, Config, observer } from '../util/component'
import { path } from '../../util/path'

type Props = {}

type State = {} & BaseMemoria & Partial<MemoriaAppendInfo>

@observer
class MemoriaUpdate extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'create & edit',
  }

  state: State = {
    resources: [],
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
    const uploadResult = await uploadFiles([
      res.tempFilePath,
      (res as any).thumbTempFilePath,
    ])
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

  async onSave() {
    const { title, feeling, resources } = this.state
    const info = {
      user_id: 1, // TODO: add user
      title,
      feeling,
      resources,
      tags: [],
    }
    if (this.action == 'edit') {
      await request('updateMemoria', {
        id: this.memoriaId,
        ...info,
      } as any)
    } else {
      await request('addMemoria', info)
    }
    path.home.redirect()
  }

  componentDidMount() {
    if (this.action == 'edit') {
      request('getMemoria', { id: this.memoriaId }).then(res => {
        this.setState(res)
      })
    }
  }

  render() {
    const { title, feeling, resources } = this.state
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
