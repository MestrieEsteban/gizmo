#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const chalkRainbow = require('chalk-rainbow')
const figlet = require('figlet')
const clear = require('clear')
const terminalLink = require('terminal-link')
const handlebars = require('handlebars')
const shell = require('shelljs')
var pjson = require('./package.json')

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
			var json = JSON.parse(fs.readFileSync('./gizmo.json').toString())
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

	help() {
		clear()
		console.log(
			chalkRainbow(
				figlet.textSync('Gizmo Help', { horizontalLayout: 'full' })
			), chalk.blue(pjson.version)
		)
		console.log(chalk.green('gizmo init'))
		console.log(chalk.green('gizmo clone'))
		console.log(chalk.green('gizmo -i'))
		console.log("")
		console.log(chalk.underline("Automatically generate :"))
		for (var i in gizmo.make)
			console.log(chalk.blue(`gizmo make:${gizmo.make[i]["name"]} ${gizmo.make[i]["required"]}`))
	}

}
let gizmo = new Gizmo()


if (gizmo.isCommande()) {
	gizmo.help()
}
if (gizmo.commande === "--help") {
	gizmo.help()
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
		console.log(chalk.bold.red('X Gizmo is already initialized'))
		return
	}
	try {		
		shell.exec('touch gizmo.json')
		shell.exec('mkdir gizmo-template')
		console.log(chalk.bold.green('Gizmo initialized'))
	} catch (error) {
		console.log(chalk.bold.red(error))
	}
}

if (/^make:/.test(gizmo.commande)) {
	let name = gizmo.commande.split(':')
	name = name[1]
	if (gizmo.make[name] !== undefined) {
		if (gizmo.args[1] === "-h") {
			if (gizmo.make[name]["help"] !== undefined)
				console.log(chalk.blue(gizmo.make[name]["help"]))
			return
		}
		if (gizmo.args.length - 1 === gizmo.make[name]["required"].length) {
			
			fs.readFile(gizmo.make[name]["template"], function (err, data) {
				if (!err) {
					var source = data.toString()
					renderToString(source)
				} else {
					console.log(err)
				}
			})

			function renderToString(source) {
				var template = handlebars.compile(source)
				var outputString = template({ name: `${gizmo.args[1]}${gizmo.make[name]["type"]}` })
				fs.writeFile(`${gizmo.make[name]["path"]}${gizmo.args[1]}${gizmo.make[name]["type"]}.${gizmo.make[name]["ext"]}`, outputString, err => {
					if (err) {
						return console.error(`Autsch! Failed to store template: ${err.message}.`)
					}
					clear()
					console.log(
						chalk.blue(
							figlet.textSync(`${gizmo.args[1]}.${gizmo.make[name]["ext"]}`, { horizontalLayout: 'full' })
						)
					)
					const link = terminalLink(`${gizmo.args[1]}.ts`, `${gizmo.make[name]["path"]}${gizmo.args[1]}${gizmo.make[name]["type"]}.${gizmo.make[name]["ext"]}`)
					console.log(chalk.blue(link))
				})
			}
		} else {
			console.log(chalk.red.underline("No arguments found"))
			console.log(chalk.blue(`gizmo make:${gizmo.make[name]["name"]} ${gizmo.make[name]["required"]}`))
			if (gizmo.make[name]["help"]) {
				console.log(chalk.blue(`gizmo make:${gizmo.make[name]["name"]} -h`))
			}

		}
	} else {
		console.log(chalk.red.underline("No template found"))

		for (var i in gizmo.make)
			console.log(chalk.blue(`gizmo make:${gizmo.make[i]["name"]} ${gizmo.make[i]["required"]}`))
	}
}