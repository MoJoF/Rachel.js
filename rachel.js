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

class _RachelEventEmitter {
    constructor() {
        this.listeners = {}
        this.history = {}
    }

    on(eventName, fn) {
        if (typeof fn !== 'function') throw new Error('Listener must be a function');
        if (typeof eventName !== 'string' || !eventName.trim()) throw new Error('Event name must be a non-empty string');

        const [name, namespace] = eventName.split('.');
        if (!name) return this;

        this.listeners[name] = this.listeners[name] || [];

        const listenerWrapper = (data) => fn(data);
        listenerWrapper._originalFn = fn;
        if (namespace) listenerWrapper._ns = namespace;

        this.listeners[name].push(listenerWrapper);
        return this;
    }

    once(eventName, fn) {
        const [name, namespace] = eventName.split('.');
        if (!name) return this;

        this.listeners[name] = this.listeners[name] || [];

        const listenerWrapper = (data) => fn(data);
        listenerWrapper._originalFn = fn;
        listenerWrapper._once = true;
        if (namespace) listenerWrapper._ns = namespace;

        this.listeners[name].push(listenerWrapper);
        return this;
    }

    when(eventName, fn) {
        const [name] = eventName.split('.');

        if (this.history[name] && this.history[name].fired) {
            fn(this.history[name].data);
        } else {
            this.once(eventName, fn);
        }
        return this;
    }

    emit(eventName, data = {}) {
        const [name] = eventName.split('.');

        this.history[name] = { fired: true, data };

        if (!this.listeners[name]) return this;

        const currentListeners = [...this.listeners[name]];
        currentListeners.forEach(fn => fn(data));

        this.listeners[name] = this.listeners[name].filter(listener => !listener._once);

        return this;
    }

    off(eventName, fn) {
        if (typeof eventName !== 'string' || !eventName.trim()) return this;

        const [name, namespace] = eventName.split('.');

        if (name && !this.listeners[name]) return this;

        if (!name && namespace) {
            for (let key in this.listeners) {
                this.listeners[key] = this.listeners[key].filter(listener => listener._ns !== namespace);
            }
            return this;
        }

        if (!fn && !namespace) {
            this.listeners[name] = [];
            return this;
        };

        this.listeners[name] = this.listeners[name].filter(listener => {
            const matchFn = fn ? (listener === fn || listener._originalFn === fn) : true;
            const matchNs = namespace ? listener._ns === namespace : true;
            return !(matchFn && matchNs);
        });

        return this;
    }

    has(eventName) {
        const [name] = eventName.split('.');
        return !!(this.listeners[name] && this.listeners[name].length);
    }

    clear() {
        this.listeners = {};
        this.history = {};
        return this;
    }
}


class _Rachel {
    constructor() {
        this.version = '1.0.0'

        this.events = new _RachelEventEmitter()

        console.log('[Success] _Rachel library successfully installed.')
    }
}

const R = new _Rachel()


