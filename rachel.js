// Работа с DOM
// Реактивность
// Работа с localStorage
// Работа с indexedDB
// Работа с web workers

function Rachel(selector, multiply=false) {
    if (multiply) return document.querySelectorAll(selector)
    return document.querySelector(selector)
}

Rachel.init = (states) => {
    let data = new Proxy(states, {
        set(target, name, value) {
            target[name] = value
            console.log(target[name])
        }
    })
}