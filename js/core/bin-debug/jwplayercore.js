jwplayer = function(){};
jwplayer.utils = function(){};
jwplayer.utils.selectors = function(selector){
	selector = jwplayer.utils.strings.trim(selector);
	var selectType = selector.charAt(0);
	if (selectType == "#"){
		return document.getElementById(selector.substr(1));
	} else if (selectType == "."){
		if (document.getElementsByClassName) {
			return document.getElementsByClassName(selector.substr(1));
		} else {
			return jwplayer.utils.selectors.getElementsByTagAndClass("*", selector.substr(1));
		}
	} else {
		if (selector.indexOf(".") > 0){
			selectors = selector.split(".");
			return jwplayer.utils.selectors.getElementsByTagAndClass(selectors[0], selectors[1]);
		} else {
			return document.getElementsByTagName(selector);
		}
	}
	return null;
};

jwplayer.utils.selectors.getElementsByTagAndClass = function(tagName, className){
	elements = [];
	for (element in document.getElementsByTagName(tagName)){
		if ((element.className !== undefined) && (element.className.indexOf(className) > 1)){
			elements.push(element);
		}			
	}
	return elements;
};
jwplayer.utils.strings = function(){};

jwplayer.utils.strings.trim = function(inputString){
	// http://www.delphifaq.com/faq/f1031.shtml
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};
