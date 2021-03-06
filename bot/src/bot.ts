import KeybaseBot = require('keybase-bot');

import { Lambda } from 'aws-sdk';
const fs = require('fs');
const { getKeybaseCredentials } = require('./secret');
import SolutionGrader from './solution-grader';
import StateManager from './state-manager';

import { MsgSummary, ChatChannel } from './node_modules/keybase-bot/lib/types/chat1/index.js'
import { TimerList, SolutionGrade, UserList, ProblemList, UserData } from './types/grindywiz'

const minify = (code) => {
	return new Promise(async (resolve) => {
		let output;
		try {
			output = require("@babel/core").transform(code, {
				"plugins": ["const-enum", "@babel/transform-typescript"],
				"presets": [["@babel/env", {}],["minify", {
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


export default class Bot {

	bot: KeybaseBot;
	timers: TimerList;
	users: UserList;
	problems: ProblemList;
	lambdaFunctionName: string;
	solutionGrader: SolutionGrader;
	stateManager: StateManager;
	lambda: Lambda;

	constructor() {
		this.bot = new KeybaseBot();	
		this.stateManager = new StateManager(this.bot, 'keybase');
		this.users = {};
		this.timers = {};
		const problemsJson = `${process.cwd()}/problems.json`;
		console.log({problemsJson})
		try {
			this.problems = JSON.parse(fs.readFileSync(problemsJson, 'utf8'));
		} catch(e) {
			this.problems = JSON.parse(fs.readFileSync(`../${fs.readlinkSync(problemsJson)}`, 'utf8'));
		}
	}

	async init() {
		try {
			console.log('Await retrieval of Lambda function name ...');
			this.lambdaFunctionName = await this.getLambdaFunctionName();
			console.log('Received lambda fxn name: ', this.lambdaFunctionName);
			const creds = await getKeybaseCredentials().catch((credentialsError) => {
				console.error('Error fetching bot credentials');
				process.exit();
			});

			await this.bot.init(creds.username, creds.paperkey, {verbose: false})
			console.log(`Bot is logged in as ${this.bot.myInfo().username}`)
			this.users = await this.stateManager.loadUserState();
			setInterval(() => {
				this.stateManager.setUserState(this.users);
			}, 1000 * 60);


			await this.bot.chat.clearCommands()
			await this.bot.chat.advertiseCommands({
				advertisements: [
					{
						type: 'public',
						commands: [
							{
								name: 'goto',
								description: 'Go to problem #[problem-number]',
								usage: '!goto [problem-number]',
								extendedDescription: {
									title: 'Example usage',
									desktopBody: "\n!goto 0`",
									mobileBody: '!goto 0'
								}
							},
							{
								name: 'leaderboard',
								description: 'List the people with the best solutions',
								usage: '!leaderboard'
							}
						],
					},
				],
			})

			await this.bot.chat.send(this.makeChannel('zackburt'), { body: 'Bot restarted' })
			console.log('Init message sent!')
			await this.bot.chat.watchAllChannelsForNewMessages(this.onMessage.bind(this), this.onError)
		} catch (botInitError) {
			console.error('Something went wrong with bot init');
			console.error({botInitError})
		}
	}

	onError(e) {
		console.error(e)
	}


	shareLeaderboard() {

		const leaderboard = {

		};
		for(const username in this.users) {
			const solutions = this.users[username].solutions;
			for(const problemId in solutions) {

				if(leaderboard[problemId] === void 0) {
					leaderboard[problemId] = {
						bestCPU: {
							value: Infinity,
						},
						bestMemory: {
							value: Infinity,
						}
					};
				}


				const solution = solutions[problemId];

				if(solution.bestCPU.executionTimeMilliseconds < leaderboard[problemId].bestCPU.value) {
					leaderboard[problemId].bestCPU = {
						value: solution.bestCPU.executionTimeMilliseconds,
						username
					}
				}
				if(solution.bestMemory.memoryFootprintBytes < leaderboard[problemId].bestMemory.value) {
					leaderboard[problemId].bestMemory = {
						value: solution.bestMemory.memoryFootprintBytes, 
						username
					}
				}
			}
		
		}
		return JSON.stringify(leaderboard);

	}

	static formatLeaderboard(leaderboardJSON) {


		const leaderboard = JSON.parse(leaderboardJSON);
		let response = `Leaderboard\n`;
		for(const problemId in leaderboard) {
			
			const {bestCPU, bestMemory} = leaderboard[problemId];
			response += "\n";
			response += `>Problem ${problemId}\n\n`;
			response += `Best CPU: @${bestCPU.username} with ${bestCPU.value}ms`;
			response += "\n";
			response += `Best memory: @${bestMemory.username} with ${bestMemory.value} bytes`; 

		}
		return response;

	}

	onMessage(messageSummary: MsgSummary) {
		const { id: messageId, content, conversationId, sender } = messageSummary;
		const { username } = sender;
		const { text, edit, metadata } = content;
		if(edit) {
			return;
		}
		if(!text) {
			return;
		}
		const { body } = text;
		if(!body) {
			return;
		}


		if(body.startsWith('!goto')) {

			let destinationProblem = parseInt(body.substr(6), 0);
			this.users[username].currentProblem = destinationProblem;
			this.shareProblem(username, this.users[username].currentProblem);
			this.bot.chat.send(this.makeChannel(username), { body: `All right, we have reset you to problem #${destinationProblem}` });
			return;

		}
		if(body.startsWith('!leaderboard')) {
			this.bot.chat.send(this.makeChannel(username), { body: Bot.formatLeaderboard(this.shareLeaderboard()) });
			return;
		}

		let userState = this.getUserState(username);
		if(userState.awaitingProblem) {
			this.shareProblem(username, userState.currentProblem); 
			return;
		}
		// check that body matches a regex - ```[^`]+[functionName][^`]+```		
		// if not, tell the user how to format their response

		const { statement, functionName, inputParams, returnType } = this.problems[userState.currentProblem];
		const expectedSolutionFormatRegexp = new RegExp("```[^`]+" + functionName + "[^`]+```");
		if(!expectedSolutionFormatRegexp.test(body)) {
			let body = `${statement}\n\nPlease name your function \`${functionName}\` and define your code using Keybase style for code formatting; `;
			this.bot.chat.send(conversationId, { body });
			return;	
		}

		// Ignore if <60s since last submit 
		if(userState.lastSolutionReceivedTime) {
			if(process.hrtime(userState.lastSolutionReceivedTime)[0] < 60) {
				return;
			}
		}

		this.users[username].lastSolutionReceivedTime = process.hrtime();

		this.timers[username] = setTimeout(() => {
			this.bot.chat.send(conversationId, {
				body: "It's been 60 seconds since your most recent solution.  Feel free to submit another!" });
		}, 60 * 1000);

		const userSolution = body.replace(/^```/,'').replace(/```$/,'');
		minify(userSolution).then(async (code: string) => {

			this.bot.chat.react(conversationId, messageId, ':+1:') 
			this.bot.chat.send(conversationId, {
				body: "Solution received!  You'll get feedback as soon as we grade it!  Either way, please wait 60 seconds before your next submission."
			})

			this.solutionGrader.gradeSolution(code, userState.currentProblem).then((feedback) => {

				this.handleFeedback(username, code, feedback);

			}).catch((e) => {

				this.bot.chat.send(conversationId, {
					body: 'Something went wrong with the bot or your code.  Have you tried validating it locally?  Is it efficient with respect to computational complexity?  Please wait 60 seconds before resubmitting.'
				});

			});

		}).catch(async () => {


			await this.bot.chat.react(conversationId, messageId, ':-1:') 
			this.bot.chat.send(conversationId, {
				body: 'Are you sure this is valid?  Try again in a new message, but please wait 60 seconds.'
			});

		});


	}

	getUserState (username): UserData {
		if(!(username in this.users)) {
			this.users[username] = {
				currentProblem: 0,
				lastSolutionReceivedTime: null,
				awaitingProblem: true,
				solutions: {}
			}
		}
		return this.users[username];
	}

	shareProblem (username: string, problem: number) {
		if(!(problem in this.problems)) {
			const body = 'Well done!  You have exhausted all of the problems.  Check back later.'
			this.bot.chat.send(this.makeChannel(username), { body });
			return;
		}
		this.users[username].awaitingProblem = false;
		const { statement, functionName, inputParams, returnType } = this.problems[problem];
		let body = `${statement}\n\nPlease name your function \`${functionName}\` and define your code using Keybase style for code formatting; `;
		body = body.concat(`i.e., wrapped in triple backticks.\n\n`); 
		body = body.concat(`For example:\n\n`);
		body = body.concat(`\`\`\`function ${functionName}(${inputParams.join(', ')}) {\n    \/\/ do something\n    return ${returnType};\n}\`\`\``);
		this.bot.chat.send(this.makeChannel(username), { body } )
	}

	makeChannel(username): ChatChannel {

		return {
			name: username + ',' + this.bot.myInfo().username, 
			public: false, 
			topicType: 'chat' 
		}
	}

	updateHighScore(username: string, code: string, bytesUsed: number, solveTimeMilliseconds: number, currentProblem: number) {

		if(!('solutions' in this.users[username])) {
			this.users[username].solutions = {}
		}
		if(!(currentProblem in this.users[username].solutions)) {
			this.users[username].solutions[currentProblem] = {
				bestMemory: {
					minifiedCode: code,
					memoryFootprintBytes: bytesUsed
				},
				bestCPU: {
					minifiedCode: code,
					executionTimeMilliseconds: solveTimeMilliseconds
				}
			}
			return;
		}

		const {bestMemory, bestCPU} = this.users[username].solutions[currentProblem];

		if(bytesUsed < bestMemory.memoryFootprintBytes) {
			this.users[username].solutions[currentProblem].bestMemory = {
				minifiedCode: code,
				memoryFootprintBytes: bytesUsed 
			}
		}
		if(solveTimeMilliseconds < bestCPU.executionTimeMilliseconds) {
			this.users[username].solutions[currentProblem].bestCPU = {
				minifiedCode: code,
				executionTimeMilliseconds: solveTimeMilliseconds
			}
		}
	}



	async handleFeedback(username: string, code: string, feedback: SolutionGrade) {
		let body = '';
		if(feedback.userScore === feedback.maxScore) {
			body = body.concat("Well done! A perfect score.\n\n");
			body = body.concat(`Memory used: \`${feedback.humanReadableMemoryUsage}\` (\`${feedback.bytesUsed} bytes\`) – including overhead\n`);
			body = body.concat(`Solve time: \`${feedback.solveTimeMilliseconds}ms\``)
			this.updateHighScore(username, code, feedback.bytesUsed, feedback.solveTimeMilliseconds, this.users[username].currentProblem);
			this.bot.chat.send(this.makeChannel(username), { body });	
			this.users[username].currentProblem++;
			this.users[username].awaitingProblem = true;

			if(username in this.timers) {
				clearTimeout(this.timers[username]);
				delete this.timers[username];
			}

			return;
		} else {

			const pct: string = `${~~(100 * (feedback.userScore / feedback.maxScore)).toString()}%`;
			body = body.concat(`Unfortunately, you only solved ${pct} of the test cases.  Think it through and try again in a minute!`); 
			this.bot.chat.send(this.makeChannel(username), {body});
			return;

		}
	}

	getLambdaFunctionName(): Promise<string> {
		return new Promise((resolve) => {

			this.lambda = new Lambda({region: 'us-east-1'});
			console.log('Init of AWS Lambda object');
			this.lambda.listFunctions({}, (err, data) => { 
				console.log('Running list functions callback');
				if(err) {
					console.error({err});
				}
				for(const fxn of data.Functions) {
					if(/GrindyWiz/.test(fxn.FunctionName)) { // We don't hard-code since name is generated by CloudFormation
						this.solutionGrader = new SolutionGrader(this.lambda, fxn.FunctionName);
						resolve(fxn.FunctionName);
						return;
					}
				}
			})
		});
	}

}
