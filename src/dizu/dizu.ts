import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import Instagram from '../instagramAPI/core/instagram'
import selectors from './selectors.json'
import * as utils from '../utils'

puppeteer.use(StealthPlugin())

let browser: Browser
let page: Page



interface Proxy {
	host: string,
	port: string,
	username: string,
	password: string
}

async function startBrowser(headless: boolean) {
	browser = await puppeteer.launch({ headless, devtools: false })
}

async function goToDizu() {
	try {
		page = await browser.newPage()
		page.goto('https://dizu.com.br/login')
	} catch (error) {
		throw new Error('Erro no Siga')
	}
}

async function login(user: string, password: string) {
	try {

		const inputLogin = await page.waitForSelector(selectors.inputLogin)
		await inputLogin.type(user.substring(0, user.length / 2))
		await utils.timeout(utils.getRandomNotInt(3) * 1000, false)
		await inputLogin.type(user.substring(user.length / 2))


		const inputPassword = await page.waitForSelector(selectors.inputPassword)
		await inputPassword.type(password.substring(0, password.length / 2))
		await utils.timeout(utils.getRandomNotInt(3) * 1000, false)
		await inputPassword.type(password.substring(password.length / 2))

		const btnLogin = await page.waitForSelector(selectors.btnLogin)
		await btnLogin.click()
	} catch (error) {
		throw new Error('Erro ao fazer login no Dizu')
	}
}

async function waitLogin() {
	try {
		const newWindowTarget = await browser.waitForTarget(target => target.url() === 'https://dizu.com.br/painel')
		page = await newWindowTarget.page()
	} catch (error) {
		throw new Error('Erro ao esperar o login')
	}
}

async function goToConnectEndWin() {
	try {
		await page.goto('https://dizu.com.br/painel/conectar')
	} catch (error) {
		throw new Error('Erro ao acessar o painel "Conectar e ganhar"')
	}
}

async function getAllProfiles() {
	try {
		let profile
		let cont = 2
		const profiles = []
		await page.waitForSelector(selectors.selectProfile)
		do {
			profile = await page.waitForSelector(`${selectors.selectProfile} > option:nth-child(${cont})`, { timeout: 500 }).catch(() => { })

			if (profile !== undefined) {
				let textProfile = await page.evaluate(element =>
					element.textContent,
					profile)
				profiles.push(textProfile)
				cont += 1
			}
		} while (profile !== undefined)

		return profiles
	} catch (error) {
		throw new Error('Erro ao obter todos os perfils conectados ao Dizu')
	}
}

function findProfile(profileInArray: string, profile: string) {
	const index = profileInArray.indexOf(profile)
	return index > -1
}

async function chooseProfile(profile: string) {
	try {
		let accountSeleted = 0
		const accounts = await getAllProfiles()
		accountSeleted = accounts.findIndex((e) => findProfile(e, profile))

		const selector = `${selectors.selectProfile} > option:nth-child(${accountSeleted + 2})`
		await page.evaluate((selector) => {
			const selectProfileElement = document.querySelector(selector)
			selectProfileElement.selected = true
			//selectProfileElement.click()
		}, selector)
		const selectElement = await page.waitForSelector(selectors.selectProfile)
		await selectElement.click()
	} catch (error) {
		console.log(error)
		throw new Error('Erro ao selecionar conta')
	}
}

async function selectIncludeLike05(checked: boolean) {
	try {
		await page.evaluate((checked, selector) => {
			const includeLike05Element = document.querySelector(selector)
			includeLike05Element.checked = checked
		}, checked, selectors.includeLike05)
	} catch (error) {
		throw new Error('Erro em marcar "incluir Curtidas 0.5"')
	}
}

async function selectIncludeTasks10(checked: boolean) {
	try {
		await page.evaluate((checked, selector) => {
			const includeTask10Element = document.querySelector(selector)
			includeTask10Element.checked = checked
		}, checked, selectors.includeTask10)
	} catch (error) {
		throw new Error('Erro em marcar "incluir tarefas 1.0"')
	}
}


async function clickInStart() {
	try {
		const btnStart = await page.waitForSelector(selectors.btnStart)
		await btnStart.click()
	} catch (error) {
		throw new Error('Erro ao clicar em iniciar')
	}
}

async function waitLoaderIsNotVisible() {
	try {
		let loaderDisplay
		do {
			loaderDisplay = await page.evaluate((selector) => {
				const loader = document.querySelector(selector)
				return loader.style.display
			}, selectors.loader)
			await utils.timeout(1000, false)
		} while (loaderDisplay !== 'none')

		return true
	} catch (error) {
		return false
	}
}

async function checkIfActionOn() {
	try {
		if (await waitLoaderIsNotVisible()) {
			const cardAction = await page.waitForSelector(selectors.cardAction)
			const isVisibleCardAction = await page.evaluate((cardAction) => {
				if (cardAction.style.display !== 'none') return true
				return false
			}, cardAction)
			if (isVisibleCardAction) return true
		}
		return false
	} catch (error) {
		throw new Error('Erro ao verificar se existe ação')
	}
}

async function getTypeAction() {
	try {
		const typeAction = await page.waitForSelector(selectors.getTypeAction)
		const typeActionTXT: string = await page.evaluate(element =>
			element.textContent,
			typeAction)
		return typeActionTXT
	} catch (error) {
		return undefined
	}
}

async function getUserID() {
	try {
		const divElement = await page.waitForSelector(selectors.divWithInfoTask)
		const dataTarefa = await page.evaluate((element) => {
			return element.getAttribute("data-tarefa")
		}, divElement)
		const userID: number = JSON.parse(dataTarefa).instagramPkID
		return userID
	} catch (error) {
		throw new Error('Erro ao obter o userID')
	}
}

async function getLinkForAction() {
	try {
		const linkForAction = await page.waitForSelector('#conectar_step_4')
		const linkActionTxt = await (await linkForAction.getProperty('href')).jsonValue()
		return linkActionTxt
	} catch (error) {
		throw new Error('Erro ao obter o link da ação')
	}
}

async function goToPageProfileInstagram(user: string) {
	try {
		await page.evaluate((user) => {
			window.open(`https://www.instagram.com/${user}`, '_blank')
		}, user)
		const newWindowTarget = await browser.waitForTarget(target => !!target.url().match('https://www.instagram.com'))
		return newWindowTarget.page()
	} catch (error) {
		console.log(error)
		throw new Error('Erro ao tentar acessar o instagram')
	}
}

async function doAction(action: string | undefined, instagram: Instagram) {
	if (action === 'Seguir') {
		const userID = await getUserID()
		console.log(userID)
		return await instagram.followByUserID(userID)

	} else {
		throw new Error(`Action type not is follow: ${action}`)
	}
}

async function confirmAction() {
	const btn = await page.waitForSelector(selectors.btnConfirmAction)
	await page.evaluate((btn) => {
		btn.click()
	}, btn)
}





async function start(
	userDizu: string,
	passwordDizu: string,
	userInsta: string,
	passwordInsta: string,
	proxy: Proxy,
	numberOfActions: number,
	minTimeRandom: number,
	maxTimeRandom: number
) {
	try {
		console.log('Starting browser')
		await startBrowser(false)
		console.log('Navigate to Dizu')
		await goToDizu()
		console.log('Logging in')
		await login(userDizu, passwordDizu)
		console.log('Waiting logging')
		await waitLogin()
		await goToConnectEndWin()
		await chooseProfile(userInsta)
		await selectIncludeLike05(true)
		await selectIncludeTasks10(true)
		await clickInStart()

		console.log('Checking if exists actions')
		let isActionOn = await checkIfActionOn()
		let typeAction: string | undefined
		let contActions = 0

		if (isActionOn) {
			const instagram = new Instagram(userInsta, passwordInsta)
			if (proxy)
				instagram.setProxy(
					proxy.host,
					proxy.port,
					proxy.username,
					proxy.password

				)
			await instagram.login()

			while (contActions < 10 && isActionOn) {

				typeAction = await getTypeAction()
				console.log(`New Action: ${typeAction}`)

				const actionSuccess = await doAction(typeAction, instagram)

				if (actionSuccess) {
					console.log('Action taken')
				}

				await confirmAction()
				contActions++

				console.log(`Total actions taken: ${contActions}`)

				if (contActions < 10) {
					console.log('Checking if exists new actions')
					isActionOn = await checkIfActionOn()
					if (isActionOn) {
						const timeRandom = utils.getRandomInt(minTimeRandom, maxTimeRandom)
						await utils.timeout(timeRandom * 1000, true)
					}
				}
			}
		}



	} catch (error) {
		console.log(error)
	}
}

start(
	'lu-anderson1@hotmail.com',
	'Cfx2j45152020',
	'jessicasantos5254',
	'G@ai45lk',
	{
		host: 'zproxy.lum-superproxy.io',
		port: '22225',
		username: 'lum-customer-hl_88429293-zone-brasil2-ip-45.130.213.233',
		password: 'j1or7h42ri1i'
	},
	10,
	15,
	40
)

