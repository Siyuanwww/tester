const { R_OK, W_OK, X_OK, SIGKILL } = require('constants');
const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const execFile = require('child_process').execFile;
const execFileSync = require('child_process').execFileSync;
const read = require('readline-sync');
const Promise = require('bluebird');

// basic configuration
const win32 = (process.platform == 'win32');
const pwd = (() => {
	let str = process.env.PWD.replace(/\\/g, '/');
	return str.endsWith('/') ? str.substr(0, str.length - 1) : str;
})();
const path = {
	src: pwd,
	bin: pwd + '/test'
};

// user configuration
const defaultCompileOption = '-g -Wall -Wextra -ftrapv -std=c++11 -O2' + (win32 ? ' -Wl,--stack=536870912' : '');
const defaultTimeLimit = 1000, defaultMaximumTimeLimit = 5000;

// message
const style = {
	sReset: '\x1b[0m',
	sBidge: '\x1b[1m',
	sBlink: '\x1b[5m',
	wBlack: '\x1b[30m',
	wRed: '\x1b[31m',
	wGreen: '\x1b[32m',
	wYellow: '\x1b[33m',
	wBlue: '\x1b[34m',
	wMagenta: '\x1b[35m',
	wCyan: '\x1b[36m',
	wWhite: '\x1b[37m',
	gBlack: '\x1b[40m',
	gRed: '\x1b[41m',
	gGreen: '\x1b[42m',
	gYellow: '\x1b[43m',
	gBlue: '\x1b[44m',
	gMagenta: '\x1b[45m',
	gCyan: '\x1b[46m',
	gWhite: '\x1b[47m',
};
const fmt = {
	time(t1, t2) {
		return `Time: std ${(t1 / 1000).toFixed(2)}s, usr ${(t2 / 1000).toFixed(2)}s`;
	},
	error(err) {
		return `Message: ${err}`;
	},
};
const msg = {
	echo(content, { exit = false } = {}) {
		console.log(content);
		if (exit) {
			process.exit(1);
		}
	},
	error(err) {
		msg.echo(`\n\n\n${style.wWhite}${style.gRed}Error: ${err}${style.sReset}`, { exit: true });
	},
	AC(time1, time2) {
		msg.echo(`${style.wGreen}Accepted${style.sReset} | ${fmt.time(time1, time2)}`);
	},
	PC(time1, time2, point, err) {
		msg.echo(`${style.wGreen}Partially Correct${style.sReset} | Points: ${point} | ${fmt.time(time1, time2)} | ${fmt.error(err)}`);
	},
	WA(err) {
		msg.echo(`${style.wRed}Wrong Answer${style.sReset} | ${fmt.error(err)}`, { exit: true });
	},
	WF(err) {
		msg.echo(`${style.wRed}Wrong Output Format${style.sReset} | ${fmt.error(err)}`, { exit: true });
	},
	TLE() {
		msg.echo(`${style.wBlue}Time Limit Exceeded${style.sReset}`, { exit: true });
	},
	RE() {
		msg.echo(`${style.wYellow}Runtime Error${style.sReset}`, { exit: true });
	},
	MLE() {
		msg.echo(`${style.wMagenta}Memory Limit Exceeded${style.sReset}`, { exit: true });
	}
};

// classes
class Program {
	constructor(source, binary) {
		this.src = {
			base: source,
			full: path.src + '/' + source,
		};
		this.bin = {
			base: binary + (win32 ? '.exe' : ''),
			full: path.bin + '/' + binary + (win32 ? '.exe' : ''),
			type: binary,
		};
	}
};
class Data {
	constructor(file) {
		this.base = file;
		this.full = path.bin + '/' + file;
	}
};
class Shell {
	constructor(file) {
		this.base = file;
		this.full = path.bin + '/' + file;
	}
};

// variables
let usr, std, gen, spj;
let inf, ouf, ans;
let usrShell, stdShell, genShell, spjShell;
let needCompile = true, needSpecial = false;
let compileOption, timeLimit;

// functions
async function readable(path) {
	return await new Promise((resolve) => {
		fs.access(path, R_OK, (err) => {
			if (err) {
				msg.error(`${path} is not readable!`);
			}
		});
		resolve();
	});
}
async function executable(path) {
	return await new Promise((resolve) => {
		fs.access(path, X_OK, (err) => {
			if (err) {
				msg.error(`${path} is not executable!`);
			}
		});
		resolve();
	});
}
async function checkSystem() {
	return await new Promise((resolve) => {
		if (process.platform != 'win32' && process.platform != 'linux') {
			msg.error(`The tester is not supported on your system \"${process.platform}\"!`);
		}
		if (process.platform == 'linux') {
			exec('ulimit -s unlimited', () => {});
		}
		resolve();
	});
}
async function getArgv() {
	return await new Promise((resolve) => {
		let argv = process.argv.splice(2);
		if (argv.length < 3) {
			msg.error(`The number of parameters must be at least 3, but only ${argv.length} are found!`);
		}
		usr = new Program(argv[0] + '.cpp', 'usr');
		std = new Program(argv[1] + '.cpp', 'std');
		gen = new Program(argv[2] + '.cpp', 'gen');
		usrShell = new Shell('usr.sh');
		stdShell = new Shell('std.sh');
		genShell = new Shell('gen.sh');
		argv.splice(0, 3);
		for (let i of argv) {
			if (i == '-e' || i == '-exe') {
				needCompile = false;
			}
			if (i.substr(0, 3) == '-s=' || i.substr(0, 5) == '-spj=') {
				if (needSpecial) {
					msg.error('The special judge is redeclared!');
				}
				needSpecial = true;
				spj = new Program(i.replace(/-[spj]+=/, '') + '.cpp', 'spj');
				spjShell = new Shell('spj.sh');
			}
		}
		inf = new Data('in');
		ouf = new Data('out');
		ans = new Data('ans');
		// console.log(usr);
		// console.log(std);
		// console.log(gen);
		// console.log(spj);
		// console.log(inf);
		// console.log(ouf);
		// console.log(ans);
		// console.log(usrShell);
		// console.log(stdShell);
		// console.log(genShell);
		// console.log(spjShell);
		resolve();
	});
}
async function createPath() {
	return await new Promise((resolve) => {
		if (!fs.existsSync(path.bin)) {
			fs.mkdirSync(path.bin);
		}
		resolve();
	});
}
async function createShell() {
	return await new Promise((resolve) => {
		fs.writeFileSync(usrShell.full, `\"${usr.bin.full}\" < \"${inf.full}\" > \"${ouf.full}\" 2> /dev/full`);
		fs.writeFileSync(stdShell.full, `\"${std.bin.full}\" < \"${inf.full}\" > \"${ans.full}\" 2> /dev/full`);
		fs.writeFileSync(genShell.full, `\"${gen.bin.full}\" > \"${inf.full}\" 2> /dev/full`);
		if (needSpecial) {
			fs.writeFileSync(spjShell.full, `\"${spj.bin.full}\" ${inf.full} ${ouf.full} ${ans.full}`);
		}
		resolve();
	});
}
async function getCustomOption() {
	let get = async (tip, dft) => {
		return await new Promise((resolve) => {
			console.log(`${style.sBidge}${tip}${style.sReset} (default: ${dft})`);
			let option = read.question();
			if (option == '') {
				option = dft;
			}
			resolve(option);
		});
	};
	return await new Promise(async (resolve) => {
		console.log(`${style.wWhite}${style.gBlue}Custom options${style.sReset}`);
		console.log('- Note: please press \"enter\" to choose the default option.');
		if (needCompile) {
			compileOption = await get('Compile options', defaultCompileOption);
		}
		if (isNaN(timeLimit = parseFloat(await get('Time limit', defaultTimeLimit)))) {
			timeLimit = defaultTimeLimit;
		}
		resolve();
	})
}
async function compile(program) {
	return await new Promise((resolve) => {
		readable(program.src.full).then(() => {
			resolve();
		})
	}).then(() => {
		return new Promise((resolve) => {
			exec(`g++ ${compileOption} \"${program.src.full}\" -o \"${program.bin.full}\"`, (err) => {
				if (err) {
					console.log(err);
					msg.error(`The compilation of ${program.src.base} fails!`);
				} else {
					console.log(`[LOG] the compilation of ${program.src.base} succeeds.`);
					resolve();
				}
			});
		});
	});
}
async function compileProgram() {
	if (!needCompile) {
		return Promise.resolve();
	}
	return await new Promise(async (resolve) => {
		await Promise.all([
			compile(usr),
			compile(std),
			compile(gen),
			new Promise(async (resolve) => {
				if (needSpecial) {
					await compile(spj);
				}
				resolve();
			}),
		]);
		resolve();
	});
}
async function clearProcess() {
	return await new Promise.all([
		new Promise((resolve) => {
			exec(`taskkill -f -im ${usr.bin.base}`, () => {});
			resolve();
		}),
		new Promise((resolve) => {
			exec(`taskkill -f -im ${std.bin.base}`, () => {});
			resolve();
		}),
		new Promise((resolve) => {
			exec(`taskkill -f -im ${gen.bin.base}`, () => {});
			resolve();
		}),
	]);
}
async function execute(binary, shell, timeLimit) {
	return new Promise((resolve) => {
		let startTime = new Date().getTime();
		exec(`bash ${shell.full}`, { timeout: timeLimit, killSignal: SIGKILL }, (err) => {
			let endTime = new Date().getTime();
			if (err) {
				if (err.signal == 'SIGKILL') {
					binary.type == 'usr' ? msg.TLE() : msg.error(`Time limit exceeded occurs in ${program.src.base}!`);
				} else {
					binary.type == 'usr' ? msg.RE() : msg.error(`Runtime error occurs in ${program.src.base}!`);
				}
			}
			resolve(endTime - startTime);
		});
	});
}
async function checkAnswerBySpecial(stdTime, usrTime) {
	return await new Promise((resolve) => {
		exec(`bash ${spjShell.full}`, { timeout: defaultMaximumTimeLimit, killSignal: SIGKILL }, (err, stdout, result) => {
			result = result.trim();
			if (result.startsWith('ok')) {
				msg.AC(stdTime, usrTime);
				resolve();
			} else if (result.startsWith('points')) {
				result = result.substr('points '.length);
				let point = result.match(/[0-9.]*/).toString();
				msg.PC(stdTime, usrTime, point ? point : 0, result.substr(point.length).trimStart());
				resolve();
			} else if (result.startsWith('partially correct')) {
				result = result.substr('partially correct ('.length);
				let point = result.match(/[0-9]*/).toString();
				msg.PC(stdTime, usrTime, point ? point : 0, result.substr(point.length + 2));
				resolve();
			} else if (result.startsWith('wrong answer')) {
				msg.WA(result.substr('wonrg answer '.length));
			} else if (result.startsWith('FAIL')) {
				msg.error('Special judge fails!');
			} else if (err && err.signal == 'SIGKILL') {
				msg.error(`Time limit exceeded occurs in ${spj.src.base}!`);
			} else {
				msg.error(result ? 'Special judge returns unrecognizable result!' : 'Special judge returns nothing!');
			}
		});
	});
}
async function checkAnswerByCommand(stdTime, usrTime) {
	return await new Promise((resolve) => {
		exec(`diff ${ouf.full} ${ans.full}`, (err) => {
			err ? msg.WA() : msg.AC(stdTime, usrTime);
		});
		resolve();
	});
}
async function checkAnswer(stdTime, usrTime) {
	if (needSpecial) {
		return new Promise(async (resolve) => {
			await checkAnswerBySpecial(stdTime, usrTime);
			resolve();
		});
	} else {
		return new Promise(async (resolve) => {
			await checkAnswerByCommand(stdTime, usrTime);
			resolve();
		});
	}
}
async function executeProgram() {
	return await new Promise(async (resolve) => {
		for (let i = 1; ; i++) {
			process.stdout.write(`Test ${i}: `);
			await execute(gen.bin, genShell, defaultMaximumTimeLimit);
			let stdTime = await execute(std.bin, stdShell, defaultMaximumTimeLimit);
			let usrTime = await execute(usr.bin, usrShell, timeLimit);
			await checkAnswer(stdTime, usrTime);
		}
		resolve();
	});
}
async function main() {
	await checkSystem();
	await getArgv();
	await createPath();
	await createShell();
	await getCustomOption();
	await compileProgram();
	await clearProcess();
	await executeProgram();
}

main();