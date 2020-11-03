import selectors from './selectors.json'
import { Page, ElementHandle } from 'puppeteer'
import * as utils from '../utils'


class Instagram {
    private page: Page
    constructor(page: Page) {
        this.page = page
    }

    public async clickInBtnFollowBeforeLogin() {
        try {
            const btn = await this.page.waitForSelector(selectors.btnFollowBeforeLogin2)
            await btn.click()
        } catch (error) {
            throw new Error('Erro ao clicar em follow para fazer login no instagram')
        }
    }

    private async insertCredentialsForLogin(user: string, password: string) {
        try {
            const inputUsername = await this.page.waitForSelector(selectors.inputLogin)
            await inputUsername.type(user)

            const inputPassword = this.page.waitForSelector(selectors.inputPassword)
            await (await inputPassword).type(password)
        } catch (error) {
            throw new Error('Erro ao tentar fazer login no instagram')
        }
    }

    private async waitLogin() {
        try {
            let cardLogin: null | ElementHandle
            let contLoading = 0
            do {
                cardLogin = await this.page.$(selectors.cardLogin)

                await utils.timeout(1000, false)
                contLoading++
            } while (cardLogin !== null && contLoading <= 20)

            if (contLoading >= 20) {
                throw new Error('Erro ao tentar fazer login no instagram, verifique sua conta')
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    private async discardSaveInformation() {
        try {
            const btn = await this.page.waitForSelector(selectors.btnDiscardSaveInformation)
            await btn.click()
        } catch (error) {
            throw new Error('Erro, em não salvar as informações')
        }
    }

    public async login(user: string, password: string) {
        try {
            await this.insertCredentialsForLogin(user, password)

            const btnLogin = await this.page.waitForSelector(selectors.btnLogin)
            await btnLogin.click()

            await this.waitLogin()

            await this.discardSaveInformation()
        } catch (error) {
            console.error('Error in login')
            console.error(error)
            throw new Error('Erro ao tentar fazer login no instagram, verifique sua conta')
        }
    }

}


export default Instagram