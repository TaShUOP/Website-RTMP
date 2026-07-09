pipeline {
    agent {
        label 'Main'
    }

    environment {
        IMAGE_NAME = "wc26-live"
        CONTAINER_NAME = "wc26-live"

        SERVER_URL = "https://streams.ra9.cloudns.asia/live"
        SOCKET_URL = "https://streamc.ra9.cloudns.asia"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Create Frontend Environment') {
            steps {
                withCredentials([
                    string(credentialsId: 'stream-key', variable: 'STREAM_KEY')
                ]) {

                    writeFile file: 'frontend/.env.production', text: """
VITE_SERVER_URL=${SERVER_URL}
VITE_SOCKET_URL=${SOCKET_URL}
VITE_STREAM_KEY=${STREAM_KEY}
"""
                }
            }
        }

        stage('Build Docker Image') {
            steps {
		sh "whoami"
                sh """
                    docker build \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        stage('Stop Existing Container') {
            steps {
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                """
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                    docker run -d \
                        --restart unless-stopped \
                        --name ${CONTAINER_NAME} \
                        -p 3342:3342 \
                        -p 3343:3343 \
                        -p 3344:3344 \
                        -p 8865:8865 \
                        ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Deployment Successful!"
            sh "docker ps"
        }

        failure {
            echo "Deployment Failed!"
        }

        always {
            cleanWs()
        }
    }
}