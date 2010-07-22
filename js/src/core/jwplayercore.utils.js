jwplayer.utils = function() {
};

/** Returns the true type of an object **/
jwplayer.utils.typeOf = function(value) {
	var s = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
		}
	return s;
};

jwplayer.utils.extend = function() {
	var arguments = extend.arguments;
	if (arguments.length == 1){
		return arguments[0];
	} else if (arguments.length == 2){
		for (element in arguments[1]) {
			arguments[0][element] = arguments[1][element];
		}
		return arguments[0];
	} else {
		var last = arguments[arguments.length-1];
		delete arguments[arguments.length-1];
		for (element in last) {
			arguments[arguments.length-1][element] = last[element];
		}
		return jwplayer.utils.extend(arguments);
	}
}
