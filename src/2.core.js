soma.interact = soma.interact || {};
soma.interact.version = "0.0.1";

var errors = soma.interact.errors = {

};

var settings = soma.interact.settings = soma.interact.settings || {};

var attributes = settings.attributes = {
	click: "data-click"
};

function isElement(value) {
	return value ? value.nodeType > 0 : false;
}

function isFunction(value) {
	return value && typeof value === 'function';
}

// written by Dean Edwards, 2005
// with input from Tino Zijdel, Matthias Miller, Diego Perini
// http://dean.edwards.name/weblog/2005/10/add-event/
function addEvent(element, type, handler) {
	if (element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else {
		// assign each event handler a unique ID
		if (!handler.$$guid) handler.$$guid = addEvent.guid++;
		// create a hash table of event types for the element
		if (!element.events) element.events = {};
		// create a hash table of event handlers for each element/event pair
		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			// store the existing event handler (if there is one)
			if (element["on" + type]) {
				handlers[0] = element["on" + type];
			}
		}
		// store the event handler in the hash table
		handlers[handler.$$guid] = handler;
		// assign a global event handler to do all the work
		element["on" + type] = handleEvent;
	}
};
// a counter used to create unique IDs
addEvent.guid = 1;
function removeEvent(element, type, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(type, handler, false);
	} else {
		// delete the event handler from the hash table
		if (element.events && element.events[type]) {
			delete element.events[type][handler.$$guid];
		}
	}
};
function handleEvent(event) {
	var returnValue = true;
	// grab the event object (IE uses a global event object)
	event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
	// get a reference to the hash table of event handlers
	var handlers = this.events[event.type];
	// execute each event handler
	for (var i in handlers) {
		this.$$handleEvent = handlers[i];
		if (this.$$handleEvent(event) === false) {
			returnValue = false;
		}
	}
	return returnValue;
};
function fixEvent(event) {
	// add W3C standard event methods
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
};
fixEvent.preventDefault = function() {
	this.returnValue = false;
};
fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
};

function getValue(scope, pattern, pathString, params, paramsFound) {
	// string
	if (/^(\"|\')(.*)(\"|\')$/.test(pattern)) {
		return trimQuotes(pattern);
	}
	// find params
	var paramsValues = [];
	if (!paramsFound && params) {
		var j = -1, jl = params.length;
		while (++j < jl) {
			paramsValues.push(getValueFromPattern(scope, params[j]));
		}
	}
	else paramsValues = paramsFound;
	// find scope
	var scopeTarget = getScopeFromPattern(scope, pattern);
	// remove parent string
	pattern = pattern.replace(/..\//g, '');
	pathString = pathString.replace(/..\//g, '');
	if (!scopeTarget) return undefined;
	// search path
	var path = scopeTarget;
	var pathParts = pathString.split(/\.|\[|\]/g);
	if (pathParts.length > 0) {
		var i = -1, l = pathParts.length;
		while (++i < l) {
			if (pathParts[i] !== "") {
				path = path[pathParts[i]];
			}
			if (!isDefined(path)) {
				// no path, search in parent
				if (scopeTarget._parent) return getValue(scopeTarget._parent, pattern, pathString, params, paramsValues);
				else return undefined;
			}
		}
	}
	// return value
	if (!isFunction(path)) {
		return path;
	}
	else {
		return path.apply(null, paramsValues);
	}
	return undefined;
}

function getHandlerFromPattern(object, pattern, child) {
	var parts = pattern.match(/(.*)\((.*)\)/);
	if (parts) {
		var func = parts[1];
		if (isFunction(object[func])) {
			return object[func];
		}
	}
}

function parseNode(element, object) {
	if (!isElement(element)) throw new Error('Error in soma.interact.parse, only a DOM Element can be parsed.');
	var child = element.firstChild;
	console.log('CHILD', child);
	while (child) {
		if (child.nodeType === 1) {
			console.log(child, child.childNodes);
			parseNode(child);
			var attributes = [];
			for (var attr, name, value, attrs = child.attributes, j = 0, jj = attrs && attrs.length; j < jj; j++) {
				attr = attrs[j];
				if (attr.specified) {
					name = attr.name;
					value = attr.value;
					if (name === settings.attributes.click) {
						console.log('found', child);
						var handler = getHandlerFromPattern(object, attr.value, child);
						if (handler) {
							console.log('handler', handler);
							addEvent(child, 'click', handler);
						}
					}
				}
			}
		}
		child = child.nextSibling;
	}
}

var ready = (function(ie,d){d=document;return ie?
	function(c){var n=d.firstChild,f=function(){try{c(n.doScroll('left'))}catch(e){setTimeout(f,10)}};f()}:/webkit|safari|khtml/i.test(navigator.userAgent)?
	function(c){var f=function(){/loaded|complete/.test(d.readyState)?c():setTimeout(f,10)};f()}:
	function(c){d.addEventListener("DOMContentLoaded", c, false)}
})(/*@cc_on 1@*/);
ready(function() {

});
