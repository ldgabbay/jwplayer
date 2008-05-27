// EVENTS
function colorChangedEvent(sender, args) {
    addLog("ColorChangedEvent handled");
}

function bindSilverlightEvents()
{
    var control = document.getElementById("SilverlightControl");
    control.Content.Page.ColorChangedEvent = colorChangedEvent;
}  
 
// TOOLS
function addLog(text)
{
    // Add line to event history
    var pastEvents = document.getElementById("pastEvents");     
    var p = document.createElement("p");
    p.innerHTML = text;    
    pastEvents.appendChild(p);
}

function emptyTag(id)
{
    var element = document.getElementById(id);
    while (element.hasChildNodes())
    {
        element.removeChild(element.firstChild);
    }
}

// INIT PARAMS
function showInitParams(sender)
{
    // Retrieve a reference to the silverlight control.
    var control = document.getElementById('SilverlightControl');
   
    // Retrieve the InitParams value and split comma-delimited string.
    var params = control.initParams.split(",");

    // Display the parameter values.
    var msg = "Params: ";
    for (var i = 0; i < params.length; i++)
    {
        msg += "[" + params[i] + "], ";
    }
    
    addLog(msg);
}