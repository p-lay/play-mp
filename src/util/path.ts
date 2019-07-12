import { redirectTo, navigateTo } from '@tarojs/taro'
import { stringify } from 'querystring'

const _path = {
  home: '/pages/index/index',
  memoria: {
    update: '/pages/vue/update',
    detail: '/pages/vue/detail',
    list: '/pages/vue/list',
  },
}

type PathGoMethod = {
  str: (param?: any) => string
  navigate: (param?: any) => void
  redirect: (param?: any) => void
}

function pathGo(url: string, param: any, isGo?: boolean, isRedirect?: boolean) {
  const goTo = isRedirect ? redirectTo : navigateTo
  const path = { url: addUrlParam(url, param) }
  isGo && goTo(path)
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
