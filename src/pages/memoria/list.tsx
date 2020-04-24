import './list.scss'
import Taro from '@tarojs/taro'
import { View, Image, Text, Button, ScrollView } from '@tarojs/components'
import { request } from '../../util/request'
import { path } from '../../util/path'
import { Component, Config, observer } from '../util/component'
import { AuthModal } from '../../components/authModal/index'
import {
  AtCard,
  AtFab,
  AtModal,
  AtModalContent,
  AtModalAction,
  AtButton,
} from 'taro-ui'
import { getDisplayTime } from '../../util/dayjs'
import { TagSearch } from '../../components/tagSearch/index'
import { config } from '@/config'

type Props = {}

type State = {
  memorias: SearchMemoriaRes['memorias']
  isActionVisible: boolean
  isGoPageModalVisible: boolean
  isTagSearchModalVisible: boolean
}

@observer
class MemoriaList extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'memorias',
    enablePullDownRefresh: true,
  }

  state: State = {
    memorias: [],
    isActionVisible: false,
    isGoPageModalVisible: false,
    isTagSearchModalVisible: false,
  }

  goFunction: Function

  onMemoriaClick(id: number, isLargeData: boolean) {
    this.goFunction = path.memoria.detail.navigate.bind(null, {
      id,
    })
    if (isLargeData && this.userState.userSetting.isAlertLargeData) {
      this.setState({
        isGoPageModalVisible: true,
      })
    } else {
      this.goFunction()
    }
  }

  onGoEditMemoria = (id: number, isLargeData: boolean, eve: any) => {
    eve.stopPropagation()
    this.goFunction = path.memoria.update.navigate.bind(null, {
      id,
    })
    if (isLargeData && this.userState.userSetting.isAlertLargeData) {
      this.setState({
        isGoPageModalVisible: true,
      })
    } else {
      this.goFunction()
    }
  }

  onGoPageConfirm = () => {
    this.setState({
      isGoPageModalVisible: false,
    })
    this.userStore.ignoreLargeDataWarning()
    this.goFunction()
  }

  onGoPageCancel = () => {
    this.setState({
      isGoPageModalVisible: false,
    })
  }

  onGoExpressTask = () => {
    this.setState({
      isGoPageModalVisible: false,
    })
    path.expressTask.navigate()
  }

  onGoCreateMemoria = () => {
    this.setState({
      isActionVisible: false,
    })
    path.memoria.update.navigate()
  }

  onGoIndividual = () => {
    this.setState({
      isActionVisible: false,
    })
    path.individual.navigate()
  }

  onFabClick = () => {
    this.setState(prev => ({
      isActionVisible: !prev.isActionVisible,
    }))
  }

  pendingSelectTagIds: number[] = []
  onTagSelectChange = (tagIds: number[]) => {
    this.pendingSelectTagIds = tagIds
  }

  tagSearchRef: TagSearch = null
  getTagSearchRef = ref => {
    this.tagSearchRef = ref
  }

  confirmedTagIds: number[] = []
  onTagSearch = () => {
    this.setState({
      isTagSearchModalVisible: false,
    })
    this.tagSearchRef.resetKeyword()
    this.confirmedTagIds = this.pendingSelectTagIds
    this.fetchData()
  }

  onTagSearchModalOpen = () => {
    this.setState({
      isTagSearchModalVisible: true,
    })
  }

  onTagSearchModalClose = () => {
    this.setState({
      isTagSearchModalVisible: false,
    })
    this.tagSearchRef.resetKeyword()
    this.tagSearchRef.setSelectedTagIds(this.confirmedTagIds)
  }

  async fetchData() {
    await request('searchMemoria', {
      tag_ids: this.confirmedTagIds,
    }).then(res => {
      this.setState({
        memorias: res.memorias,
      })
    })
  }

  async onPullDownRefresh() {
    Taro.showLoading({
      title: '加载中...',
    })
    await this.fetchData()
    Taro.stopPullDownRefresh()
    Taro.hideLoading()
  }

  componentDidMount() {
    this.fetchData()
  }

  render() {
    const {
      memorias,
      isActionVisible,
      isGoPageModalVisible,
      isTagSearchModalVisible,
    } = this.state
    return (
      <View className="memorias">
        <AuthModal allowClose />
        <AtModal
          isOpened={isGoPageModalVisible}
          cancelText="取消"
          confirmText="忽略并进入"
          onClose={this.onGoPageCancel}
          onCancel={this.onGoPageCancel}
          onConfirm={this.onGoPageConfirm}
          content="多图预警！！！当数据量较大时在右上角显示红色的圈圈 最好在wifi环境下打开"
        />
        <AtModal
          isOpened={isTagSearchModalVisible}
          onClose={this.onTagSearchModalClose}
          onCancel={this.onTagSearchModalClose}
        >
          <AtModalContent>
            <TagSearch
              onSelectChange={this.onTagSelectChange}
              ref={this.getTagSearchRef}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onTagSearchModalClose}>取消</Button>
            <Button onClick={this.onTagSearch}>确定</Button>
          </AtModalAction>
        </AtModal>

        <View className="header">
          <AtButton
            size="small"
            onClick={this.onTagSearchModalOpen}
            className="tabSearchBtn"
          >
            标签搜索
          </AtButton>
          <Text className="count">{`memorias: ${memorias.length}`}</Text>
        </View>

        <ScrollView className="body" scrollY={true}>
          {memorias.map(x => {
            return (
              <AtCard
                title={x.title}
                onClick={this.onMemoriaClick.bind(this, x.id, x.isLargeData)}
                className="memoriaCard"
                note={`${x.creator.name} 资源: ${x.resourceCount}${
                  x.tagNames.length ? ' 标签: ' + x.tagNames.join(', ') : ''
                }`}
                extra={getDisplayTime(x.createTime)}
              >
                <View className="cardContent">
                  <Image
                    src={x.thumb || config.defaultThumb}
                    className="image"
                    mode="aspectFill"
                  />
                  <View className="feeling">{x.feeling}</View>
                  <View className="icon">
                    {x.isLargeData && (
                      <View className="at-icon at-icon-loading-3" />
                    )}
                    {x.creator.id == this.userId && (
                      <View
                        className="at-icon at-icon-edit"
                        onClick={this.onGoEditMemoria.bind(
                          this,
                          x.id,
                          x.isLargeData,
                        )}
                      />
                    )}
                  </View>
                </View>
              </AtCard>
            )
          })}
          <View className="endLine">the end</View>
        </ScrollView>

        <View className="fabBtn">
          <AtFab onClick={this.onFabClick}>
            <Text className="at-fab__icon at-icon at-icon-menu"></Text>
          </AtFab>
        </View>
        {isActionVisible && (
          <View className="fabBtn expressTaskBtn">
            <AtFab onClick={this.onGoExpressTask}>
              <Text className="at-fab__icon at-icon at-icon-message"></Text>
            </AtFab>
          </View>
        )}
        {isActionVisible && (
          <View className="fabBtn topBtn">
            <AtFab onClick={this.onGoCreateMemoria}>
              <Text className="at-fab__icon at-icon at-icon-add-circle"></Text>
            </AtFab>
          </View>
        )}
        {isActionVisible && (
          <View className="fabBtn leftBtn">
            <AtFab onClick={this.onGoIndividual}>
              <Text className="at-fab__icon at-icon at-icon-user"></Text>
            </AtFab>
          </View>
        )}
      </View>
    )
  }
}

export default MemoriaList
