(function(root, factory) {
  if(typeof exports === 'object') {
    module.exports = factory(require('immutable'));
  } else if(typeof define === 'function' && define.amd) {
    define(['immutable'], factory);
  } else {
    root.FluxCrud = factory(root.Immutable);
  }
}(this || window, function(Immutable) {
  var require = function(name) {
    return {'immutable': Immutable}[name];
  };
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Actions = (function () {
  function Actions(props) {
    _classCallCheck(this, Actions);

    // required props: constants, dispatcher

    this._dispatcher = props.dispatcher;
    this._constants = props.constants;
  }

  _createClass(Actions, [{
    key: 'create',
    value: function create(key, attrs) {
      this._dispatcher.dispatch({
        actionType: this._constants.CREATE,
        key: key,
        attrs: attrs
      });
    }
  }, {
    key: 'update',
    value: function update(key, attrs) {
      this._dispatcher.dispatch({
        actionType: this._constants.UPDATE,
        key: key,
        attrs: attrs
      });
    }
  }, {
    key: 'destroy',
    value: function destroy(key) {
      this._dispatcher.dispatch({
        actionType: this._constants.DESTROY,
        key: key
      });
    }
  }]);

  return Actions;
})();

module.exports = Actions;

},{}],2:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ACTIONS = ['create', 'destroy', 'update'];

var Constants = function Constants(props) {
  var _this = this;

  _classCallCheck(this, Constants);

  // required props: prefix

  var prefix = props.prefix;

  ACTIONS.forEach(function (action) {
    var constant = (prefix + '_' + action).toUpperCase();
    _this[action.toUpperCase()] = constant;
  });
};

module.exports = Constants;

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('immutable');

var OrderedMap = _require.OrderedMap;
var Record = _require.Record;

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var Store = (function () {
  function Store(props) {
    var _dispatchHandlers;

    _classCallCheck(this, Store);

    // required props: constants, dispatcher
    // props.Record or props.defaultAttrs

    this._constants = props.constants;
    this._dispatchHandlers = (_dispatchHandlers = {}, _defineProperty(_dispatchHandlers, this._constants.CREATE, '_handleCreate'), _defineProperty(_dispatchHandlers, this._constants.UPDATE, '_handleUpdate'), _defineProperty(_dispatchHandlers, this._constants.DESTROY, '_handleDestroy'), _dispatchHandlers);
    this._Record = props.Record || Record(props.defaultAttrs);

    this._storage = new OrderedMap();
    this._emitter = new EventEmitter();
    this._emitter.setMaxListeners(100);

    props.dispatcher.register(this._handleDispatch.bind(this));

    // TODO remove
    this.addChangeListener = this.addCollectionListener;
    this.removeChangeListener = this.removeCollectionListener;
  }

  _createClass(Store, [{
    key: 'get',
    value: function get(key) {
      return this._storage.get(key);
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      return this._storage;
    }
  }, {
    key: 'addRecordListener',
    value: function addRecordListener(key, listener) {
      this._emitter.on(key, listener);
    }
  }, {
    key: 'removeRecordListener',
    value: function removeRecordListener(key, listener) {
      this._emitter.removeListener(key, listener);
    }
  }, {
    key: 'addCollectionListener',
    value: function addCollectionListener(listener) {
      this._emitter.on('all', listener);
    }
  }, {
    key: 'removeCollectionListener',
    value: function removeCollectionListener(listener) {
      this._emitter.removeListener('all', listener);
    }
  }, {
    key: '_handleDispatch',
    value: function _handleDispatch(action) {
      var functionName = this._dispatchHandlers[action.actionType];
      if (this[functionName]) {
        this[functionName](action);
      }
    }
  }, {
    key: '_handleCreate',
    value: function _handleCreate(action) {
      this._storage = this._storage.set(action.key, new this._Record(action.attrs));
      this._emitCollectionChange();
    }
  }, {
    key: '_handleDestroy',
    value: function _handleDestroy(action) {
      this._storage = this._storage.remove(action.key);
      this._emitCollectionChange();
    }
  }, {
    key: '_handleUpdate',
    value: function _handleUpdate(action) {
      var oldRecord = this._storage.get(action.key);
      var newRecord = oldRecord;

      Object.keys(action.attrs).forEach(function (attrKey) {
        newRecord = newRecord.set(attrKey, action.attrs[attrKey]);
      });
      this._storage = this._storage.set(action.key, newRecord);

      // If record changed, emit change
      if (newRecord !== oldRecord) {
        this._emitCollectionChange();
        this._emitRecordChange(action.key);
      }
    }
  }, {
    key: '_emitRecordChange',
    value: function _emitRecordChange(key) {
      this._emitter.emit(key);
    }
  }, {
    key: '_emitCollectionChange',
    value: function _emitCollectionChange() {
      this._emitter.emit('all');
    }
  }]);

  return Store;
})();

module.exports = Store;

},{"events":4,"immutable":"immutable"}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"flux-crud-store":[function(require,module,exports){
'use strict';

module.exports = {
  Store: require('./flux_crud/store'),
  Actions: require('./flux_crud/actions'),
  Constants: require('./flux_crud/constants')
};

},{"./flux_crud/actions":1,"./flux_crud/constants":2,"./flux_crud/store":3}]},{},[]);
  return require('flux-crud-store');
}))
