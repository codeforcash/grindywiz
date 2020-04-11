# Development

`echo '{"compressedSolutionString":"'Ā䈮䨞ૠ槼䫄ᐸ䈴Ⳅ妤ᒡᬎ潎䱃స崽勲姂పᤵȯ⸜㽷礭⨐磰'", "testIdInt":0}' | sam local invoke -e -`

# Deployment

`sam package --template-file template.yaml --s3-bucket grindywiz --output-template-file rubric-packaged.yaml`
`sam deploy --template-file /Users/zackburt/grindywiz/rubric/rubric-packaged.yaml --stack-name grindywiz-rubric --capabilities CAPABILITY_IAM`

