const log = console.log.bind(console)

const _e = (sel) => document.querySelector(sel)

const _es = (sel) => document.querySelectorAll(sel)

const bindEvent = function(element, eventName, callback) {
    element.addEventListener(eventName, callback)
}

const bindAll = function(elements, eventName, callback) {
    for (var i = 0; i < elements.length; i++) {
        bindEvent(elements[i], eventName, callback)
    }
}
