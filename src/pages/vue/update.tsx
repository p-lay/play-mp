import './update.scss'
import Taro from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { request } from '../../util/request'
import { uploadFiles } from '../../util/qiniu'
import { Component, Config, observer } from '../util/component'
import { path } from '../../util/path'

type Props = {}

// add and edit => BaseVue & Partial<VueAppendInfo>
type State = {} & BaseVue & Partial<VueAppendInfo>

@observer
class VueUpdate extends Component<Props, State> {
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

  onAddImage() {
    const self = this
    Taro.chooseImage({
      success: async function(res) {
        const uploadResult = await uploadFiles(res.tempFilePaths)
        console.log('after image', uploadResult)
        self.setState(prevState => ({
          resources: prevState.resources.concat(
            uploadResult.map(x => ({ url: x.uploadedUrl })),
          ),
        }))
      },
    })
  }

  async onAddVideo() {
    const res = await Taro.chooseVideo()
    const uploadResult = await uploadFiles([
      (res as any).thumbTempFilePath,
      res.tempFilePath,
    ])
    console.log('after video', uploadResult)
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
      await request('updateVue', {
        id: this.memoriaId,
        ...info,
      } as any)
    } else {
      await request('addVue', info)
    }
    path.home.redirect()
  }

  componentDidMount() {
    if (this.action == 'edit') {
      request('getVue', { vue_id: this.memoriaId }).then(res => {
        this.setState(res)
      })
    }
  }

  render() {
    const { title, feeling, resources } = this.state
    return (
      <View className="vueUpdate">
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
            return <Image src={x.url} className="photo" />
          })}
        </View>
        <Button onClick={this.onAddImage}>Add Photo</Button>
        <Button onClick={this.onAddVideo}>Add Video</Button>
        <Button onClick={this.onSave}>Save Vue</Button>
      </View>
    )
  }
}

export default VueUpdate
