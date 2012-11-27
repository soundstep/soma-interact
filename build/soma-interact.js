;(function (soma, undefined) {

	'use strict';

soma.template = soma.template || {};
soma.template.version = "0.0.6";

var errors = soma.template.errors = {
	TEMPLATE_STRING_NO_ELEMENT: "Error in soma.template, a string template requirement a second parameter: an element target - soma.template.create('string', element)",
	TEMPLATE_NO_PARAM: "Error in soma.template, a template requires at least 1 parameter - soma.template.create(element)"
};

var tokenStart = '{{';
var tokenEnd = '}}';
var helpersObject = {};
var helpersScopeObject = {};

var settings = soma.template.settings = soma.template.settings || {};

settings.autocreate = true;

var tokens = settings.tokens = {
	start: function(value) {
		if (isDefined(value) && value !== '') {
			tokenStart = escapeRegExp(value);
			setRegEX(value, true);
		}
		return tokenStart;
	},
	end: function(value) {
		if (isDefined(value) && value !== '') {
			tokenEnd = escapeRegExp(value);
			setRegEX(value, false);
		}
		return tokenEnd;
	}
};

var attributes = settings.attributes = {
	skip: "data-skip",
	repeat: "data-repeat",
	src: "data-src",
	href: "data-href",
	show: "data-show",
	hide: "data-hide",
	cloak: "data-cloak",
	checked: "data-checked",
	disabled: "data-disabled",
	multiple: "data-multiple",
	readonly: "data-readonly",
	selected: "data-selected",
	template: "data-template"
};

var vars = settings.vars = {
	index: "$index",
	key: "$key"
};

var regex = {
	sequence: null,
	token: null,
	expression: null,
	escape: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
	trim: /^[\s+]+|[\s+]+$/g,
	repeat: /(.*)\s+in\s+(.*)/,
	func: /(.*)\((.*)\)/,
	params: /,\s+|,|\s+,\s+/,
	quote: /\"|\'/g,
	content: /[^.|^\s]/gm,
	depth: /..\//g,
	string: /^(\"|\')(.*)(\"|\')$/
};

function createTemplate(source, target) {
	var element;
	if (isString(source)) {
		// string template
		if (!isElement(target)) {
			throw new Error(soma.template.errors.TEMPLATE_STRING_NO_ELEMENT);
		}
		target.innerHTML = source;
		element = target;
	}
	else if (isElement(source)) {
		if (isElement(target)) {
			// element template with target
			target.innerHTML = source.innerHTML;
			element = target;
		}
		else {
			// element template
			element = source;
		}
	}
	else {
		throw new Error(soma.template.errors.TEMPLATE_NO_PARAM);
	}
	// existing template
	if (getTemplate(element)) {
		getTemplate(element).dispose();
		templates.remove(element);
	}
	// create template
	var template = new Template(element);
	templates.put(element, template);
	return template;
}

function getTemplate(element) {
	if (!isElement(element)) return null;
	return templates.get(element);
}

function renderAllTemplates() {
	for (var key in templates.getData()) {
		templates.get(key).render();
	}
}

function appendHelpers(obj) {
	if (obj === null) {
		helpersObject = {};
		helpersScopeObject = {};
	}
	if (isDefined(obj) && isObject(obj)) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				helpersObject[key] = helpersScopeObject[key] = obj[key];
			}
		}
	}
	return helpersObject;
}

// set regex
tokens.start(tokenStart);
tokens.end(tokenEnd);

// plugins

soma.plugins = soma.plugins || {};

function TemplatePlugin(instance, injector) {
	instance.constructor.prototype.createTemplate = function(cl, domElement) {
		if (!cl || typeof cl !== "function") {
			throw new Error("Error creating a template, the first parameter must be a function.");
		}
		if (domElement && isElement(domElement)) {
			var template = soma.template.create(domElement);
			for (var key in template) {
				if (typeof template[key] === 'function') {
					cl.prototype[key] = template[key].bind(template);
				}
			}
			cl.prototype.render = template.render.bind(template);
			var childInjector = this.injector.createChild();
			childInjector.mapValue("template", template);
			childInjector.mapValue("scope", template.scope);
			childInjector.mapValue("element", template.element);
			return childInjector.createInstance(cl);
		}
		return null;
	}
	soma.template.bootstrap = function(attrValue, element, func) {
		instance.createTemplate(func, element);
	}
}
if (soma.plugins && soma.plugins.add) {
	soma.plugins.add(TemplatePlugin);
}

// exports
soma.template.create = createTemplate;
soma.template.get = getTemplate;
soma.template.renderAll = renderAllTemplates;
soma.template.helpers = appendHelpers;
soma.template.bootstrap = bootstrapTemplate;

// register for AMD module
if (typeof define === 'function' && define.amd) {
	define("soma-template", soma.template);
}

// export for node.js
if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = soma.template;
	}
	exports = soma.template;
}

})(this['soma'] = this['soma'] || {});