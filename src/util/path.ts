import { redirectTo, navigateTo } from '@tarojs/taro'
import { stringify } from 'querystring'
import { getStore } from '../store'

const _path = {
  home: ('/pages/memoria/list' as any) as PathGoMethod,
  memoria: {
    update: ('/pages/memoria/update' as any) as PathGoMethod,
    detail: ('/pages/memoria/detail' as any) as PathGoMethod,
    list: ('/pages/memoria/list' as any) as PathGoMethod,
  },
  individual: ('/pages/individual/index' as any) as PathGoMethod,
  tagManagement: ('/pages/tagManagement/index' as any) as PathGoMethod,
}

type PathGoMethod = {
  str: (param?: any) => string
  navigate: (param?: any) => void
  redirect: (param?: any) => void
}

function pathGo(url: string, param: any, isGo?: boolean, isRedirect?: boolean) {
  const goTo = isRedirect ? redirectTo : navigateTo
  const path = { url: addUrlParam(url, param) }
  if (isGo) {
    const userStore = getStore('userStore')
    const authModalStore = getStore('authModalStore')
    if (userStore.isLogon) {
      goTo(path)
    } else {
      authModalStore.openUserInfo()
    }
  }
  return path.url
}

function generatePath(path: any, key?: string) {
  let value = key ? path[key] : path
  const valueType = typeof value
  if (valueType == 'string') {
    path[key] = {
      str: function(param) {
        return pathGo(value, param)
      },
      navigate: function(param) {
        pathGo(value, param, true)
      },
      redirect: function(param) {
        pathGo(value, param, true, true)
      },
    }
  } else if (valueType == 'object') {
    for (const key in value) {
      generatePath(value, key)
    }
  }
}

function addUrlParam(url: string, param: { [key: string]: any }) {
  if (url.indexOf('?') > -1) {
    return `${url}${stringify(param)}`
  } else {
    return `${url}?${stringify(param)}`
  }
}

generatePath(_path)

export const path: typeof _path = _path
