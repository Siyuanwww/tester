const { R_OK, W_OK, X_OK, SIGKILL } = require('constants');
const fs = require('fs');
const exec = require('child_process').exec;
const read = require('readline-sync');
const Promise = require('bluebird');

const win32 = (process.platform == 'win32');
const defaultCompileOption = '-g -Wall -Wextra -ftrapv -std=c++11 -O2' + (win32 ? ' -Wl,--stack=536870912' : '');
const defaultTimeLimit = 1;
const style = { sReset: '\x1b[0m', sBidge: '\x1b[1m', sBlink: '\x1b[5m', wBlack: '\x1b[30m', wRed: '\x1b[31m', wGreen: '\x1b[32m', wYellow: '\x1b[33m', wBlue: '\x1b[34m', wMagenta: '\x1b[35m', wCyan: '\x1b[36m', wWhite: '\x1b[37m', gBlack: '\x1b[40m', gRed: '\x1b[41m', gGreen: '\x1b[42m', gYellow: '\x1b[43m', gBlue: '\x1b[44m', gMagenta: '\x1b[45m', gCyan: '\x1b[46m', gWhite: '\x1b[47m' };
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
		msg.echo(`${style.wGreen}Accepted${style.sReset}   ( std ${(time1 / 1000).toFixed(2)}s | usr ${(time2 / 1000).toFixed(2)}s )`);
	},
	WA() {
		msg.echo(`${style.wRed}Wrong Answer${style.sReset}`, { exit: true });
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
const path = { src: process.env.PWD, bin: process.env.PWD + '/comparator' };

class Program {
	constructor(src, bin) {
		this.src = {
			base: src,
			full: path.src + '/' + src,
		};
		this.bin = {
			base: bin + (win32 ? '.exe' : ''),
			full: path.bin + '/' + bin + (win32 ? '.exe' : ''),
			type: bin,
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

let usr, std, gen;
let inf, ouf, ans;
let usrShell, stdShell, genShell;
let needCompile = true;
let compileOption, timeLimit;

async function readable(path) {
	return await new Promise((resolve) => {
		fs.access(path, R_OK, (err) => {
			if (err) {
				msg.error(`File ${path} is not readable!`);
			}
		});
		resolve();
	});
}
function checkSystem() {
	if (process.platform != 'win32' && process.platform != 'linux') {
		msg.error(`The comparator is not supported on your system \"${process.platform}\"!`);
	}
	if (process.platform == 'linux') {
		exec('ulimit -s unlimited', () => {});
	}
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
		}
		inf = new Data('in');
		ouf = new Data('out');
		ans = new Data('ans');
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
		console.log('Note: please press \"enter\" to choose the default option.');
		if (needCompile) {
			compileOption = await get('Compile options', defaultCompileOption);
		}
		if (Number.isNaN(timeLimit = Number.parseFloat(await get('Time limit', defaultTimeLimit)))) {
			timeLimit = 1;
		}
		timeLimit *= 1000;
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
					msg.error(`The compilation of ${program.src.base} fails!`);
				} else {
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
	return await new Promise((resolve) => {
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
async function checkAnswer() {
	return await new Promise((resolve) => {
		exec(`diff ${ouf.full} ${ans.full}`, (err) => {
			if (err) {
				msg.WA();
			}
		});
		resolve();
	});
}
async function executeProgram() {
	return await new Promise(async (resolve) => {
		for (let i = 1; ; i++) {
			process.stdout.write(`Test ${i}   `);
			await execute(gen.bin, genShell, 5000);
			let stdTime = await execute(std.bin, stdShell, 5000);
			let usrTime = await execute(usr.bin, usrShell, timeLimit);
			await checkAnswer();
			msg.AC(stdTime, usrTime);
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
