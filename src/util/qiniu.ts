import {
  uploadFile as taroUpload,
  showModal,
  showLoading,
  hideLoading,
} from '@tarojs/taro'
import { config } from '../config'
import { request } from './request'

function getQiniuSourceUrl(key: string) {
  return `http://${config.qiniuDomain}/${key}`
}

export function qiniuUrlBindSearch(url: string): string {
  return `${url}?imageView2/0/w/750/q/80`
}

const qiniuConfig = {
  token: '',
  expires_second: 0,
  prevGetTime: 0,
}

interface IUploadResponse {
  hash: string
  key: string
}

function _uploadFile(
  filename: string,
): Promise<{ filename: string; uploadedUrl: string }> {
  return taroUpload({
    filePath: filename,
    url: 'https://upload.qiniup.com',
    formData: {
      token: qiniuConfig.token,
    },
    name: 'file',
  }).then(res => {
    const data: IUploadResponse = res.data
      ? JSON.parse(res.data)
      : { key: '', hash: '' }
    return {
      filename,
      uploadedUrl: getQiniuSourceUrl(data.key),
    }
  })
}

const uploadFile = async (filename: string) => {
  const currentTime = Number((new Date().getTime() / 1000).toFixed(0))
  if (
    !qiniuConfig.token ||
    currentTime - qiniuConfig.prevGetTime >= qiniuConfig.expires_second
  ) {
    const data = await request('getQiniuToken', {})
    if (data.token && data.expires_second) {
      qiniuConfig.token = data.token
      qiniuConfig.expires_second = data.expires_second
      qiniuConfig.prevGetTime = currentTime
      return await _uploadFile(filename)
    } else {
      showModal({
        title: '提示信息',
        content: '上传失败',
      })
      return {
        filename,
        uploadedUrl: '',
      }
    }
  } else {
    return await _uploadFile(filename)
  }
}

export const uploadFiles = (filenames: string[]) => {
  showLoading({
    title: '正在上传...',
    mask: true,
  })
  return Promise.all(filenames.map(x => uploadFile(x))).then(uploaded => {
    hideLoading()
    return uploaded
  })
}
