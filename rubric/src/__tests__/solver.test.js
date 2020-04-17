const { Solver } = require ('../solver');
const fs = require('fs')

 
let problemsFile = 'problems.json';
 

const allTestCases = JSON.parse(fs.readFileSync(problemsFile, 'utf8'))
const assert = require('assert');

test('Load up the test cases and validate input format', () => {

	for(const problemId in allTestCases) {
		const testSuite = allTestCases[problemId]; 
		expect('testCaseInputs' in testSuite).toBeTruthy();
		expect('expectedOutputs' in testSuite).toBeTruthy();
		expect(testSuite.testCaseInputs.length).toBe(testSuite.expectedOutputs.length);
	}

})


// Test case 0

test('Solution for problem 0 should pass all test cases and achieve max score', () => {
	let code = `function knockKnock() { return "Who's there?"; }`
	const solver = new Solver(code, allTestCases[0])
	const { maxScore, userScore } = solver.score();
	expect(userScore).toBe(maxScore);
})


