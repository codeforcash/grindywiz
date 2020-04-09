var AWS = require('aws-sdk'),
	region = "us-east-1",
	secretName = "grindywiz_keybase",
	secret,
	decodedBinarySecret;

//Create a Secrets Manager client
var client = new AWS.SecretsManager({
	region: region
});


const getKeybaseCredentials = () => { 

	return new Promise((resolve) => {

		client.getSecretValue({SecretId: secretName}, function(err, data) {
			if (err) {
				if (err.code === 'DecryptionFailureException')
				// Secrets Manager can't decrypt the protected secret text using the provided KMS key.
				// Deal with the exception here, and/or rethrow at your discretion.
					throw err;
				else if (err.code === 'InternalServiceErrorException')
				// An error occurred on the server side.
				// Deal with the exception here, and/or rethrow at your discretion.
					throw err;
				else if (err.code === 'InvalidParameterException')
				// You provided an invalid value for a parameter.
				// Deal with the exception here, and/or rethrow at your discretion.
					throw err;
				else if (err.code === 'InvalidRequestException')
				// You provided a parameter value that is not valid for the current state of the resource.
				// Deal with the exception here, and/or rethrow at your discretion.
					throw err;
				else if (err.code === 'ResourceNotFoundException')
				// We can't find the resource that you asked for.
				// Deal with the exception here, and/or rethrow at your discretion.
					throw err;
			}
			else {
				// Decrypts secret using the associated KMS CMK.
				// Depending on whether the secret is a string or binary, one of these fields will be populated.
				if ('SecretString' in data) {
					secret = data.SecretString;
				}
			}

			const keybaseSecret = JSON.parse(secret);
			const { username, paperkey } = keybaseSecret;
			
			resolve({username, paperkey})
		});

	});


}

module.exports = getKeybaseCredentials;
