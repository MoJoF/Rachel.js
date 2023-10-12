// Работа с DOM
// Реактивность
// Работа с localStorage
// Работа с indexedDB
// Работа с web workers


// Пасхалка от Рэйчел
function Rachel() {
    return ["Rachel wishes you a nice day and happy coding."]
}

// Обидное сообщение от Рэйчел
Rachel.sad = () => {
    console.warn("%cYou didn't say hello to Rachel and she got mad at you :-(", "color: red; font-weight: bold")
}

// Обязательное приветствие для Рэйчел
Rachel.hi = () => {
    window._Rachel = {
        edition: "main",
        plugins: [
            "dom", "reactivity"
        ]
    }
    console.log("%cRachel ready. Let's coding!!! :-)", "color: blue; font-weight: bold")
}

// DOM
// Найти один элемент по селектору
Rachel.find = (selector) => {
    if (window._Rachel) { 
        let result = document.querySelector(selector)
        if (result === null) {
            console.warn("%cRachel couldn't find anything ;-(", "font-weight: bold")
        } else {
            return result
        }
    }
    else Rachel.sad()
}

// Найти несколько элементов по селектору
Rachel.findMany = (selector) => {
    if (window._Rachel) {
        if (document.querySelectorAll(selector).length === 0) {
            console.warn("%cRachel couldn't find anything ;-(", "font-weight: bold")
        } else {
            return document.querySelectorAll(selector)
        }
    }
    else Rachel.sad()
}


// РЕАКТИВНОСТЬ
// Машина состояний
var RachelStore = {
    username: "Max"
}

RachelStore = new Proxy(RachelStore, {
    set: (target, name, val) => {
        target[name] = val
        Rachel._refresh({ name, val })
    }
})

// Обновление элементов
Rachel._refresh = (sticker) => {
    Rachel.find(`*[rachel-state=${sticker.name}]`).innerText = sticker.val
}


RachelStore.age = 20





Rachel.hi()

Rachel.find("span").innerText = RachelStore.username

let usernameInput = Rachel.find("input")

usernameInput.value = RachelStore.username
usernameInput.oninput = (e) => RachelStore.username = e.target.value

