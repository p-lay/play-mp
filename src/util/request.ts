import { request as taroRequest, showToast } from '@tarojs/taro'
import { config } from '../config'

function getUrl(method: string) {
  return `${config.serverHost}/${method}`
}

function isResError(res: any) {
  return typeof res.data === 'string'
}

export function request<T extends keyof ContractType>(
  method: T,
  params: ContractType[T]['req'],
): Promise<ContractType[T]['res']> {
  return taroRequest<T>({
    url: getUrl(method),
    data: params,
    method: 'POST',
  })
    .then(res => {
      if (isResError(res)) {
        showToast({
          title: '网络错误, 请稍后重试',
          mask: true,
        })

        throw new Error(`api request error, method: ${method}`)
      }

      return (res.data as any).data
    })
    .catch(err => {
      showToast({ title: '网络错误, 请稍后重试' })
      throw new Error(`API 网络错误: ${method}`)
    })
}
