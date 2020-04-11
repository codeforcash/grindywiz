const { Solver } = require ('../src/solver');
const fs = require('fs')
const allTestCases = JSON.parse(fs.readFileSync('../src/problems.json', 'utf8'))
const assert = require('assert');

console.log({Solver})

console.log({allTestCases})

// Load up the test cases and validate input format
for(const problemId in allTestCases) {
	const testSuite = allTestCases[problemId]; 
	for(const testCase of testSuite) {
		assert.ok('testCaseInput' in testCase);
		assert.ok('expectedOutput' in testCase);
	}
}



// Test case 0

let code = `function knockKnock() { return "Who's there?"; }`
const solver = new Solver(code, allTestCases[0])
const { maxScore, userScore } = solver.score();
console.log({maxScore, userScore});
assert.deepStrictEqual(maxScore, userScore);



