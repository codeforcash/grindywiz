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

const onMessage = async (messageSummary) => {
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
	let userState = getUserState(username);
	if(userState.currentProblem === null) {
		this.users[username].currentProblem = 0;
		this.shareProblem(username, 0); 
		return;
	}
	// check that body matches a regex - ```[^`]+[functionName][^`]+```		
	// if not, tell the user how to format their response

	const { statement, functionName, inputParams, returnType } = this.problems[problem];
	const expectedSolutionFormatRegexp = new RegExp("```[^`]+" + functionName + "[^`]+```");
	if(!expectedSolutionFormatRegexp.test(body) {
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
		}
		
		this.bot.gradeSolution(code, userState.currentProblem).then((feedback) => {

			this.bot.handleFeedback(username, feedback);

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


module.exports = onMessage;
