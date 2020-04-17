const INSTANTIATION_FAILED = '_something bad happened_';
const INSTANTIATION_SUCCEEDED = 'well at least the user passed in a function';

const { VM, VMScript } = require('vm2');

const assert = require('assert');

class Solver {
	constructor(codeString, testCases) {
		this.testCases = testCases;
		this.code = codeString;
		this.functionName = this.testCases.functionName;
		this.vm = new VM();

		console.log({codeString})
		// Wrap code in parens for eval
		try {
			const script = new VMScript(this.code);
			this.vm.run(script);
		} catch (e) {
			console.error({
				e,
				codeString
			})
			throw new Error(INSTANTIATION_FAILED);
		}
		if (this.vm.run(`typeof(${this.functionName})`) !== 'function') {
			console.error({solution: this.solution, typeOf: typeof(this.solution)})
			throw new Error('code is not a function');
		}
		return void 0;
	}


	score() {
		const maxScore = this.testCases.expectedOutputs.length;
		let userScore = 0;
		const {testCaseInputs, expectedOutputs} = this.testCases;
		for(let i = 0; i < testCaseInputs.length; i++) {	
			const testCaseInput = testCaseInputs[i];
			const expectedOutput = expectedOutputs[i];
			try {
				const solutionOutput = this.vm.run(`${this.functionName}.apply(null, ${testCaseInput})`)
				console.log({solutionOutput, expectedOutput});
				assert.deepStrictEqual(expectedOutput, solutionOutput);
				userScore++;
			} catch (e) {
				console.error('Within score function', e);
				// let us pass for now instead of rethrowing the error
			}
		}

		return {
			maxScore, userScore,
		};
	}
}


exports.Solver = Solver;
