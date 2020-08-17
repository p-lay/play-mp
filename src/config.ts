export const env_mode = process.env.NODE_ENV

const isProd = env_mode == 'PROD'
let serverHost = 'http://localhost:3000'
if (isProd) {
  serverHost = 'https://play-api.matthew5.cn'
}

export const config = {
  qiniuDomain: isProd ? 'qiniu-prod.matthew5.cn' : 'qiniu.matthew5.cn',
  serverHost,
  defaultThumb: isProd
    ? 'http://qiniu-prod.matthew5.cn/defaultThumb'
    : 'http://qiniu.matthew5.cn/defaultThumb',
}

export const parseDownloadUrl = (url: string) => {
  if (isProd && url.includes(`http://${config.qiniuDomain}`)) {
    return url.replace(
      `http://${config.qiniuDomain}`,
      `https://${config.qiniuDomain}`,
    )
  }
  return url
}
