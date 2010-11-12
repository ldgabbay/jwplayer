jwplayer.utils.strings = function(){};

/** Removes whitespace from the beginning and end of a string **/
jwplayer.utils.strings.trim = function(inputString){
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};