const { exec, execSync } = require('child_process')
// @ts-ignore
const inquirer = require('inquirer')
const request = require('request')
const util = require('util')

const config = {
  getVersionUrl: 'https://version.matthew5.cn/mp-version',
  setVersionUrl: 'https://version.matthew5.cn/mp-version/update',
  sitEnv: 'SIT',
  sitBuildCommand: 'npm run build:sit',
  prodEnv: 'PROD',
  prodBuildCommand: 'npm run build:prod'
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
  // @ts-ignore
  let argv = process.argv
  argv.splice(0, 2)
  let [env, version, versionDesc = ''] = argv
  uploadParams.env = env
  uploadParams.version = version
  uploadParams.versionDesc = versionDesc
  uploadParams.filePath = getFilePath()
  getVersionFromOrigin()
}

//从服务器获取版本号
function getVersionFromOrigin() {
  request.get(config.getVersionUrl, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      uploadParams.devLastVersion = JSON.parse(body).version.dev
      uploadParams.prodLastVersion = JSON.parse(body).version.prod
      versionHandler()
    } else {
      throw new Error(`版本号获取失败,请重试 ${error}`)
    }
  })
}
//版本号处理
async function versionHandler() {
  if (uploadParams.env === config.sitEnv) {
    console.log(`\n --- 体验版环境 --- \n`)
    if (!uploadParams.devLastVersion || uploadParams.devLastVersion === '') {
      if (!uploadParams.version) {
        throw new Error('没有历史版本记录,必须输入版本号（eg:0.0.1)')
      } else {
        if (!/^\d+\.\d+\.\d+$/.test(uploadParams.version)) {
          throw new Error('没有历史版本记录,请输入合法的版本号（eg:0.0.1）')
        }
      }
    } else {
      if (!uploadParams.version) {
        console.log(`\n上次发布版本号: ${uploadParams.devLastVersion}\n`)

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
        if (!/^\d+\.\d+\.\d+$/.test(uploadParams.version)) {
          throw new Error('请输入合法的版本号（eg:0.0.1）')
        }
        let verifyResult = await inquirer.prompt([
          {
            type: 'input',
            name: 'verify',
            message: `上次发布版本号:${
              uploadParams.devLastVersion
            },输入版本号:${uploadParams.version},是否确认？ Y/N`,
          },
        ])
        if (verifyResult.verify !== 'Y' && verifyResult.verify !== 'y') {
          console.log('\n请检查版本号后重试，即将退出')
          // @ts-ignore
          process.exit()
        }
      }
    }
  } else if (uploadParams.env === 'PROD') {
    console.log(`\n --- 生产环境 --- \n`)
    console.log(`当前生产版本号:${uploadParams.prodLastVersion}`)
    if (
      !uploadParams.version ||
      !/^\d+\.\d+\.\d+$/.test(uploadParams.version)
    ) {
      uploadParams.version = await checkInputProdVersion()
    }
  }
  getVersionDesc()
}
//todo 获取git commit-id
function getVersionDesc() {
  let commitId = getGitCommitId()
  if (uploadParams.versionDesc === '') {
    uploadParams.versionDesc = `git版本记录:${commitId}`
  } else {
    uploadParams.versionDesc += `,git版本:${commitId}`
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
  let nowVersion = versionComputed()
  let uploadResult = execCommand(
    `/Applications/wechatwebdevtools.app/Contents/MacOS/cli -u ${nowVersion}@${
      uploadParams.filePath
    }/dist --upload-desc ${uploadParams.versionDesc}`,
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
function versionComputed() {
  if (uploadParams.env === config.sitEnv) {
    let devNowVersion = updateDevVersion()
    uploadParams.updateVersion = {
      dev: devNowVersion,
    }
    return devNowVersion
  } else if (uploadParams.env === config.prodEnv) {
    uploadParams.updateVersion = {
      prod: uploadParams.version,
    }
    return uploadParams.version
  }
}

function updateDevVersion() {
  let versionNumbers = uploadParams.devLastVersion
    .split('.')
    .map(function(item) {
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
async function checkInputProdVersion(retryCount = 3) {
  if (retryCount == 0) {
    console.log('\n版本号有误，即将退出')
    // @ts-ignore
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
    await checkInputProdVersion(retryCount)
  } else {
    console.log(`\n你输入的版本号为${verifyResult.version}`)
    return verifyResult.version
  }
}
//获取文件路径
function getFilePath() {
  return execCommand('pwd')
}
