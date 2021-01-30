#!/usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');
const chalkRainbow = require('chalk-rainbow')
const figlet = require('figlet');
const clear = require('clear');
const terminalLink = require('terminal-link');
const Handlebars = require('handlebars');
const shell = require('shelljs')

class Gizmo {
	constructor() {
		let [, , ...args] = process.argv
		this.args = args
		this.commande = this.args[0]
		this.make = []
		this.load()
	}
	load() {
		if (fs.existsSync("./gizmo.json")) {
			var json = JSON.parse(fs.readFileSync('./gizmo.json').toString());
			for (var i in json)
				this.make[json[i]["name"]] = json[i]
		}
	}
	getCommande() {
		return this.commande
	}
	isCommande() {
		if (this.commande === undefined) { return true } else
			return false
	}

}
let gizmo = new Gizmo();


if (gizmo.isCommande()) {
	clear()
	console.log(
		chalkRainbow(
			figlet.textSync('Gizmo Help', { horizontalLayout: 'full' })
		), chalk.blue('1.0.1')
	);
	console.log(chalk.green('gizmo init'));
	console.log(chalk.green('gizmo clone'));
	console.log(chalk.green('gizmo -i'))
	console.log("");
	console.log(chalk.underline("Automatically generate :"));
	for (var i in gizmo.make)
		console.log(chalk.blue(`gizmo make:${gizmo.make[i]["name"]} ${gizmo.make[i]["required"]}`));
}

if (gizmo.commande === "clone") {
	shell.exec('git clone https://github.com/MestrieEsteban/gizmo-api.git')
	shell.exec('rm -rf ./gizmo-api/.git')
}

if (gizmo.getCommande() === "-i") {
	shell.exec('yarn install')
}

if (gizmo.commande === "init") {
	if (fs.existsSync("./gizmo.json") && fs.existsSync("./gizmo-template")) {
		console.log(chalk.bold.red('X Gizmo is already initialized'));
		return
	}
	try {		
		shell.exec('touch gizmo.json')
		shell.exec('mkdir gizmo-template')
		console.log(chalk.bold.green('Gizmo initialized'));
	} catch (error) {
		console.log(chalk.bold.red(error));
	}
}