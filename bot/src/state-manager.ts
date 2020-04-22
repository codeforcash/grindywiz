import KeybaseBot = require('keybase-bot');
import { UserList } from './types/grindywiz'

const STORAGE_KEY = 'user_state';

export default class StateManager {

	storageEngine: string;
	bot: KeybaseBot;

	constructor(bot, storageEngine) {
		this.bot = bot;
		this.storageEngine = storageEngine;
	}

	namespace() {
		return `${this.storageEngine}_grindywiz`;
	}

	async loadUserState() {
		switch(this.storageEngine) {
			case 'keybase':
				return this.loadUserStateFromKeybase();
				break;
			default:
				break;
		}
	}

	setUserState(userState) {
		switch(this.storageEngine) {
			case 'keybase':
				this.setUserStateFromKeybase(userState);
				break;
			default:
				break;
		}
	}

	loadUserStateFromKeybase(): Promise<UserList> {

		return new Promise((resolve) => {

			this.bot.kvstore.get(this.bot.myInfo().username, this.namespace(), STORAGE_KEY).then(({revision, entryValue}) => { 
				console.log({entryValue});
				resolve(JSON.parse(entryValue)) 
			}).catch((e) => {
				console.error('Error retrieving kv store value', {e});
				resolve({});
			});

		});

	}


	setUserStateFromKeybase(userState) {

		this.bot.kvstore.put(this.bot.myInfo().username, this.namespace(), STORAGE_KEY, JSON.stringify(userState)).then(({entryKey, revision}) => { 
			console.log('Updated user state to Keybase KV', {entryKey, revision})
		}).catch((e) => {
			console.error('Could not update user state', {e});
		});



	}

}
