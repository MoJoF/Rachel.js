/* Rachel.js v1.1.0
 * Modules:
 * Rachel Core: Rachel, .version, .use, .config
 * Rachel Event Driven: .on, .off, .emit, .once, .when, .clear ГОТОВО
 * Rachel Store: .store, .getState, .setState, .watch, .computed, .mount ГОТОВО
 * Rachel DOM: .select, .create, .remove, .html, .text, .css, .attr, .on, .off, .append, .prepend, .replace, .clone, .show, .hide, .toggle
 * Rachel DOM Optimizations: .batch, .schedule, .lazy, .observe, .resize, .visible
 * Rachel HTTP: .get, .post, .put, .patch, .delete, .upload 
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
        this.computed = {};

        this.__mounted = false;
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

        this.watchers[name] = this.watchers[name].filter(cb => cb !== fn);
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

            const isCheckbox = el instanceof HTMLInputElement && el.type === 'checkbox';
            const isRadio = el instanceof HTMLInputElement && el.type === 'radio';

            if (!(key in this.state)) {
                if (isCheckbox) {
                    this.create(key, el.checked);
                } else {
                    this.create(key, el.value ?? '');
                }
            }

            const updateFromDom = () => {
                if (isCheckbox) {
                    this.set(key, el.checked);
                } else if (isRadio) {
                    if (el.checked) this.set(key, el.value);
                } else {
                    this.set(key, el.value);
                }
            };

            const eventName = isCheckbox || isRadio ? 'change' : 'input';

            el.addEventListener(eventName, updateFromDom);

            this.watch(key, value => {
                if (isCheckbox) {
                    el.checked = Boolean(value);
                } else if (isRadio) {
                    el.checked = el.value === value;
                } else {
                    if (el.value !== value) {
                        el.value = value ?? '';
                    }
                }
            });
        });

        return this;
    }

    __mountVars() {
        const elements = document.querySelectorAll('[r-var]');

        elements.forEach(el => {
            const key = el.getAttribute('r-var');
            if (!key) return;

            const update = value => {
                el.textContent = value ?? '';
            };

            update(this.get(key));

            this.watch(key, update);
        });

        return this;
    }

    __mountAttributes() {
        const elements = document.querySelectorAll('*');

        const booleanAttrs = [
            'disabled',
            'checked',
            'selected',
            'readonly',
            'required',
            'hidden'
        ];

        elements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {

                if (!attr.name.startsWith(':')) return;

                const realAttr = attr.name.slice(1);
                const stateName = attr.value;

                const update = value => {

                    if (booleanAttrs.includes(realAttr)) {
                        if (value) {
                            el.setAttribute(realAttr, '');
                        } else {
                            el.removeAttribute(realAttr);
                        }
                        return;
                    }

                    el.setAttribute(realAttr, value ?? '');
                };

                update(this.get(stateName));

                this.watch(stateName, update);
            });
        });

        return this;
    }

    mount() {
        if (this.__mounted) {
            return this;
        }

        this.__mounted = true;

        this.__mountModels();
        this.__mountVars();
        this.__mountAttributes();

        return this;
    }
}

/*
 * 
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
R.store.mount()

const http = new _RachelHTTP()
http.delete('https://jsonplaceholder.typicode.com/posts/1').then(data => console.log(data))