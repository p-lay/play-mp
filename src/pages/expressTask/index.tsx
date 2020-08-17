import './index.scss'
import Taro from '@tarojs/taro'
import { View, Checkbox, Text, Button, Picker } from '@tarojs/components'
import { request } from '../../util/request'
import { Component, Config, observer } from '../util/component'
import {
  AtCard,
  AtFab,
  AtModal,
  AtModalContent,
  AtModalAction,
  AtTextarea,
  AtInput,
  AtIcon,
} from 'taro-ui'
import dayjs from 'dayjs'

const expressCategories = [
  '韵达(庄姐)',
  '圆通东门',
  '菜鸟驿站',
  '西门内一柜',
  '西门内二柜',
  '212快递柜',
  '东门快递柜',
]
type Props = {}

type State = {
  unpickCount: number
  taskByCategory: { [key: string]: ExpressTask[] }
  addingCategoryIndex: number
  addingSerialNumber: string
  addingNote: string
  isModalVisible: boolean
}

@observer
class ExpressTaskPage extends Component<Props, State> {
  config: Config = {
    navigationBarTitleText: '屁蕾果果',
    enablePullDownRefresh: true,
  }

  state: State = {
    unpickCount: 0,
    taskByCategory: {},
    addingCategoryIndex: 0,
    addingSerialNumber: '',
    addingNote: '',
    isModalVisible: false,
  }

  getTime = updateTime => {
    const time = parseInt(dayjs(updateTime).format('YYYYMMDD'))
    const today = parseInt(dayjs().format('YYYYMMDD'))
    const diff = time - today
    if (diff === 0) {
      return '今天'
    } else if (diff === -1) {
      return '昨天'
    } else if (diff === 1) {
      return '明天'
    } else {
      return dayjs(updateTime).format('DD号')
    }
  }

  onSerialNumberChange = (addingSerialNumber: string) => {
    this.setState({
      addingSerialNumber,
    })
  }

  onNoteChange = (e: any) => {
    this.setState({
      addingNote: e.detail.value,
    })
  }

  onCategoryChange = (e: any) => {
    this.setState({
      addingCategoryIndex: e.detail.value,
    })
  }

  onModalOpen = () => {
    this.setState({
      isModalVisible: true,
      addingCategoryIndex: 0,
      addingSerialNumber: '',
      addingNote: '',
    })
  }

  onModalClose = () => {
    this.setState({
      isModalVisible: false,
      addingCategoryIndex: 0,
      addingSerialNumber: '',
      addingNote: '',
    })
  }

  onRemove = (task: ExpressTask) => {
    console.log('onRemoveTask', task, task.id)
    this.onRemoveTask(task.id)
  }

  changeStatus = (task: ExpressTask) => {
    task.status = task.status === 0 ? 1 : 0
    this.onUpdateTask(task)
  }

  onUpdateTask = async (task: ExpressTask) => {
    await request('updateExpressTask', task)
  }

  onRemoveTask = async (id: number) => {
    await request('removeExpressTask', {
      id,
    })
    await this.fetchData()
  }

  loading = false

  onAddTask = async () => {
    const {
      addingCategoryIndex,
      addingSerialNumber: serialNumber,
      addingNote: note,
    } = this.state
    const category = expressCategories[addingCategoryIndex]
    if (!this.loading) {
      this.loading = true
      await request('addExpressTask', {
        category,
        serialNumber,
        note,
      })
      this.loading = false
      this.fetchData()
      this.onModalClose()
    }
  }

  async fetchData() {
    const res = await request('getExpressTask', {})
    Object.keys(res.taskByCategory).forEach(category => {
      const tasks = res.taskByCategory[category]
      res.taskByCategory[category] = tasks
        .filter(x => !x.status)
        .concat(tasks.filter(x => !!x.status))
    })
    this.setState({
      unpickCount: res.unpickCount,
      taskByCategory: res.taskByCategory,
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
      unpickCount,
      taskByCategory,
      isModalVisible,
      addingCategoryIndex,
      addingNote,
      addingSerialNumber,
    } = this.state
    return (
      <View className="expressTask">
        <View className="unpickCount">待取快递: {unpickCount}</View>
        {Object.keys(taskByCategory).map(category => {
          const tasks = taskByCategory[category]
          console.log(1, taskByCategory, category, tasks)
          return (
            <AtCard title={category} className="card">
              {tasks.map(task => {
                return (
                  <View className="task">
                    <Checkbox
                      value=""
                      checked={task.status > 0}
                      onClick={this.changeStatus.bind(this, task)}
                    />
                    {task.serialNumber}
                    <Text className="note">{task.note}</Text>
                    <Text className="time">
                      {this.getTime(task.updateTime)}
                    </Text>
                    <AtIcon
                      className="removeBtn"
                      value="close-circle"
                      size="23"
                      color="#a92e2e"
                      onClick={this.onRemove.bind(this, task)}
                    ></AtIcon>
                  </View>
                )
              })}
            </AtCard>
          )
        })}
        <AtModal
          isOpened={isModalVisible}
          onClose={this.onModalClose}
          onCancel={this.onModalClose}
        >
          <AtModalContent>
            <View>
              <View className="addingItem">
                分类
                <Picker
                  mode="selector"
                  range={expressCategories}
                  onChange={this.onCategoryChange}
                  value={addingCategoryIndex}
                >
                  <View className="picker">
                    {expressCategories[addingCategoryIndex]}
                  </View>
                </Picker>
              </View>
              <View className="addingItem">
                快递单号
                <AtInput
                  onChange={this.onSerialNumberChange}
                  value={addingSerialNumber}
                  name="serialNumber"
                />
              </View>
              <View className="addingItem">
                备注
                <AtTextarea
                  onChange={this.onNoteChange}
                  value={addingNote}
                  maxLength={200}
                  className="textarea"
                  height={70}
                />
              </View>
            </View>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onModalClose}>取消</Button>
            <Button onClick={this.onAddTask}>确定</Button>
          </AtModalAction>
        </AtModal>
        <View className="fabBtn">
          <AtFab onClick={this.onModalOpen} size="small">
            <Text className="at-fab__icon at-icon at-icon-edit"></Text>
          </AtFab>
        </View>
      </View>
    )
  }
}

export default ExpressTaskPage
