import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtSearchBar, AtTag } from 'taro-ui'
import { Component, observer, inject } from '../../pages/util/component'
import './index.scss'
import { request } from '../../util/request'

type Props = {
  defaultSelectedIds?: number[]
  onSelectChange?: (value: number[]) => void
}

type State = {
  keyword: string
  tags: Tag[]
  selectedIds: number[]
}

@observer
export class TagSearch extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedIds: props.defaultSelectedIds || [],
      tags: [],
      keyword: '',
    }
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

  onTagSelect = (id: number) => {
    let selectedIds = []
    if (this.state.selectedIds.includes(id)) {
      selectedIds = this.state.selectedIds.filter(x => x != id)
    } else {
      selectedIds = this.state.selectedIds.concat(id)
    }
    this.setState(
      {
        selectedIds,
      },
      () => {
        this.props.onSelectChange &&
          this.props.onSelectChange(this.state.selectedIds)
      },
    )
  }

  getSelectedTagIds() {
    return this.state.selectedIds
  }

  setSelectedTagIds(ids: number[]) {
    this.setState({
      selectedIds: ids,
    })
  }

  resetKeyword() {
    if (this.state.keyword) {
      this.setState(
        {
          keyword: '',
        },
        this.fetchData,
      )
    }
  }

  async fetchData() {
    await request('searchTag', {
      keyword: this.state.keyword,
    }).then(res => {
      this.setState({
        tags: res.tags,
      })
    })
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.state.selectedIds.length) {
      if (
        nextProps.defaultSelectedIds &&
        nextProps.defaultSelectedIds.length > 0
      ) {
        this.setState({
          selectedIds: nextProps.defaultSelectedIds,
        })
      }
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  render() {
    const { keyword, tags, selectedIds } = this.state
    return (
      <View className="tagSearch">
        <AtSearchBar
          value={keyword}
          onChange={this.onSearchTagChange.bind(this)}
          onClear={this.onSearchTagClear}
          onActionClick={this.fetchData.bind(this)}
        />

        {tags.map(tag => {
          return (
            <AtTag
              type="primary"
              onClick={this.onTagSelect.bind(this, tag.id)}
              active={selectedIds.includes(tag.id)}
              className="tagSearchItem"
            >
              {tag.name}
            </AtTag>
          )
        })}
      </View>
    )
  }
}
