// plugins

soma.plugins = soma.plugins || {};

function InteractPlugin(instance, injector) {

}
if (soma.plugins && soma.plugins.add) {
	soma.plugins.add(InteractPlugin);
}

// exports
soma.interact.parse = parse;
soma.interact.clear = clear;
soma.interact.addEvent = addEvent;
soma.interact.removeEvent = removeEvent;

// register for AMD module
if (typeof define === 'function' && define.amd) {
	define("soma-interact", soma.interact);
}

// export for node.js
if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = soma.interact;
	}
	exports = soma.interact;
}
