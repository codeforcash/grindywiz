const INSTANTIATION_FAILED = '_something bad happened_';
const INSTANTIATION_SUCCEEDED = 'well at least the user passed in a function';

const assert = require('assert');

class Solver {
	constructor(codeString, testCases) {
		this.testCases = testCases;
		this.code = codeString;

		console.log({codeString})
		// Wrap code in parens for eval
		if (this.code[0] !== '(' && this.code[this.code.length - 1] !== ')') {
			this.code = `(${this.code})`;
		}
		try {
			this.solution = eval(this.code);
		} catch (e) {
			throw new Error(INSTANTIATION_FAILED, e);
		}
		if (typeof(this.solution) !== 'function') {
			console.error({solution: this.solution, typeOf: typeof(this.solution)})
			throw new Error('code is not a function');
		}
		return void 0;
	}


	score() {
		const maxScore = this.testCases.length;
		let userScore = 0;
		for (const {testCaseInput, expectedOutput} of this.testCases) {
			try {
				const solutionOutput = this.solution.apply(null, testCaseInput);
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

/*


const main = async () => {


	console.log(1)

//	const code = `function myman() { console.log('hello, world');return 3;}`
	let code = 'Function`$${atob`YWxlcnQoMSk=`}```'
	const x = eval(`(${code})`)
	console.log(typeof(x));
	x.call(null)

	console.log(2)
	const result = await encode(code).catch((e) => {
		console.error(e);
	});
	console.log({result})
}


const encode = (code) => {

	console.log({code})
	return new Promise(async (resolve) => {

		let output;
		try {
				output = require("@babel/core").transform(code, {
					"plugins": ["const-enum", "@babel/transform-typescript"],
					"presets": [["minify", {
						"keepFnName": true
					}]]
				})
		} catch(e) {
			console.error(e);
			throw e;
		}

		resolve(output.code);
	});
}


main()
/*
let solver;
try {
	solver = new Anagram(`(${code})`);
} catch(e) {
	// pass for now...
}
if(solver) {

	solver.case1();

} else {


	// This is where we indicate failure and score 0
	console.log({
		solver
	})

}

*/
