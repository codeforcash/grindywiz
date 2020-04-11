# Development

sam local invoke

# Deployment

`sam package --template-file template.yaml --s3-bucket grindywiz --output-template-file rubric-packaged.yaml`
`sam deploy --template-file /Users/zackburt/grindywiz/rubric/rubric-packaged.yaml --stack-name grindywiz-rubric --capabilities CAPABILITY_IAM`

