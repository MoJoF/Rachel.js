/* Rachel.js v1.1.0
 * Modules:
 * Rachel Core: Rachel, .version, .use, .config
 * Rachel Event Driven: .on, .off, .emit, .once, .when, .clear ГОТОВО
 * Rachel Store: .store, .getState, .setState, .watch, .computed, .mount ГОТОВО
 * Rachel DOM: .select, .create, .remove, .html, .text, .css, .attr, .on, .off, .append, .prepend, .replace, .clone, .show, .hide, .toggle
 * Rachel DOM Optimizations: .batch, .schedule, .lazy, .observe, .resize, .visible
 * Rachel HTTP: .get, .post, .put, .patch, .delete, .upload // ГОТОВО
 * Rachel Storage (localStorage): .set, .get, .remove, .clear 
 * Rachel Database (indexedDB): .open, .insert, .update, .delete, .findAll, .find 
 * Rachel FS (OPFS): .read, .write, .remove, .exists, .list, .mkdir, .move, .copy
 * Rachel Cache: .set, .get, .clear, .remove, .keys
 * Rachel Worker: .create, .destroy, .send, .on 
 * Rachel Socket: .connect, .send, .close, .on
 * Rachel Browser: .clipboard, .share, .notify, .geo, .channel, .network, .screen, .wakelock, .battery
 * Rachel Voice: .listen, .stop, .say, .pause
 * Rachel Media: .camera, .microphone, .audio, .video
 * Rachel Profiler: .start, .stop, .reset, .report (fps, memory, domUpdates, events, network, renders)
 * Rachel Compiler: .lexer, .parser 
 * Rachel Validate: .phone, .email
 * Rachel Masks: .phone, .email, .date, .currency
 * Rachel Utils: .debounce, .throttle, .clone, .merge, .random, .uuid, .hash, .format, .parse
 * Rachel Animations: .animate, .transition, .keyframes
 * Rachel Canvas Toolkit: .create, .clear, .draw, .animate, .scene, .layer, .rect, .circle, .line, .text, .image 
*/

/* 
 * emit - вызвать событие
 * on - подписаться на событие
 * once - подписаться на событие один раз
 * when - отреагировать на уже прошедшее событие
 * off - отписаться от события
 * has - проверить, есть ли подиска на событие
 * clear - очищение списка событий
*/
class _RachelEventEmitter {
    constructor() {
        this.listeners = {};
        this.history = {};
    }

    on(eventName, fn) {
        if (typeof eventName !== 'string' || !eventName.trim()) {
            throw new Error('Event name must be a non-empty string');
        }

        if (typeof fn !== 'function') {
            throw new Error('Listener must be a function');
        }

        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push({
            callback: fn,
            once: false
        });

        return this;
    }

    once(eventName, fn) {
        if (typeof eventName !== 'string' || !eventName.trim()) {
            throw new Error('Event name must be a non-empty string');
        }

        if (typeof fn !== 'function') {
            throw new Error('Listener must be a function');
        }

        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push({
            callback: fn,
            once: true
        });

        return this;
    }

    emit(eventName, data = {}) {
        if (!this.listeners[eventName]) {
            this.history[eventName] = {
                fired: true,
                data
            };

            return this;
        }

        this.history[eventName] = {
            fired: true,
            data
        };

        const listeners = [...this.listeners[eventName]];

        listeners.forEach(listener => {
            listener.callback(data);
        });

        this.listeners[eventName] =
            this.listeners[eventName].filter(listener => !listener.once);

        return this;
    }

    when(eventName, fn) {
        if (typeof fn !== 'function') {
            throw new Error('Listener must be a function');
        }

        const event = this.history[eventName];

        if (event?.fired) {
            fn(event.data);
        } else {
            this.once(eventName, fn);
        }
        return this;
    }

    off(eventName, fn = null) {
        if (!this.listeners[eventName]) {
            return this;
        }

        if (!fn) {
            delete this.listeners[eventName];
            return this;
        }

        this.listeners[eventName] =
            this.listeners[eventName].filter(
                listener => listener.callback !== fn
            );

        return this;
    }

    has(eventName) {
        return !!(
            this.listeners[eventName] &&
            this.listeners[eventName].length
        );
    }

    clear() {
        this.listeners = {};
        this.history = {};
        return this;
    }

    __listEvents() {
        console.log('Listeners: ')
        console.log(this.listeners)
        console.log('History:')
        console.log(this.history)
    }
}

/*
 * r-model - записывает данные с input/textarea в состояние 
 * r-var - выводит в textContent значение состояние
 * :attribute - подставить в атрибут значение состояния
*/
class _RachelStore {
    constructor(events = null) {
        this.events = events;

        this.state = {};
        this.watchers = {};

        this.__boundModels = new WeakSet();
        this.__boundAttrs = new WeakSet();
        this.__boundText = new WeakSet();

        this.__mounted = false;

        this.__mount();
    }

    create(name, value) {
        this.state[name] = value;
        return this;
    }

    get(name) {
        return this.state[name];
    }

    set(name, value) {
        const oldValue = this.state[name];

        if (oldValue === value) return this;

        this.state[name] = value;

        if (this.watchers[name]) {
            this.watchers[name].forEach(fn => fn(value, oldValue));
        }

        if (this.events) {
            this.events.emit(`r_store:${name}`, {
                oldValue,
                newValue: value
            });
        }

        return this;
    }

    watch(name, fn) {
        if (!this.watchers[name]) {
            this.watchers[name] = [];
        }

        this.watchers[name].push(fn);
        return this;
    }

    unwatch(name, fn) {
        if (!this.watchers[name]) return this;

        this.watchers[name] =
            this.watchers[name].filter(cb => cb !== fn);

        return this;
    }

    computed(name, fn) {
        Object.defineProperty(this.state, name, {
            get: fn,
            enumerable: true
        });

        return this;
    }

    __mountModels() {
        const elements = document.querySelectorAll('[r-model]');

        elements.forEach(el => {
            const key = el.getAttribute('r-model');
            if (!key) return;

            if (this.__boundModels.has(el)) return;
            this.__boundModels.add(el);

            if (!(key in this.state)) {
                this.state[key] = this.__getElementValue(el);
            }

            this.__setElementValue(el, this.state[key]);

            const eventName = this.__getInputEvent(el);

            el.addEventListener(eventName, () => {
                this.set(key, this.__getElementValue(el));
            });

            this.watch(key, value => {
                this.__setElementValue(el, value);
            });
        });
    }

    __mountAttributes() {
        const elements = document.querySelectorAll('*');

        elements.forEach(el => {
            const attrs = Array.from(el.attributes);

            for (const attr of attrs) {
                if (!attr.name.startsWith(':')) continue;

                const realAttr = attr.name.slice(1);
                const key = attr.value;

                if (!key) continue;

                const update = (value) => {
                    el.setAttribute(realAttr, value ?? '');
                };

                update(this.get(key));

                this.watch(key, update);
            }
        });
    }

    __mountTextBindings() {
        const elements = document.querySelectorAll('[r-var]');

        elements.forEach(el => {
            const key = el.getAttribute('r-var');
            if (!key) return;

            if (this.__boundText.has(el)) return;
            this.__boundText.add(el);

            const update = (value) => {
                el.textContent = value ?? '';
            };

            update(this.get(key));

            this.watch(key, update);
        });
    }

    __mount() {
        if (this.__mounted) return this;
        this.__mounted = true;

        this.__mountModels();
        this.__mountAttributes();
        this.__mountTextBindings();

        return this;
    }

    __getElementValue(el) {
        if (el instanceof HTMLInputElement) {
            if (el.type === 'checkbox') return el.checked;
            if (el.type === 'radio') return el.value;
            return el.value;
        }

        if (el instanceof HTMLTextAreaElement) {
            return el.value;
        }

        return el.textContent;
    }

    __setElementValue(el, value) {
        if (el instanceof HTMLInputElement) {
            if (el.type === 'checkbox') {
                el.checked = Boolean(value);
            } else if (el.type === 'radio') {
                el.checked = el.value === value;
            } else {
                el.value = value ?? '';
            }
            return;
        }

        if (el instanceof HTMLTextAreaElement) {
            el.value = value ?? '';
            return;
        }

        el.textContent = value ?? '';
    }

    __getInputEvent(el) {
        if (el instanceof HTMLInputElement) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                return 'change';
            }
            return 'input';
        }

        return 'input';
    }
}

/*
 * Модуль для отправки HTTP-запросов на сервер
*/

class _RachelHTTP {
    constructor(baseUrl = "") {
        this.baseUrl = baseUrl
        this.headers = {
            'Content-Type': 'application/json'
        }
    }

    async request(method, url, body = null, config = {}) {
        const fullUrl = this.baseUrl + url

        const options = {
            method,
            headers: {
                ...this.headers,
                ...(config.headers || {})
            }
        }

        if (body !== null) {
            options.body = JSON.stringify(body)
        }

        const response = await fetch(fullUrl, options)
        const data = response.json().catch(() => null)

        if (!response.ok) {
            throw {
                status: response.status,
                data
            }
        }
        return data
    }

    get(url, config) {
        return this.request('GET', url, null, config)
    }

    post(url, body, config) {
        return this.request('POST', url, body, config)
    }

    put(url, body, config) {
        return this.request('PUT', url, body, config)
    }

    patch(url, body, config) {
        return this.request('PATCH', url, body, config)
    }

    delete(url, body, config) {
        return this.request('DELETE', url, null, config)
    }
}

class _Rachel {
    constructor() {
        this.version = '1.0.0'

        this.events = new _RachelEventEmitter()
        this.store = new _RachelStore(this.events)

        console.log('[Success] _Rachel library successfully installed.')
    }
}

const R = new _Rachel()

document.addEventListener('DOMContentLoaded', () => R.store.__mount())