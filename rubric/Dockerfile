FROM node:lts-buster-slim 
RUN mkdir /app 
WORKDIR /app
RUN mkdir src/
WORKDIR src/
COPY src/ ./
RUN rm -f yarn.lock package-lock.json
RUN npm install
RUN npm test
RUN rm -rf node_modules
RUN rm -rf __tests__
RUN rm -f yarn.lock package-lock.json
RUN npm install --production
WORKDIR /app
COPY template.yaml .
RUN apt-get update && apt-get install -y python3-pip
RUN pip3 install aws-sam-cli
RUN sam package --template-file template.yaml --s3-bucket grindywiz --output-template-file rubric-packaged.yaml
RUN sam deploy --template-file /app/rubric-packaged.yaml --stack-name grindywiz-rubric --capabilities CAPABILITY_IAM --region us-east-1
