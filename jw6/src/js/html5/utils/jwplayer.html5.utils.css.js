/**
 * CSS utility methods for the JW Player.
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
	var utils = jwplayer.utils,
		_styleSheets={},
		_styleSheet,
		_rules = {},
		_cssBlock = null,
		_ruleIndexes = {},
		_debug = false,
				
		JW_CLASS = '.jwplayer ';

	function _createStylesheet(debugText) {
		var styleSheet = document.createElement("style");
		if (debugText) {
			styleSheet.innerText = debugText;
		}
		styleSheet.type = "text/css";
		document.getElementsByTagName('head')[0].appendChild(styleSheet);
		return styleSheet;
	}
	
	var _css = utils.css = function(selector, styles, important) {
		important = important || false;
		
		if (!_rules[selector]) {
			_rules[selector] = {};
		}

		if (!_updateStyles(_rules[selector], styles, important)) {
			//no change in css
			return;
		}
		if (_debug) {
			// add a new style sheet with css text and exit
			if (_styleSheets[selector]) {
				_styleSheets[selector].parentNode.removeChild(_styleSheets[selector]);
			}
			_styleSheets[selector] = _createStylesheet( _getRuleText(selector) );
			return;
		}
		if (!_styleSheets[selector]) {
			// set stylesheet for selector
			if (!_styleSheet || _styleSheet.sheet.cssRules.length > 50000) {
				_styleSheet = _createStylesheet();
			}
			_styleSheets[selector] = _styleSheet;
		}
		if (_cssBlock !== null) {
			_cssBlock.styleSheets[selector] = _rules[selector];
			// finish this later
			return;
		}
		_updateStylesheet(selector);
	};

	_css.style = function(elements, styles) {
		if (elements.length === undefined) {
			elements = [elements];
		}

		var cssRules = {};
		_updateStyleAttributes(cssRules, styles);

		if (_cssBlock !== null) {
			elements.__cssRules = _extend(elements.__cssRules, cssRules);
			if (_cssBlock.elements.indexOf(elements) < 0) {
				_cssBlock.elements.push(elements);
			}
			// finish this later
			return;
		}
		_updateElementsStyle(elements, cssRules);
	};

	_css.block = function(id) {
		// use id so that the first blocker gets to unblock
		if (_cssBlock === null) {
			// console.time('block_'+id);
			_cssBlock = {
				id: id,
				styleSheets: {},
				elements: []
			};
		}
	};
	
	_css.unblock = function(id) {
		if (_cssBlock && _cssBlock.id === id) {
			// IE9 limits the number of style tags in the head, so we need to update the entire stylesheet each time
			for (var selector in _cssBlock.styleSheets) {
				_updateStylesheet(selector);
			}

			for (var i=0; i<_cssBlock.elements.length; i++) {
				var elements = _cssBlock.elements[i];
				_updateElementsStyle(elements, elements.__cssRules);
			}

			_cssBlock = null;
			// console.timeEnd('block_'+id);
		}
	};
	
	function _extend(target, source) {
		target = target || {};
		for (var prop in source) {
			target[prop] = source[prop];
		}
		return target;
	}

	function _updateStyles(cssRules, styles, important) {
		var dirty = false,
			style, val;
		for (style in styles) {
			val = _styleValue(style, styles[style], important);
			if (val !== '') {
				if (val !== cssRules[style]) {
					cssRules[style] = val;
					dirty = true;
				}
			} else if (cssRules[style] !== undefined) {
				delete cssRules[style];
				dirty = true;
			} 
		}
		return dirty;
	}

	function _updateStyleAttributes(cssRules, styles) {
		for (var style in styles) {
			cssRules[style] = _styleValue(style, styles[style]);
		}
	}

	function _styleAttributeName(name) {
		name = name.split('-');
		for (var i=1; i<name.length; i++) {
			name[i] = name[i].charAt(0).toUpperCase() + name[i].slice(1);
		}
		return name.join('');
	}

	function _styleValue(style, value, important) {
		if (!utils.exists(value)) {
			return '';
		}
		var importantString = important ? ' !important' : '';

		//string
		if (isNaN(value)) {
			if (!!value.match(/png|gif|jpe?g/i) && value.indexOf('url') < 0) {
				return "url(" + value + ")";
			}
			return value + importantString;
		}
		// number
		if (value === 0 ||
			style === 'z-index' ||
			style === 'opacity') {
			return '' + value + importantString;
		}
		if (style.match(/color/i)) {
			return "#" + utils.pad(value.toString(16).replace(/^0x/i,""), 6) + importantString;
		}
		return Math.ceil(value) + "px" + importantString;
	}

	function _updateElementsStyle(elements, cssRules) {
		for (var i=0; i<elements.length; i++) {
			var element = elements[i],
				style, styleName;
			for (style in cssRules) {
				styleName = _styleAttributeName(style);
				if (element.style[styleName] !== cssRules[style]) {
					element.style[styleName] = cssRules[style];
				}
			}
		}
	}

	function _updateStylesheet(selector) {
		var sheet = _styleSheets[selector].sheet,
			cssRules,
			ruleIndex,
			ruleText;
		if (sheet) {
			cssRules = sheet.cssRules;
			ruleIndex = _ruleIndexes[selector];
			ruleText = _getRuleText(selector);
			
			if (ruleIndex !== undefined && ruleIndex < cssRules.length && cssRules[ruleIndex].selectorText === selector) {
				if (ruleText === cssRules[ruleIndex].cssText) {
					//no update needed
					return;
				}
				sheet.deleteRule(ruleIndex);
			} else {
				ruleIndex = cssRules.length;
				_ruleIndexes[selector] = ruleIndex;  
			}
			sheet.insertRule(ruleText, ruleIndex);
		}
	}
	
	function _getRuleText(selector) {
		var styles = _rules[selector];
		selector += ' { ';
		for (var style in styles) {
			selector += style + ': ' + styles[style] + '; ';
		}
		return selector + '}';
	}
	
	
	/**
	 * Removes all css elements which match a particular style
	 */
	utils.clearCss = function(filter) {
		for (var rule in _rules) {
			if (rule.indexOf(filter) >= 0) {
				delete _rules[rule];
			}
		}
		for (var selector in _styleSheets) {
			if (selector.indexOf(filter) >= 0) {
				_updateStylesheet(selector);
			}
		}
	};
	
	utils.transform = function(element, value) {
		var transform = "-transform", style;
		value = value ? value : "";
		if (typeof element == "string") {
			style = {};
			style['-webkit'+transform] = value;
			style['-ms'+transform] = value;
			style['-moz'+transform] = value;
			style['-o'+transform] = value;
			utils.css(element, style);
		} else {
			transform = "Transform";
			style = element.style;
			style['webkit'+transform] = value;
			style['Moz'+transform] = value;
			style['ms'+transform] = value;
			style['O'+transform] = value;
		}
	};
	
	utils.dragStyle = function(selector, style) {
		utils.css(selector, {
			'-webkit-user-select': style,
			'-moz-user-select': style,
			'-ms-user-select': style,
			'-webkit-user-drag': style,
			'user-select': style,
			'user-drag': style
		});
	};
	
	utils.transitionStyle = function(selector, style) {
		// Safari 5 has problems with CSS3 transitions
		if(navigator.userAgent.match(/5\.\d(\.\d)? safari/i)) return;
		
		utils.css(selector, {
			'-webkit-transition': style,
			'-moz-transition': style,
			'-o-transition': style,
			transition: style
		});
	};

	
	utils.rotate = function(domelement, deg) {
		utils.transform(domelement, "rotate(" + deg + "deg)");
	};
	
	utils.rgbHex = function(color) {
		var hex = String(color).replace('#','');
		if (hex.length === 3) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		return '#'+hex.substr(-6);
	};

	utils.hexToRgba = function(hexColor, opacity) {
		var style = 'rgb';
		var channels = [
			parseInt(hexColor.substr(1, 2), 16),
			parseInt(hexColor.substr(3, 2), 16),
			parseInt(hexColor.substr(5, 2), 16)
		];
		if(opacity !== undefined && opacity !== 100) {
			style += 'a';
			channels.push(opacity / 100);
		}
		return style +'('+ channels.join(',') +')';
	};

	(function cssReset() {
		_css(JW_CLASS.slice(0, -1) + ["", "div", "span", "a", "img", "ul", "li", "video"].join(", "+JW_CLASS) + ", .jwclick", {
			margin: 0,
			padding: 0,
			border: 0,
			color: '#000000',
			'font-size': "100%",
			font: 'inherit',
			'vertical-align': 'baseline',
			'background-color': 'transparent',
			'text-align': 'left',
			'direction':'ltr',
			'-webkit-tap-highlight-color': 'rgba(255, 255, 255, 0)'
		});
		
		_css(JW_CLASS + "ul", { 'list-style': "none" });
	})();
	
})(jwplayer);
