import './app.scss'
import './taro-ui.scss'
import '@tarojs/async-await'
import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import MemoriaList from './pages/memoria/list'
import store from './store'
import { UserAction } from './action/user'

class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/memoria/list',
      'pages/index/index',
      'pages/memoria/update',
      'pages/memoria/detail/index',
      'pages/individual/index',
      'pages/tagManagement/index',
      'pages/expressTask/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
  }

  componentWillMount() {
    UserAction.login()
  }

  render() {
    return (
      <Provider store={store}>
        <MemoriaList />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
