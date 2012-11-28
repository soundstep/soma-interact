soma.interact = soma.interact || {};
soma.interact.version = '0.0.1';

var errors = soma.interact.errors = {

};

var maxDepth;
var store = [];
var settings = soma.interact.settings = soma.interact.settings || {};

var attributes = settings.attributes = {
	click: 'data-click',
	dblclick: 'data-dblclick',
	mousedown: 'data-mousedown',
	mouseup: 'data-mouseup',
	mouseover: 'data-mouseover',
	mouseout: 'data-mouseout',
	mousemove: 'data-mousemove',
	mouseenter: 'data-mouseenter',
	mouseleave: 'data-mouseleave',
	keydown: 'data-keydown',
	keyup: 'data-keyup',
	focus: 'data-focus',
	blur: 'data-blur',
	change: 'data-change'
};

var events = {};
events[attributes.click] = 'click';
events[attributes.dblclick] = 'dblclick';
events[attributes.mousedown] = 'mousedown';
events[attributes.mouseup] = 'mouseup';
events[attributes.mouseover] = 'mouseover';
events[attributes.mouseout] = 'mouseout';
events[attributes.mousemove] = 'mousemove';
events[attributes.mouseenter] = 'mouseenter';
events[attributes.mouseleave] = 'mouseleave';
events[attributes.keydown] = 'keydown';
events[attributes.keyup] = 'keyup';
events[attributes.focus] = 'focus';
events[attributes.blur] = 'blur';
events[attributes.change] = 'change';

// todo: change, keyboard, focus, blur

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

// jquery contains
var contains = document.documentElement.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	document.documentElement.compareDocumentPosition ?
		function( a, b ) {
			return b && !!( a.compareDocumentPosition( b ) & 16 );
		} :
		function( a, b ) {
			while ( (b = b.parentNode) ) {
				if ( b === a ) {
					return true;
				}
			}
			return false;
		};

function getHandlerFromPattern(object, pattern, child) {
	var parts = pattern.match(/(.*)\((.*)\)/);
	if (parts) {
		var func = parts[1];
		if (isFunction(object[func])) {
			return object[func];
		}
	}
}

function parse(element, object, depth) {
	maxDepth = depth === undefined ? Number.MAX_VALUE : depth;
	parseNode(element, object, 0);
}

function parseNode(element, object, depth) {
	if (!isElement(element)) throw new Error('Error in soma.interact.parse, only a DOM Element can be parsed.');
	parseAttributes(element, object);
	var child = element.firstChild;
	while (child) {
		if (child.nodeType === 1) {
			if (depth < maxDepth) parseNode(child, object, depth++);
			parseAttributes(child, object);
		}
		child = child.nextSibling;
	}
}

function parseAttributes(element, object) {
	var attributes = [];
	for (var attr, name, value, attrs = element.attributes, j = 0, jj = attrs && attrs.length; j < jj; j++) {
		attr = attrs[j];
		if (attr.specified) {
			name = attr.name;
			value = attr.value;
			if (events[name]) {
				var handler = getHandlerFromPattern(object, value, element);
				if (handler) {
					addEvent(element, events[name], handler);
					addToStore(element, events[name], handler);
				}
			}
		}
	}
}

function clear(element) {
	var i = store.length, l = 0;
	while (--i >= l) {
		var item = store[i];
		if (element === item.element || contains(element, item.element)) {
			removeEvent(item.element, item.type, item.handler);
			store.splice(i, 1);
		}
	}
}

function addToStore(element, type, handler) {
	store.push({element:element, type:type, handler:handler});
}

function removeFromStore() {

}

var ready = (function(ie,d){d=document;return ie?
	function(c){var n=d.firstChild,f=function(){try{c(n.doScroll('left'))}catch(e){setTimeout(f,10)}};f()}:/webkit|safari|khtml/i.test(navigator.userAgent)?
	function(c){var f=function(){/loaded|complete/.test(d.readyState)?c():setTimeout(f,10)};f()}:
	function(c){d.addEventListener("DOMContentLoaded", c, false)}
})(/*@cc_on 1@*/);
ready(function() {

});
