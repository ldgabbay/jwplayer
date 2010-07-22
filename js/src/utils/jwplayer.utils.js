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

/** Merges a list of objects **/
jwplayer.utils.extend = function() {
	var args = extend['arguments'];
	if (args.length > 0) {
		for (var i = args.length - 1; i > 0; i--){
			for (element in args[i]) {
				args[i-1][element] = args[i][element];
			}
		}
		return args[0];		
	}
	return null;
};

/** Updates the contents of an HTML element **/
jwplayer.utils.html = function(element, content){
	element.innerHTML = content;
};