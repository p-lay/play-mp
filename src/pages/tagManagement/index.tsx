import './index.scss'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { request } from '../../util/request'
import { Component, Config, observer } from '../util/component'
import { AtSearchBar, AtTag, AtModal, AtFloatLayout, AtButton } from 'taro-ui'
import { path } from '../../util/path'

type Props = {}

type State = {
  keyword?: string
  deletableTags: SearchTagRes['tags']
  relatedTags: SearchTagRes['tags']
  isDeleteModalVisible: boolean
  isRelatedTagContentVisible: boolean
  deleteTagId: number
  relatedMemorias: number[]
}

@observer
class TagManagement extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: 'Tag Management',
    enablePullDownRefresh: true,
  }

  state: State = {
    keyword: '',
    deletableTags: [],
    relatedTags: [],
    isDeleteModalVisible: false,
    isRelatedTagContentVisible: false,
    deleteTagId: 0,
    relatedMemorias: [],
  }

  onSearchTagChange = keyword => {
    this.setState({
      keyword,
    })
  }

  onSearchTagClear = () => {
    this.setState(
      {
        keyword: '',
      },
      this.fetchData,
    )
  }

  onTagClick = (memoriaIds: number[]) => {
    this.setState({
      isRelatedTagContentVisible: true,
      relatedMemorias: memoriaIds,
    })
  }

  onDeleteClose = () => {
    this.setState({
      isDeleteModalVisible: false,
    })
  }

  onDeleteConfirm = async () => {
    await request('deleteTag', { id: this.state.deleteTagId })
    this.onDeleteClose()
  }

  onDeleteTag = (tagId: number) => {
    this.setState({
      deleteTagId: tagId,
      isDeleteModalVisible: true,
    })
  }

  onRelatedTagContentClose = () => {
    this.setState({
      isRelatedTagContentVisible: false,
    })
  }

  onGoMemoriaEdit = (id: number) => {
    path.memoria.update.navigate({
      id,
    })
  }

  async fetchData() {
    await request('searchTag', {
      keyword: this.state.keyword,
      withMemoria: true,
    }).then(res => {
      this.setState({
        deletableTags: res.tags.filter(x => !x.memoriaIds.length),
        relatedTags: res.tags.filter(x => x.memoriaIds.length),
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
      keyword,
      deletableTags,
      relatedTags,
      isDeleteModalVisible,
      isRelatedTagContentVisible,
      relatedMemorias,
    } = this.state
    return (
      <View className="tagManagement">
        <AtSearchBar
          value={keyword}
          onChange={this.onSearchTagChange.bind(this)}
          onClear={this.onSearchTagClear}
          onActionClick={this.fetchData.bind(this)}
        />
        <View className="tagWrapper">
          <AtModal
            isOpened={isDeleteModalVisible}
            cancelText="取消"
            confirmText="确定"
            onClose={this.onDeleteClose}
            onCancel={this.onDeleteClose}
            onConfirm={this.onDeleteConfirm}
            content="删除?"
          />

          {deletableTags.map(tag => {
            return (
              <AtTag
                type="primary"
                onClick={this.onDeleteTag.bind(this, tag.id)}
                className="tag"
              >
                {tag.name}
                <View className="at-icon at-icon-close"></View>
              </AtTag>
            )
          })}
        </View>
        <View className="tagWrapper">
          <AtFloatLayout
            isOpened={isRelatedTagContentVisible}
            title="关联的memoria"
            onClose={this.onRelatedTagContentClose}
          >
            {relatedMemorias.map(memoria => {
              return (
                <View>
                  <AtButton
                    onClick={this.onGoMemoriaEdit.bind(this, memoria)}
                    size="small"
                    type="primary"
                  >
                    {memoria}
                  </AtButton>
                </View>
              )
            })}
          </AtFloatLayout>

          {relatedTags.map(tag => {
            return (
              <AtTag
                type="primary"
                onClick={this.onTagClick.bind(this, tag.memoriaIds)}
                className="tag"
              >
                {tag.name}
              </AtTag>
            )
          })}
        </View>
      </View>
    )
  }
}

export default TagManagement
