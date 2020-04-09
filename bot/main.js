const getKeybaseCredentials = require('./secret');
const Bot = require('keybase-bot');


const main = async () => {

	const creds = await getKeybaseCredentials();
	const bot = new Bot()
	try {
		await bot.init(creds.username, creds.paperkey, {verbose: false})
		console.log(`Your bot is initialized. It is logged in as ${bot.myInfo().username}`)
		const channel = {name: 'zackburt'+ ',' + bot.myInfo().username, public: false, topicType: 'chat'}
		const message = {
			body: `Hello Zack! This is ${bot.myInfo().username} saying hello from my device ${bot.myInfo().devicename}`,
		}
		await bot.chat.send(channel, message)
		console.log('Message sent!')
	} catch (error) {
		console.error(error)
	} finally {
		await bot.deinit()
	}

};

main();


