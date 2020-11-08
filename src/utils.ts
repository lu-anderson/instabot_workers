function timer(time: number, logTimer: boolean) {
    function start() {
        if (time >= 0) {
            time -= 1
            if (time !== -1) {
                if (logTimer) console.log(`Aguardando: ${time}`)
            }
            setTimeout(start, 1000)
        }
    }
    start()
}

export function timeout(ms: number, logTimer: boolean) {
    if (logTimer) console.log(`Timer: ${ms / 1000}`)
    return new Promise((resolve) => {
        timer(ms / 1000, logTimer)
        setTimeout(() => {
            if (logTimer) console.log('pronto')
            resolve()
        },
            ms)
    })
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomNotInt(max: number) {
    return Math.random() * max + 1
}