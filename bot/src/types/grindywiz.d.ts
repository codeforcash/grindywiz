export declare type ProblemList = {
	[key in StringOrNumber]: ProblemDescription;
}

type StringOrNumber = string | number

interface ProblemDescription {
	testCaseInput: any[];
	expectedOutput: any;
	functionName: string;
	returnType: string;
	inputParams: any[];
	statement: string;
}

export declare interface UserList {
	[username: string]: UserData;
}

export declare interface UserData {
	currentProblem: number | null; 
	lastSolutionReceivedTime: [number, number] | null; 
}

export declare interface SolutionGrade {
	userScore: number;
	maxScore: number;
	bytesUsed: number;
	solveTimeMilliseconds: number;

}
