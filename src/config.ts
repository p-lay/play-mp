export const env_mode = process.env.NODE_ENV

const isSit = env_mode == 'SIT'
const isProd = env_mode == 'PROD'
let serverHost = 'http://localhost:3000'
if (isProd) {
  serverHost = 'https://play-api.matthew5.cn'
} else if (isSit) {
  serverHost = 'https://play-api-sit.matthew5.cn'
}

export const config = {
  qiniuDomain: isProd ? 'qiniu-prod.matthew5.cn' : 'qiniu.matthew5.cn',
  serverHost,
}
