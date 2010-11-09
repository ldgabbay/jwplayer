jwplayer.utils.strings = function(){};

/** Removes whitespace from the beginning and end of a string **/
jwplayer.utils.strings.trim = function(inputString){
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};

/** Returns the extension of a file name **/
jwplayer.utils.strings.extension = function(path) {
	return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
};