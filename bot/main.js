const Bot = require('./bot');


const main = async () => {

	const bot = new Bot();
	await bot.init();

};

async function shutDown() {
	console.error('Going for shutdown')
  process.exit()
}

process.on('SIGINT', shutDown)
process.on('SIGTERM', shutDown)

main();
