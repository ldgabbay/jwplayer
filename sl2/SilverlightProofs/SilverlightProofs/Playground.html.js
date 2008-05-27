// JScript source code

//contains calls to silverlight.js, example below loads Page.xaml
function createSilverlight()
{
    // The createObjectEx() method uses JSON syntax to pass all of the parameter values,
    // whereas the createObject() method uses JSON for only some of the parameters, such as the properties and event handlers.
	Silverlight.createObjectEx({
		source: "Page.xaml",
		parentElement: document.getElementById("SilverlightControlHost"),
		id: "SilverlightControl",
		properties: {
			width: "100%",
			height: "100%",
			version: "1.1",
			enableHtmlAccess: "true"
		},
		events: {
		    // The OnLoad event will be invoked once after the loaded events on every element on the tree has been fired.
		    // The OnLoad event is an approximation of "the tree has been laid out and about to be rendered."
		    // The event is fired only the first time the content is loaded.
		    onLoad: OnLoaded
		},
		// User-defined initialization values that can be passed to a Silverlight control instance as it loads.
		initParams: "autostart=true, repeat=false",
		// Unique identifier that can be accessed in the OnLoad event. Useful when multiple Silverlight controls may be defined in a page.
		context: null
	});
	   
	// Give the keyboard focus to the Silverlight control by default
    document.body.onload = function() {
      var silverlightControl = document.getElementById('SilverlightControl');
      if (silverlightControl)
      silverlightControl.focus();
    }
}
 
function OnLoaded(sender, args)
{ 
    // This OnLoaded global event handler for the onLoad event should be used for binding other events within our silverlight control.
    bindSilverlightEvents();
    
    showInitParams(sender);
}
