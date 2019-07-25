const { exec, execSync } = require('child_process')
const inquirer = require('inquirer')
const request = require('request')
const util = require('util')

const config = {
  getVersionUrl: 'https://version.matthew5.cn/mp-version',
  setVersionUrl: 'https://version.matthew5.cn/mp-version/update',
  sitEnv: 'SIT',
  sitBuildCommand: 'npm run build:sit',
  prodEnv: 'PROD',
  prodBuildCommand: 'npm run build:prod',
}
const uploadParams = {
  env: config.sitEnv,
  version: null,
  versionDesc: 'here is version desc',
  versionUpdateType: '2',
  filePath: '',
  devLastVersion: '',
  prodLastVersion: '',
  updateVersion: {},
}

init()
/**
 * 初始化函数
 * 获取环境，版本，版本描述
 * 测试版本自动生成版本号，生产环境必须手动输入
 */
function init() {
  let argv = process.argv
  argv.splice(0, 2)
  let [env, versionDesc = '', version = ''] = argv
  uploadParams.env = env
  uploadParams.version = version
  uploadParams.versionDesc = versionDesc
  uploadParams.filePath = getFilePath()
  fetchLastVersionAndNext()
}

//从服务器获取版本号
function fetchLastVersionAndNext() {
  request.get(config.getVersionUrl, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      const res = JSON.parse(body)
      uploadParams.devLastVersion = res.version.dev
      uploadParams.prodLastVersion = res.version.prod
      checkVersionAndNext()
    } else {
      throw new Error(`版本号获取失败,请重试 ${error}`)
    }
  })
}

function verifyVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('请输入合法的版本号（eg:0.0.1）')
  }
}
async function getVersionChoice(lastVersion, inputVersion) {
  if (!lastVersion && !inputVersion) {
    throw new Error('没有历史版本记录,必须输入版本号（eg:0.0.1)')
  }
  inputVersion && verifyVersion(inputVersion)

  if (lastVersion) {
    console.log(`上次发布版本号: ${lastVersion}\n`)
    if (!inputVersion) {
      let verifyResult = await inquirer.prompt([
        {
          type: 'list',
          name: 'updateType',
          message: `请选择更新版本类型`,
          choices: ['0.0.X', '0.X.0', 'X.0.0'],
          default: '0.0.X',
        },
      ])
      if (verifyResult.updateType === '0.0.X') {
        uploadParams.versionUpdateType = '2'
      } else if (verifyResult.updateType === '0.X.0') {
        uploadParams.versionUpdateType = '1'
      } else if (verifyResult.updateType === 'X.0.0') {
        uploadParams.versionUpdateType = '0'
      }
    } else {
      const verifyResult = await inquirer.prompt([
        {
          type: 'input',
          name: 'verify',
          message: `上次发布版本号:${lastVersion},输入版本号:${inputVersion},是否确认？ y/n`,
        },
      ])
      if (verifyResult.verify.toLowerCase() !== 'y') {
        console.log('请检查版本号后重试，即将退出')
        process.exit()
      }
    }
  }
}
//版本号处理
async function checkVersionAndNext() {
  if (uploadParams.env === config.sitEnv) {
    await getVersionChoice(uploadParams.devLastVersion, uploadParams.version)
  } else if (uploadParams.env === config.prodEnv) {
    await getVersionChoice(uploadParams.prodLastVersion, uploadParams.version)
    // if (
    //   !uploadParams.version ||
    //   !/^\d+\.\d+\.\d+$/.test(uploadParams.version)
    // ) {
    //   uploadParams.version = await checkAndGetInputVersion()
    // }
  }
  getDescriptionAndNext()
}

function getDescriptionAndNext() {
  let commitId = getGitCommitId()
  if (uploadParams.versionDesc === '') {
    uploadParams.versionDesc = `commit id: ${commitId}`
  } else {
    uploadParams.versionDesc += `, commit id: ${commitId}`
  }
  build()
}
//打包
function build() {
  console.log('\n～～～～ start build ～～～～')
  if (uploadParams.env === config.sitEnv) {
    console.log(execCommand(config.sitBuildCommand))
  } else if (uploadParams.env === config.prodEnv) {
    console.log(execCommand(config.prodBuildCommand))
  }
  upload()
}
//上传
async function upload() {
  console.log('\n～～～～ Start upload～～～～')
  let nowVersion = getNewVersion()
  let uploadResult = execCommand(
    `/Applications/wechatwebdevtools.app/Contents/MacOS/cli -u ${nowVersion}@${uploadParams.filePath}/dist --upload-desc ${uploadParams.versionDesc}`,
  )
  console.log(`\n${uploadResult}`)
  console.log(`\nnow version --- ${nowVersion}`)
  setVersion()
}

//获取git commit id
function getGitCommitId() {
  return execCommand('git rev-parse  HEAD')
}
/**
 * shell命令执行
 * @param {string} cmdStr
 * @returns {string}
 */
function execCommand(cmdStr) {
  try {
    return execSync(cmdStr)
      .toString()
      .trim()
  } catch (err) {
    console.log(`\n exec cmd error \n, ${err}`)
    throw new Error(`执行${cmdStr}出错`)
  }
}
// 保存版本号
function setVersion() {
  let params = uploadParams.updateVersion
  request(
    {
      method: 'POST',
      url: `${config.setVersionUrl}`,
      json: true,
      header: {
        'content-type': 'application/json',
      },
      body: params,
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200 && body.isSuccess) {
        console.log(`版本号保存成功`)
        console.log(`\n进入 https://mp.weixin.qq.com 切换体验版`)
        console.log('\nAuto publish is done! ^_^ \n')
      } else {
        throw new Error(`版本号保存失败\n ${error}`)
      }
    },
  )
}
// 计算版本号
function getNewVersion() {
  let lastVersion = ''
  const inputVersion = uploadParams.version
  let versionParamKey = ''
  if (uploadParams.env === config.sitEnv) {
    lastVersion = uploadParams.devLastVersion
    versionParamKey = 'dev'
  } else if (uploadParams.env === config.prodEnv) {
    lastVersion = uploadParams.prodLastVersion
    versionParamKey = 'prod'
  }
  if (inputVersion) {
    uploadParams.updateVersion = {
      [versionParamKey]: inputVersion,
    }
    return inputVersion
  } else {
    const newVersion = getAutoIncrementalVersion(lastVersion)
    uploadParams.updateVersion = {
      [versionParamKey]: newVersion,
    }
    return newVersion
  }
}

function getAutoIncrementalVersion(lastVersion) {
  let versionNumbers = lastVersion.split('.').map(function(item) {
    return parseInt(item)
  })
  if (uploadParams.versionUpdateType === '0') {
    versionNumbers = [versionNumbers[0] + 1, 0, 0]
  } else if (uploadParams.versionUpdateType === '1') {
    versionNumbers = [versionNumbers[0], versionNumbers[1] + 1, 0]
  } else {
    versionNumbers[2] += 1
  }
  return versionNumbers.join('.')
}
//检查输入内容
async function checkAndGetInputVersion(retryCount = 3) {
  if (retryCount == 0) {
    console.log('\n版本号有误，即将退出')
    process.exit()
  }
  let verifyResult = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: `请输入合法的版本号（eg:0.0.1),retry chance:${retryCount}`,
    },
  ])
  if (!/^\d+\.\d+\.\d+$/.test(verifyResult.version)) {
    console.log('\n版本号输入有误（eg:0.0.1)')
    retryCount--
    await checkAndGetInputVersion(retryCount)
  } else {
    console.log(`\n你输入的版本号为${verifyResult.version}`)
    return verifyResult.version
  }
}
//获取文件路径
function getFilePath() {
  return execCommand('pwd')
}
