pipeline {
  agent { node('master')}
  
  parameters {
    string(name: 'MP_VERSION', defaultValue: '', description: 'like 1.0.0')
  }

  environment {
    CI_COMMIT_SHA = 'ci_commit_hash'
    COMMIT_CHECKOUT = 'commit_checkout_version'
  }

  stages {
    stage('Setup') {
      steps {
        nodejs('nodejs') {
          setup()
        }
      }
    }

    stage('Deploy') {
      environment {
        WX_UPLOAD_SECRET = credentials('WX_UPLOAD_SECRET')
      }

      steps {
        nodejs('nodejs') {
          buildPkg()
          deploy()
        }
      }
    }
  }
}

def info() {
  sh 'node -v'
  sh 'npm -v'
  sh 'yarn -v'
  sh 'env'
}

def setup() {
  info()
  CI_COMMIT_SHA = sh(script: "git log -n 1 --pretty=format:'%h'", returnStdout: true).trim()
  COMMIT_CHECKOUT = GIT_COMMIT

  sh 'yarn config set registry http://registry.npm.taobao.org'
  sh 'yarn install'
}

def buildPkg() {
  // sh "rm -rf ./dist"
  // sh 'yarn build:prod'
}

def deploy() {
  String branch = """${GIT_BRANCH.replace('origin/', '').replace('/', '')}"""
  String version = "${branch}.${CI_COMMIT_SHA}"
  String description = sh(returnStdout: true, script: 'git log --pretty=format:"[%h][%an] (%s)" -1').trim().replaceAll("\"", "")

  sh """node deploy/deploy.js deploy --versions \"${version}\" --descriptions \"${description}\" --robot 2 --private-key ${WX_UPLOAD_SECRET}"""
}
