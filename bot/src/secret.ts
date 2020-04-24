
import * as crypto from 'crypto';

var AWS = require('aws-sdk'),
	region = "us-east-1",
	keybaseCredentialsSecretName = "grindywiz_keybase",
	lambdaHmacSecretName = 'grindywiz_rubric_hmac',
	secret,
	decodedBinarySecret;

//Create a Secrets Manager client
const secretsManager = new AWS.SecretsManager({
	region: region
});

const getHmacKey = (): Promise<string> => {
	return new Promise((resolve) => {
		secretsManager.getSecretValue({SecretId: lambdaHmacSecretName}, function(err, data) {
			if (err) {
				console.error(err);
				throw err;
			} else {
				if ('SecretString' in data) {
					resolve(JSON.parse(data.SecretString).key);
				} else {
					throw new Error();
				}
			}
		});
	});
};

const validateLambdaPayload = (resultsString: string, payloadSignature: string) => {

	return new Promise(async (resolve) => {

		console.log({resultsString, payloadSignature});
		const hmacKey: string | void = await getHmacKey().catch((e) => {
			console.error('Could not get HMAC key.', {e});
		});
		if(!hmacKey) {
			throw new Error('');	
		}
		const hmac = crypto.createHmac('sha256', hmacKey);
		const generatedSignature = hmac.update(resultsString).digest('base64');
		console.log({hmacKey, generatedSignature, payloadSignature});

		// @ts-ignore
		resolve(payloadSignature === generatedSignature);

	})

}

const getKeybaseCredentials = () => { 

	return new Promise((resolve) => {

		secretsManager.getSecretValue({SecretId: keybaseCredentialsSecretName}, function(err, data) {
			if (err) {
				console.error('Error fetching secretID: ', keybaseCredentialsSecretName, {err});

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



			console.log('Secret data: ', { data });
			const keybaseSecret = JSON.parse(data.SecretString);
			const { username, paperkey } = keybaseSecret;
			
			resolve({username, paperkey})
		});

	});


}

module.exports = { getKeybaseCredentials, validateLambdaPayload };
