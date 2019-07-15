import { request as taroRequest, showToast } from '@tarojs/taro'
import { config } from '../config'

function getUrl(method: string) {
  return `${config.serverHost}/${method}`
}

function throwException(code: Code, message: string, method: string) {
  showToast({
    title: `服务器处理异常 code: ${code}, message: ${message}`,
    mask: true,
  })
  throw new Error(`api request error, method: ${method}`)
}

function checkException(res: any, method: string) {
  const commonRes = res.data
  let code = commonRes.code
  if (res.statusCode == '500') {
    code = 500
  }
  code && throwException(code, commonRes.message, method)
}

export function request<T extends keyof ContractType>(
  method: T,
  params: ContractType[T]['req'],
): Promise<ContractType[T]['res']> {
  return taroRequest<T>({
    url: getUrl(method),
    data: params,
    method: 'POST',
  }).then(res => {
    checkException(res, method)
    return (res.data as any).data
  })
}
