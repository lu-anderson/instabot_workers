import fs from 'fs'
import path from 'path'
import axios, { AxiosInstance } from 'axios'
import HttpsProxyAgent from 'https-proxy-agent'


import endpoints from './endpoints'
import userAgents from './userAgents'


interface Cookies {
    csrftoken: string,
    ds_user_id: string,
    ig_did: string,
    rur: string,
    sessionid: string,
    mid: string
}
class Instagram {
    private userAgent = userAgents.ChromeDesktop
    private headers = {}
    private ownerUsername: string
    private ownerPassword: string
    private requestAxios: AxiosInstance

    /**
     * 
     * @param username Usuário para fazer login
     * @param password Senha para fazer login
     */
    constructor(username: string, password: string) {
        this.ownerUsername = username
        this.ownerPassword = password
        this.requestAxios = axios.create()
    }

    /**
     * 
     * @param force Forçar um novo login
     */
    public async login(force?: boolean) {
        try {
            const hasSessionSaved = await this.checkIfFileExists(path.resolve(__dirname, `../sessions/${this.ownerUsername}.json`))

            if (!hasSessionSaved || force) {
                let response = await this.requestAxios.get(endpoints.BASE_URL)

                let csrftoken: string = response.headers['set-cookie'].find((cookie: string) => cookie.match('csrftoken='))
                    .split(';')[0].split('=')[1]

                let mid: string = response.headers['set-cookie'].find((cookie: string) => cookie.match('mid='))
                    .split(';')[0].split('=')[1]

                const headers = {
                    'cookie': `ig_cb=1; csrftoken=${csrftoken}; mid=${mid};`,
                    'referer': endpoints.BASE_URL + '/',
                    'x-csrftoken': csrftoken,
                    'X-CSRFToken': csrftoken,
                    'user-agent': this.userAgent
                }

                const payload = `username=${this.ownerUsername}&enc_password=${encodeURIComponent(`#PWD_INSTAGRAM_BROWSER:0:${Math.ceil((new Date().getTime() / 1000))}:${this.ownerPassword}`)}`

                response = await this.requestAxios({
                    method: 'post',
                    url: endpoints.LOGIN_URL,
                    data: payload,
                    headers
                })

                if (!response.data.user) {
                    throw { error: 'User not found' }
                } else if (!response.data.authenticated) {
                    throw { error: 'Password is wrong' }
                } else {
                    console.log('Success in new login')

                    csrftoken = response.headers['set-cookie'].find((cookie: String) => cookie.match('csrftoken='))
                        .split(';')[0]

                    let ds_user_id: string = response.headers['set-cookie'].find((cookie: String) => cookie.match('ds_user_id='))
                        .split(';')[0].split('=')[1]

                    let ig_did: string = response.headers['set-cookie'].find((cookie: String) => cookie.match('ig_did='))
                        .split(';')[0].split('=')[1]

                    let rur:string = response.headers['set-cookie'].find((cookie: String) => cookie.match('rur='))
                        .split(';')[0].split('=')[1]

                    let sessionid: string = response.headers['set-cookie'].find((cookie: String) => cookie.match('sessionid='))
                        .split(';')[0].split('=')[1]

                    const cookies: any = {
                        csrftoken,
                        ds_user_id,
                        ig_did,
                        rur,
                        sessionid,
                        mid
                    }                    

                    let cookiesString = ''

                    Object.keys(cookies).forEach(key => {
                        cookiesString += `${key}=${cookies[key]}; `
                    })

                    const csrf = cookies.csrftoken

                    const headers = {
                        'cookie': cookiesString,
                        'referer': endpoints.BASE_URL + '/',
                        'x-csrftoken': csrf,
                        'user-agent': this.userAgent
                    }

                    this.headers = headers

                    await this.saveSession(cookies)
                }
            } else {
                console.log('Success in keep login')
                this.generateHeaders()
            }
        } catch (error) {
            console.log(error)
            if (error.response.data.message = 'checkpoint_required') {
                console.log('Account blocked')
            }
        }
    }

    private checkIsLogged(){
        if(Object.keys(this.headers).length === 0){
            throw new Error('Please login first')
        }
    }

    private checkIfFileExists(pathToFile: string) {
        return new Promise<boolean>((resolve, reject) => {
            fs.stat(pathToFile, (err, stats) => {
                if (!err && stats.isFile()) {
                    resolve(true)
                }
                if (err && err.code === 'ENOENT') {
                    resolve(false)
                }
                if (err) reject(err)
            })
        })
    }

    private async saveSession(cookies: Cookies) {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(path.join(path.resolve(__dirname, `../sessions/${this.ownerUsername}.json`)), JSON.stringify(cookies), (err) => {
                if (err) reject(reject)
                resolve()
            })
        })
    }

    private generateHeaders() {
        const cookiesJson = require(`../sessions/${this.ownerUsername}.json`)
        let cookies = ''

        Object.keys(cookiesJson).forEach(key => {
            cookies += `${key}=${cookiesJson[key]}; `
        })

        const csrf = cookiesJson['csrftoken']

        const headers = {
            'cookie': cookies,
            'referer': endpoints.BASE_URL + '/',
            'x-csrftoken': csrf,
            'user-agent': this.userAgent
        }

        this.headers = headers
    }

    public async getIdByUsername(username: String) {
        try {            
            this.checkIsLogged()
            const response = await this.requestAxios({
                method: 'get',
                url: endpoints.ACCOUNT_JSON_INFO(username),
                headers: this.headers
            })
            const id: number = response.data.graphql.user.id

            return id
        } catch (error) {
            throw new Error('Error in getIdByUsername')
        }
    }

    public async followByUserID(id: number) {
        try {
            this.checkIsLogged()
            const url = endpoints.FOLLOW_URL(id)
            const response = await this.requestAxios({
                method: 'post',
                url: url,
                headers: this.headers
            })
    
            if (response.status == 200) {
                console.log(`Success in following`)
                return true
            } else {
                console.log(response)
                return false
            }
        } catch (error) {
            throw error
        }
    }

    public async followByUsername(username: String) {
        try {
            this.checkIsLogged()
            const id = await this.getIdByUsername(username)
            await this.followByUserID(id)

        } catch (error) {
            throw error
        }
    }

    private async getIdByShortcode() {

    }

    private async likeByShortcode(shortcode: String) {
        const headers = this.generateHeaders()
        const id = ''
    }


    public setProxy(host: string, port: string, username: string, password: string){
        const auth = `${username}:${password}`
        const httpsAgent = HttpsProxyAgent({host, port, auth})
        this.requestAxios = axios.create({httpsAgent})
    }

    public async testProxy(){
        try {
            const response = await this.requestAxios.get('http://lumtest.com/myip.json')
            console.log(response.data)
        } catch (error) {
            throw error
        }
    }
}

export default Instagram



