export declare type ProblemList = {
	[key in StringOrNumber]: ProblemDescription;
}

type StringOrNumber = string | number

export declare interface TimerList {
	[username: string]: ReturnType<typeof setTimeout>
}



interface BestMemorySolution {
	minifiedCode: string;
	memoryFootprintBytes: number;
}

interface BestCPUSolution {
	minifiedCode: string;
	executionTimeMilliseconds: number;
}


interface SolutionDescription {
	bestMemory: BestMemorySolution,
	bestCPU: BestCPUSolution
}

interface SolutionList {
	[key: number]: SolutionDescription;
}

interface ProblemDescription {
	testCaseInputs: any[];
	expectedOutputs: any;
	functionName: string;
	returnType: string;
	inputParams: any[];
	statement: string;
}

export declare interface UserList {
	[username: string]: UserData;
}

export declare interface UserData {
	currentProblem: number; 
	lastSolutionReceivedTime: [number, number] | null; 
	awaitingProblem: boolean;
	solutions: SolutionList;
}

export declare interface SolutionGrade {
	humanReadableMemoryUsage: string;
	userScore: number;
	maxScore: number;
	bytesUsed: number;
	solveTimeMilliseconds: number;
}
