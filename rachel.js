(function () {
    const internals = {
        initialized: false,
        mounted: false,
        store: null,
        watchers: new Map(),
        computed: new Map()
    };

    function Rachel() {
        if (internals.initialized) return;

        internals.initialized = true;

        console.log(
            `[Success] Rachel JS v${Rachel.version} initialized.`
        );
    }

    Rachel.version = "1.1.0";

    Rachel.hello = function () {
        console.log("[Rachel] Hi!");
    };

    Rachel.select = function (selector, multiple = false) {
        Rachel.requireInit();

        return multiple
            ? document.querySelectorAll(selector)
            : document.querySelector(selector);
    };

    Rachel.requireInit = function () {
        if (!internals.initialized) {
            throw new Error(
                "Rachel не инициализирована."
            );
        }
    };

    Rachel.requireStore = function () {
        if (!internals.store) {
            throw new Error(
                "Store не инициализирован."
            );
        }
    };

    Rachel.store = function (states = {}) {
        Rachel.requireInit();

        const normalized = {};

        Object.entries(states).forEach(([key, value]) => {
            normalized[key] = {
                value
            };
        });

        internals.store = new Proxy(normalized, {
            get(target, prop) {
                return target[prop];
            },

            set(target, prop, value) {
                const oldValue =
                    target[prop]?.value;

                target[prop] = {
                    value
                };

                Rachel.updateDOM(prop, value);

                Rachel.runWatchers(
                    prop,
                    value,
                    oldValue
                );

                Rachel.updateComputed();

                return true;
            }
        });

        return internals.store;
    };

    Rachel.getState = function (name) {
        Rachel.requireStore();

        if (!(name in internals.store)) {
            throw new Error(
                `Состояние "${name}" не найдено.`
            );
        }

        return internals.store[name].value;
    };

    Rachel.setState = function (name, value) {
        Rachel.requireStore();

        internals.store[name] = value;
    };

    Rachel.watch = function (name, callback) {
        Rachel.requireStore();

        if (!internals.watchers.has(name)) {
            internals.watchers.set(name, []);
        }

        internals.watchers
            .get(name)
            .push(callback);
    };

    Rachel.runWatchers = function (
        name,
        newValue,
        oldValue
    ) {
        const list =
            internals.watchers.get(name);

        if (!list) return;

        list.forEach(fn =>
            fn(newValue, oldValue)
        );
    };

    Rachel.computed = function (
        name,
        callback
    ) {
        Rachel.requireStore();

        internals.computed.set(
            name,
            callback
        );

        const result = callback();

        if (!(name in internals.store)) {
            internals.store[name] = result;
        }
    };

    Rachel.updateComputed = function () {
        internals.computed.forEach(
            (callback, name) => {
                const value =
                    callback();

                if (
                    !internals.store[name] ||
                    internals.store[name]
                        .value !== value
                ) {
                    internals.store[name] = value;
                }
            }
        );
    };

    Rachel.updateDOM = function (
        name,
        value
    ) {
        document
            .querySelectorAll(
                `[r-var="${name}"]`
            )
            .forEach(el => {
                el.textContent =
                    value ?? "";
            });

        document
            .querySelectorAll(
                `[r-model="${name}"]`
            )
            .forEach(el => {
                if (
                    el.value !== value
                ) {
                    el.value =
                        value ?? "";
                }
            });
    };

    Rachel.mount = function () {
        Rachel.requireStore();

        if (internals.mounted) {
            return;
        }

        internals.mounted = true;

        document
            .querySelectorAll(
                "[r-model]"
            )
            .forEach(el => {
                const state =
                    el.getAttribute(
                        "r-model"
                    );

                if (
                    !(state in internals.store)
                ) {
                    internals.store[state] =
                        "";
                }

                el.value =
                    Rachel.getState(
                        state
                    );

                el.addEventListener(
                    "input",
                    e => {
                        Rachel.setState(
                            state,
                            e.target.value
                        );
                    }
                );
            });

        document
            .querySelectorAll(
                "[r-var]"
            )
            .forEach(el => {
                const state =
                    el.getAttribute(
                        "r-var"
                    );

                if (
                    !(state in internals.store)
                ) {
                    throw new Error(
                        `Состояние "${state}" не найдено.`
                    );
                }

                el.textContent =
                    Rachel.getState(
                        state
                    );
            });
    };

    window.Rachel = Rachel;
})();

Rachel()
Rachel.store({
    username: 'Max'
})

Rachel.mount()

Rachel.hello()