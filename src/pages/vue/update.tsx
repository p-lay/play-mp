import './update.scss'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { request } from '../../util/request'
import { uploadFiles, qiniuUrlBindSearch } from '../../util/qiniu'

type Props = {}

// add and edit => BaseVue & Partial<VueAppendInfo>
type State = {} & BaseVue & Partial<VueAppendInfo>

@inject('counterStore')
@observer
class VueUpdate extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'update',
  }

  state: State = {
    resources: [],
  } as any

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
    await request('addVue', {
      user_id: 1, // TODO: add user
      title,
      feeling,
      resources,
      tags: [],
    })
    Taro.navigateTo({ url: '/pages/index/index' })
  }

  componentDidMount() {
    // request('getVue', { vue_id: 6 }).then(res => {
    //   this.setState(res.data)
    // })
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
