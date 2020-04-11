const INSTANTIATION_FAILED = '_something bad happened_';
const INSTANTIATION_SUCCEEDED = 'well at least the user passed in a function';

class Anagram {


	constructor(code) {
		try {
			this.solution = eval(code); 
		} catch(e) {
			throw new Error(INSTANTIATION_FAILED);
		}
		if(typeof(this.solution) !== 'function') {
			throw new Error(INSTANTIATION_FAILED);
		}
		return void 0;
	}


	case1() {

		const words = ['act', 'cat', 'actor', 'tractor', 'racecar'];
		const output = this.solution.call(null, words)
		console.log({
			output
		});

	}
	

}





const main = async () => {


	console.log(1)

//	const code = `function myman() { console.log('hello, world');return 3;}`
	let code = 'Function`$${atob`YWxlcnQoMSk=`}```'
	const x = eval(`(${code})`)
	console.log(typeof(x));
	x.call(null)
	
	console.log(2)
	const result = await encode(code).catch((e) => {
		console.error(e);
	});
	console.log({result})
}



const encode = (code) => {

	console.log({code})
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


main()
/*
let solver;
try {
	solver = new Anagram(`(${code})`);
} catch(e) {
	// pass for now...
}
if(solver) {
	
	solver.case1();

} else {


	// This is where we indicate failure and score 0
	console.log({
		solver
	})

} 

*/ 
