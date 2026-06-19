// Работа с DOM
// Реактивность
// Работа с localStorage
// Работа с indexedDB
// Работа с web workers

function Rachel() {
    window.__isRachelInit__ = true
    console.log('[Success] Библиотека Rachel JS успешно инициализирована.')
}

// Переменная с версией
Rachel.version = "1.0.0"

// Фунция, чтобы поздороваться
Rachel.hello = function () {
    console.log('[Rachel] Hi!')
}

// Первичная инициализация объекта состояний
Rachel.store = function (states) {
    if (!window.__isRachelInit__) throw new Error('Ошибка! Библиотека не инициализирована.')
    if (typeof states !== 'object' || states === null) throw new Error('Ошибка! В хранилище должен передаваться объект.')

    window.__isRachelStoreInitialized = true // флаг инициализации состояний
    window.__RachelVars = Object.keys(states) // реестр состояний

    const normalizedStates = {};
    window.__RachelVars.forEach(key => {
        const val = states[key];
        if (val && typeof val === 'object' && 'value' in val) {
            normalizedStates[key] = val;
        } else {
            normalizedStates[key] = { value: val };
        }
    });

    window.__RachelStore = new Proxy(normalizedStates, {
        get(target, name) {
            return target[name];
        },
        set(target, name, incomingValue) {
            let newValue = incomingValue;
            if (incomingValue && typeof incomingValue === 'object' && 'value' in incomingValue) {
                target[name] = incomingValue;
                newValue = incomingValue.value;
            } else {
                target[name] = { value: incomingValue };
            }

            Rachel.updateDOM(name, newValue);
            return true;
        }
    });
}

Rachel.updateDOM = function (name, value) {
    Rachel.select(`[r-var="${name}"]`, true).forEach(el => {
        el.textContent = value ?? '';
    });

    Rachel.select(`input[r-model="${name}"]`, true).forEach(el => {
        if (el.value !== value) el.value = value ?? '';
    });
}

Rachel.select = function (selector, multiply = false) {
    if (!window.__isRachelInit__) throw new Error('Ошибка! Библиотека не инициализирована.')
    if (multiply) return document.querySelectorAll(selector)
    return document.querySelector(selector)
}

Rachel.relate = function () {
    if (!window.__isRachelStoreInitialized) throw new Error("Ошибка! Store не инициализирован. Воспользуйтесь Rachel.store({}) для инициализации пустого хранилища .")

    Rachel.select('input[r-model]', true).forEach(el => {
        let varName = el.getAttribute("r-model")

        if (!window.__RachelVars.includes(varName)) {
            window.__RachelVars.push(varName)
        }

        if (!(varName in window.__RachelStore)) {
            window.__RachelStore[varName] = { value: "" };
        }

        el.value = window.__RachelStore[varName].value;

        el.addEventListener('input', function (e) {
            let v = e.target.value;
            window.__RachelStore[varName] = { value: v };
        })
    })

    Rachel.select('[r-var]', true).forEach(el => {
        let state = el.getAttribute('r-var')

        if (!(state in window.__RachelStore) && !window.__RachelVars.includes(state)) {
            throw new Error(`Ошибка! Состояния "${state}" не существует.`);
        }

        el.textContent = window.__RachelStore[state]?.value ?? '';
    })
}

Rachel.getState = function (state) {
    if (!window.__isRachelStoreInitialized) throw new Error("Ошибка! Store не инициализирован. Воспользуйтесь Rachel.store({}) для инициализации пустого хранилища .")
    if (!window.__RachelStore[state]) throw new Error("Данного состояния не существует.")
    return window.__RachelStore[state]
}

Rachel()

Rachel.store({
    name: "Максим"
})

Rachel.relate()

console.log(Rachel.getState("username"))
