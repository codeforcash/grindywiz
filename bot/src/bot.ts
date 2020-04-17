import KeybaseBot = require('keybase-bot');

import { Lambda } from 'aws-sdk';
const fs = require('fs');
const { getKeybaseCredentials } = require('./secret');
import SolutionGrader from './solution-grader';

import { MsgSummary, ChatChannel } from './node_modules/keybase-bot/lib/types/chat1/index.js'
import { SolutionGrade, UserList, ProblemList, UserData } from './types/grindywiz'

const minify = (code) => {
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

export default class Bot {
	
	bot: KeybaseBot;
	users: UserList;
	problems: ProblemList;
	lambdaFunctionName: string;
	solutionGrader: SolutionGrader;
	lambda: Lambda;

	constructor() {
		this.bot = new KeybaseBot();	
		this.users = {};
		this.problems = JSON.parse(fs.readFileSync('problems.json', 'utf8'));
	}

	async init() {
		try {
			this.lambdaFunctionName = await this.getLambdaFunctionName();
			const creds = await getKeybaseCredentials().catch((credentialsError) => {
				console.error('Error fetching bot credentials');
				process.exit();
			});
			await this.bot.init(creds.username, creds.paperkey, {verbose: false})
			console.log(`Bot is logged in as ${this.bot.myInfo().username}`)
			const message = {
				body: `Bot restarted.`,
			}
			await this.bot.chat.send(this.makeChannel('zackburt'), message)
			console.log('Init message sent!')
			await this.bot.chat.watchAllChannelsForNewMessages(this.onMessage.bind(this), this.onError)
		} catch (error) {
			console.error(error)
		}
	}

	onError(e) {
		 console.error(e)
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
		let userState = this.getUserState(username);
		if(userState.currentProblem === null) {
			this.users[username].currentProblem = 0;
			this.shareProblem(username, 0); 
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

		setTimeout(() => {
			this.bot.chat.send(conversationId, {
				body: "It's been 60 seconds since your most recent solution.  Feel free to submit another!" });
		}, 60 * 1000);

		minify(body).then(async (code) => {
		
			this.bot.chat.react(conversationId, messageId, ':+1:') 
			this.bot.chat.send(conversationId, {
				body: "Solution received!  You'll get feedback as soon as we grade it!  Either way, please wait 60 seconds before your next submission."
			})
			
			this.solutionGrader.gradeSolution(code, userState.currentProblem).then((feedback) => {

				this.handleFeedback(username, feedback);

			}).catch((e) => {

				this.bot.chat.send(conversationId, {
					body: 'Something went wrong with the bot or your code. Sorry!  Please wait 60 seconds before resubmitting.'
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
				currentProblem: null,
				lastSolutionReceivedTime: null
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

	async handleFeedback(username: string, feedback: SolutionGrade) {
		let body = '';
		if(feedback.userScore === feedback.maxScore) {
			body = body.concat("Well done! A perfect score.\n\n");
			body = body.concat("Memory used: ${feedback.bytesUsed} bytes\n");
			body = body.concat("Solve time: ${feedback.solveTimeMilliseconds}ms")
			this.bot.chat.send(this.makeChannel(username), { body });	
			this.users[username].currentProblem++;
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
			this.lambda.listFunctions({}, (err, data) => { 
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
