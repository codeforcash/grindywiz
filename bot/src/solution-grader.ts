const kissc = require('./kissc');
const { validateLambdaPayload } = require('./secret');
import { SolutionGrade } from './types/grindywiz';
import { Lambda } from 'aws-sdk';

const convertHumanReadableToBytes = humanReadable => {

	function printpower (n, base, power) {
		if (base === 2) { // 1 << power is approx 10x faster than Math.pow(2, power) 
			return n * (1 << power);
		} else {
			return n * Math.pow(base, power);
		}
	}

	const [n, abbreviation] = humanReadable.split(/\s+/)
	if (abbreviation) {
		if (/K(iB)?$/.test(abbreviation)) {
			return printpower(n, 2, 10)
		} else if (/M(iB)?$/.test(abbreviation)) {
			return printpower(n, 2, 20)
		} else if (/G(iB)?$/.test(abbreviation)) {
			return printpower(n, 2, 30)
		} else if (/T(iB)?$/.test(abbreviation)) {
			return printpower(n, 2, 40)
		} else if (/KB$/.test(abbreviation)) {
			return printpower(n, 10, 3)
		} else if (/MB$/.test(abbreviation)) {
			return printpower(n, 10, 6)
		} else if (/GB$/.test(abbreviation)) {
			return printpower(n, 10, 9)
		} else if (/TB$/.test(abbreviation)) {
			return printpower(n, 10, 12)
		}
	} else {
		return n;	
	}

}

export default class SolutionGrader {

	lambda: Lambda;
	lambdaFunctionName: string;

	constructor(lambda, functionName) {
		this.lambda = lambda;
		this.lambdaFunctionName = functionName;
	}

	gradeSolution(code, currentProblem): Promise<SolutionGrade> {
		const compressedCode = kissc.compress(code);
		return new Promise((resolve) => {


			console.log({
				compressedCode, 
				currentProblem,
				fxn: this.lambdaFunctionName
			});

			this.lambda.invoke({
				FunctionName: this.lambdaFunctionName,
				LogType: 'Tail', 
				Payload: JSON.stringify({ 
					"compressedSolutionString": compressedCode, 
					"testIdInt": currentProblem 
				})
			}, async function(err, data) { 
				if(err) {
					console.error(err); 
					throw err;
				}


				console.log({data});

				const logs = Buffer.from(data.LogResult, 'base64').toString(); 
				console.log({logs});
				const memoryUsedMatch = logs.match(/\tMax Memory Used:\s(\S+\s\S+)\t\n/)
				let bytesUsed, humanReadableMemoryUsage;
				if(memoryUsedMatch) { 
					humanReadableMemoryUsage = memoryUsedMatch[1] 
					bytesUsed = convertHumanReadableToBytes(humanReadableMemoryUsage)
				}


				// @ts-ignore
				const payload = JSON.parse(data.Payload);

				if(payload.statusCode !== 200) {
					throw new Error('Something went wrong')
				}


				const results = JSON.parse(payload.body);

				const { maxScore, userScore, solveTimeMilliseconds, hashSignature } = results;

				const validPayload = await validateLambdaPayload(JSON.stringify({
					maxScore, solveTimeMilliseconds, userScore 
				}), hashSignature).catch((validationError) => {
				
						console.error(validationError);
				});

				if(!validPayload) {
					throw new Error('Something went wrong')
				} 
				
				resolve({
					userScore, maxScore, solveTimeMilliseconds, bytesUsed, humanReadableMemoryUsage
				})


			})

		});

	}

}
