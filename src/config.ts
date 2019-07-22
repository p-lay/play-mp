export const env_mode = process.env.NODE_ENV

const isLocal = env_mode == 'LOCAL'

export const config = {
  qiniuDomain: 'qiniu.matthew5.cn',
  serverHost: isLocal ? 'http://localhost:3000' : 'https://play.matthew5.cn',
}
