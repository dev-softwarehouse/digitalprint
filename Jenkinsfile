#!groovy

def gitCommit = ""
def shortCommit = ""
def buildBranches = []

final ansiColorMapName = 'xterm'

node('digitalprint'){
  wrap([$class: 'AnsiColorBuildWrapper', colorMapName: ansiColorMapName]) {
    configFileProvider([configFile(fileId: 'slave_ssh_config', targetLocation: '.ssh/config')]) {
      stage('checkout') {
        def scmVars = checkout scm
        gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
        shortCommit = gitCommit.take(6)
        releaseVersion = sh(returnStdout: true, script: 'echo "${BRANCH_NAME#release/*}"').trim()
      }
      def app
      stage('Build image') {
        app = docker.build("dp-static:${gitCommit}", "-f ./docker/static/Dockerfile .")
      }
      milestone()
      stage('Test image') {
        app.inside {
          sh 'env'
        }
      }
      if (BRANCH_NAME in buildBranches || BRANCH_NAME =~ /(release|hotfix)\/.*/) {
        milestone()
          stage('Push image') {
          docker.withRegistry('https://registry.dreamsoft.pro', 'registry-dreamsoft-credentials') {
            app.push("${gitCommit}")
            app.push("latest")
            if (releaseVersion) {
              app.push("${releaseVersion}")
            }
          }
        }
      }
    }
  }
}
