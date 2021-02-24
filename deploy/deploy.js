const path = require('path')
const ci = require('miniprogram-ci')
const commander = require('commander')

function getProject(privateKeyPath) {
  const projectPath = path.resolve(__dirname, '../dist')
  const projectConfig = require(path.resolve(projectPath, './project.config.json'))

  return new ci.Project({
    projectPath,
    privateKeyPath,
    appid: projectConfig.appid,
    type: projectConfig.compileType
  })
}

function displayPackageInfo({ subPackageInfo }) {
  console.log('------------------Package info--------------')
  subPackageInfo.forEach(({ name, size }, index) => {
    console.log(`Package: ${name}`)
    console.log(`Size: ${size}`)
    if (subPackageInfo.length !== (index + 1)) {
      console.log('-----------------')
    }
  })
  console.log('------------------Package info--------------')
}

async function deploy(command, args) {
  let options = Object.keys(command.opts())
    .reduce((memo, name, index) => ({...memo, [name]: args[index]}), {});

  const { privateKey } = options;
  if (!privateKey) {
    throw new Error('--private-key is required')
  }

  const version = options.versions || Date.now()
  const description = options.descriptions || 'Not Provide.'
  const project = getProject(privateKey)
  const robot = options.robot || 1

  options = {
    project,
    version,
    desc: description,
    setting: {
      es6: true
    },
    onProgressUpdate: () => {}
  }

  console.log('___________robot______________', robot)
  const [, uploaded] = await Promise.all([
    ci.preview({
      ...options,
      qrcodeFormat: 'terminal',
      qrcodeOutputDest: path.resolve(__dirname, './preview'),
    }),
    ci.upload({...options, robot:2})]
  );

  displayPackageInfo(uploaded)
}

/**
 * 上传代码
 * node deploy.js deploy --versions dev-master --descriptions message --private-key ./private.key
 */

commander.program
  .command('deploy')
  .allowUnknownOption(true)
  .option('--versions', '小程序版本')
  .option('--descriptions', '小程序描述')
  .option('--robot', '制定上传机器人编号，默认为1', '1')
  .option('--private-key', '密钥，用于代码上传')
  .description('上传小程序代码')
  .action((...args) => {
    console.log('start deploy')
    deploy(...args).catch(e => {
      setTimeout(() => {
        throw e
      })
    })
  })

commander.program.parse(process.argv)
