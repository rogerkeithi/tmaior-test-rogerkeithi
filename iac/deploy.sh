#!/bin/bash
AWS_IMAGE=$1
AWS_IMAGE_TAG=$2
AWS_REGION=$3
AWS_ACCOUNT_ID=$4
AWS_ACCESS_KEY_ID=$5
AWS_SECRET_ACCESS_KEY=$6

echo "Build the application"
npm install
npm run build

echo "Setting up AWS CLI"
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set region $AWS_REGION

echo "Login on AWS ECR"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Verifying AWS ECR Repo"
aws ecr describe-repositories --repository-names $AWS_IMAGE || aws ecr create-repository --repository-name $AWS_IMAGE

echo "Building docker image"
docker build -f dockerfile -t $AWS_IMAGE .
docker tag $AWS_IMAGE:$AWS_IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_IMAGE:$AWS_IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_IMAGE:$AWS_IMAGE_TAG

echo "Setting up SSH"
chmod 400 "ec2-tmaior-test-key.pem"
ssh -i "ec2-tmaior-test-key.pem" ubuntu@ec2-18-234-171-130.compute-1.amazonaws.com

echo "Docker pull"
docker stop $(docker ps -a -q)
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_IMAGE:$AWS_IMAGE_TAG
docker run -p 3000:3000 $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_IMAGE:$AWS_IMAGE_TAG