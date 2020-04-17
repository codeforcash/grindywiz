const fs = require('fs');
const crypto = require('crypto');

const kissc = require('./kissc');
const {Solver} = require('./solver');
const allTestCases = JSON.parse(fs.readFileSync('problems.json', 'utf8'));


const errorJSON = () => {
	return {
		statusCode: 400,
	};
};


const getHmacKey = () => {
	return new Promise((resolve) => {
		const AWS = require('aws-sdk');
		const secretsManager = new AWS.SecretsManager();
		secretsManager.getSecretValue({SecretId: 'grindywiz_rubric_hmac'}, function(err, data) {
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


const successJSON = async ({maxScore, userScore, solveTimeMilliseconds}) => {
	const hmacKey = await getHmacKey().catch((e) => {
		console.error('Could not get HMAC key.', {e});
	});
	if(!hmacKey) {
		return errorJSON();
	}
	const response = {
		maxScore, solveTimeMilliseconds, userScore
	};
	let responseBody = JSON.stringify(response);
	response.hashSignature = crypto.createHmac('sha256', hmacKey).update(responseBody).digest('base64');
	responseBody = JSON.stringify(response);

	return {
		statusCode: 200,
		body: responseBody,
	};
};

const bigIntNanosecondsToMilliseconds = (ns) => {
	return parseInt((ns/BigInt(1e2)).toString(), 10)/1e4;
};

exports.handler = async (event) => {
	try {
		const problemId = event.testIdInt;
		const code = kissc.decompress(event.compressedSolutionString);
		console.log({event, code})
		const testSuite = allTestCases[problemId];
		const startTime = process.hrtime.bigint();
		const solver = new Solver(code, testSuite);
		const {maxScore, userScore} = solver.score();
		const endTime = process.hrtime.bigint();
		const solveTimeNanoseconds = endTime - startTime;
		const solveTimeMilliseconds = bigIntNanosecondsToMilliseconds(solveTimeNanoseconds);
		return await successJSON({maxScore, userScore, solveTimeMilliseconds});
	} catch (e) {
		console.error(e);
		return errorJSON();
	}
};

