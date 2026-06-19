/* Rachel.js v1.1.0
 * Modules:
 * Rachel Core: Rachel, .version, .use, .config
 * Rachel Event Driven: .on, .off, .emit, .once, .when, .clear
 * Rachel Store: .store, .getState, .setState, .watch, .computed, .mount
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

(function () {
    'use strict';
    // Защита от повторной загрузки
    if (window.Rachel) {
        console.warn("[Warning] Rachel already loaded");
        return;
    }

    const internals = {
        initialized: false,
        config: {},
    };

    function Rachel() {
        if (internals.initialized) return Rachel;
        internals.initialized = true
        console.log('[Success] Rachel.js initialized. Current version:', Rachel.version)
        return Rachel
    }

    Rachel.version = '1.0.0'

    Rachel.config = function (options = {}) {
        Object.assign(
            internals.config,
            options
        );
        return Rachel;
    }
    Rachel.getConfig = function (param) { return internals.config ? internals.config[param] : undefined }

    // EVENTS DRIVEN MODULE
    Rachel.events = {};

    Rachel.events.init = function () {
        if (internals.events?.initialized) {
            return Rachel;
        }

        internals.events = {
            listeners: {},
            history: {},
            initialized: true
        };

        return Rachel;
    }

    Rachel.events.ensureEvents = function () {
        if (!internals.initialized) throw new Error('Rachel.js is not initialized. Please call Rachel() before using events.');

        if (!internals.events || !internals.events.initialized) Rachel.events.init();
        return internals.events;
    }

    Rachel.events.on = function (eventName, fn) {
        if (typeof fn !== 'function') throw new Error('Listener must be a function');

        if (typeof eventName !== 'string' || !eventName.trim()) throw new Error('Event name must be a non-empty string');

        const eventsConfig = Rachel.events.ensureEvents();

        const [name, namespace] = eventName.split('.');
        if (!name) return Rachel;

        eventsConfig.listeners[name] = eventsConfig.listeners[name] || [];

        const listenerWrapper = (data) => fn(data);
        listenerWrapper._originalFn = fn;
        if (namespace) listenerWrapper._ns = namespace;

        eventsConfig.listeners[name].push(listenerWrapper);
        return Rachel;
    }

    Rachel.events.once = function (eventName, fn) {
        const eventsConfig = Rachel.events.ensureEvents();

        const [name, namespace] = eventName.split('.');
        if (!name) return Rachel;

        eventsConfig.listeners[name] = eventsConfig.listeners[name] || [];

        const listenerWrapper = (data) => fn(data);
        listenerWrapper._originalFn = fn;
        listenerWrapper._once = true;
        if (namespace) listenerWrapper._ns = namespace;

        eventsConfig.listeners[name].push(listenerWrapper);
        return Rachel;
    }

    Rachel.events.when = function (eventName, fn) {
        const eventsConfig = Rachel.events.ensureEvents();

        const [name] = eventName.split('.');

        if (eventsConfig.history[name] && eventsConfig.history[name].fired) {
            fn(eventsConfig.history[name].data);
        } else {
            Rachel.events.once(eventName, fn);
        }
        return Rachel;
    }

    Rachel.events.emit = function (eventName, data = {}) {
        const eventsConfig = Rachel.events.ensureEvents();

        const [name] = eventName.split('.');

        eventsConfig.history[name] = { fired: true, data };

        if (!eventsConfig.listeners[name]) return Rachel;

        const currentListeners = [...eventsConfig.listeners[name]];
        currentListeners.forEach(fn => fn(data));

        eventsConfig.listeners[name] = eventsConfig.listeners[name].filter(listener => !listener._once);

        return Rachel;
    }

    Rachel.events.off = function (eventName, fn) {
        const eventsConfig = Rachel.events.ensureEvents();

        if (typeof eventName !== 'string' || !eventName.trim()) return Rachel;

        const [name, namespace] = eventName.split('.');

        if (name && !eventsConfig.listeners[name]) return Rachel;

        if (!name && namespace) {
            for (let key in eventsConfig.listeners) {
                eventsConfig.listeners[key] = eventsConfig.listeners[key].filter(listener => listener._ns !== namespace);
            }
            return Rachel;
        }

        if (!fn && !namespace) {
            eventsConfig.listeners[name] = [];
            return Rachel;
        };

        eventsConfig.listeners[name] = eventsConfig.listeners[name].filter(listener => {
            const matchFn = fn ? (listener === fn || listener._originalFn === fn) : true;
            const matchNs = namespace ? listener._ns === namespace : true;
            return !(matchFn && matchNs);
        });

        return Rachel;
    }

    Rachel.events.has = function (eventName) {
        const eventsConfig = Rachel.events.ensureEvents();

        const [name] = eventName.split('.');
        return !!(eventsConfig.listeners[name] && eventsConfig.listeners[name].length);
    }

    Rachel.events.clear = function () {
        const eventsConfig = Rachel.events.ensureEvents();

        eventsConfig.listeners = {};
        eventsConfig.history = {};

        return Rachel;
    }

    // STORE MANAGEMENT MODULE
    Rachel.store = {};

    Rachel.store.init = function () {
        if (internals.store?.initialized) {
            return Rachel;
        }

        internals.store = {
            initialized: true
        };

        return Rachel;
    }

    Rachel.store.ensureStore = function () {
        if (!internals.initialized) throw new Error('Rachel.js is not initialized. Please call Rachel() before using store.');
        if (!internals.store || !internals.store.initialized) Rachel.store.init();
    }

    window.Rachel = Rachel;
})();


Rachel();
Rachel.events.on('rachel.initialized', () => { console.log('[Succe1111ss] Rachel.js is ready to use') })

Rachel.events.emit('rachel.initialized');
