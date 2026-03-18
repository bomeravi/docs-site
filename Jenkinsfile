pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    IMAGE = 'bomeravi/docs:latest'
    DOCKERHUB_CREDENTIALS = 'dockerhub-creds'
    KUBECONFIG_FILE_CREDENTIALS = 'kubeconfig'
    K8S_MANIFEST_DIR = 'k8s/kubernetes'
    K8S_NAMESPACE = 'docs'
    SITE_URL = 'https://docs.digi-kube.sajiloapps.com'
    SITE_BASE_URL = '/'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build Static Site') {
      steps {
        sh "DOCS_URL=${SITE_URL} DOCS_BASE_URL=${SITE_BASE_URL} npm run build"
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          docker build \
            --pull \
            --build-arg DOCS_URL=${SITE_URL} \
            --build-arg DOCS_BASE_URL=${SITE_BASE_URL} \
            -t ${IMAGE} .
        '''
      }
    }

    stage('Push Docker Image') {
      when {
        branch 'jenkins'
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: env.DOCKERHUB_CREDENTIALS,
          usernameVariable: 'DOCKERHUB_USER',
          passwordVariable: 'DOCKERHUB_PASS'
        )]) {
          sh '''
            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
            docker push ${IMAGE}
            docker logout
          '''
        }
      }
    }

    stage('Deploy To Kubernetes') {
      when {
        branch 'jenkins'
      }
      steps {
        withCredentials([file(credentialsId: env.KUBECONFIG_FILE_CREDENTIALS, variable: 'KUBECONFIG')]) {
          sh '''
            kubectl apply -f ${K8S_MANIFEST_DIR}/namespace.yaml
            kubectl apply -f ${K8S_MANIFEST_DIR}/cluster-issuer.yaml
            kubectl apply -f ${K8S_MANIFEST_DIR}/deployment.yaml
            kubectl apply -f ${K8S_MANIFEST_DIR}/service.yaml
            kubectl apply -f ${K8S_MANIFEST_DIR}/ingress.yaml
            kubectl -n ${K8S_NAMESPACE} rollout restart deployment/docs
            kubectl -n ${K8S_NAMESPACE} rollout status deployment/docs --timeout=300s
          '''
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
