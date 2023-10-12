// Работа с DOM
// Реактивность
// Работа с localStorage
// Работа с indexedDB
// Работа с web workers


// Пасхалка от Рэйчел
function Rachel() {
    return ["Rachel wishes you a nice day and happy coding."]
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
        return result
    }
    else Rachel.sad()
}

// Найти несколько элементов по селектору
Rachel.findMany = (selector) => {
    if (window._Rachel) {
        return document.querySelectorAll(selector)
    }
    else Rachel.sad()
}


// РЕАКТИВНОСТЬ
var RachelStore = {
    username: "Max"
}
// Для того, чтобы добавить какие-то данные в RachelStore, 
// необходимо прописать RachelStore.<название переменной>
// Для того, чтобы получить значение существующей переменной, 
// необходимо добавить в тег атрибут rachel-store="<название переменной>"

// Машина состояний
RachelStore = new Proxy(RachelStore, {
    set: (target, name, val) => {
        target[name] = val
        Rachel._refresh({ name, val })
    }
})

// Обновление элементов
Rachel._refresh = (sticker) => {
    let el = Rachel.find(`*[rachel-state=${sticker.name}]`)
    try {
        el.innerText = sticker.val
    } catch {}
}





Rachel.hi()

RachelStore.age = 20

Rachel.find("span").innerText = RachelStore.username

let usernameInput = Rachel.find("input")

usernameInput.value = RachelStore.username
usernameInput.oninput = (e) => RachelStore.username = e.target.value

