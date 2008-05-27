In this project, the following proofs are performed:
====================================================

[C# -> C#]
* Clicking on the rectangle fires an event to C# code coloring the rectangle RED. The event is attached from C#
[XAML -> C#]
* Focussing the rectangle fires an event to C# code coloring the rectangle YELLOW. The event is attached from XAML

[JS -> C#]
* JS calls scriptable managed code in C# to color the rectangle GREEN.
[C# -> JS]
* Changing a color fires an event from managed CS to JS code indicating a color change.
* Also the DoNotSubscribeToThisEvent is invoked, which should have no subscribers, to check for any JS errors.
[XAML -> JS]
* Probably not possible since the MouseLeave="javascript:rectangleMouseOut" isn't allowed in SL 1.1 anymore.
  The codebehind is C#, so no direct javascript access without going through C#.

[InitParms (==FlashVars) -> C#]
* All params are displayed on canvas by parseInitParams()
[InitParms (==FlashVars) -> JS]
* All params are displayed in the log by showInitParams()

[Persisent Storage -> C#, C# -> Persistent Storage]
* A key-value pair is set, get, reset through an external DLL controlling the persistent store.

[Custom Silverlight Controls]
* A seperate class library (SilverlightToolbox) holds a DefaultButton Control that is included in the proofs XAML.
  Standard controls may be found in the Silverlight SDK. They're not part of the default distribution.
  
[Unittesting]
* The WatiN framework, used in SilverlightToolboxTests, supports Nunit style tests through IE for Silverlight applications.
  If used with TestDriven.NET, it's easy to use.

[Cross-Domain downloading]
* The Downloader class allows downloading files from the same domain. However, while debugging a silverlight app, it's
  loaded into the browser using a file:// URL. The Downloader doesn't behave well with these URLs. Therefore, a Web project
  is added to aid the debugging process. It's almost empty and links into the SilverlightProofs project.
  The URL while debugging now starts with http://localhost:51167 which the Download does like better.
  Deployed on a real webserver, there's no need to the SilverlightWeb project anymore.

[XML DOM]
* Silverlight doesn't contain any classes for traversing the DOM tree. No XMLDocument as in the full .NET 2.0 framework.
  Got a small implementation that resembles the most important functionality.

[XSPF parsing]
* The XSPF parsing functionality for playlists and tracks is working with the above DOM implementation.


INTERESTING URLS:
=================

[SL 1.1 tutorial collections]
http://silverlight.net/quickstarts/managed.aspx
http://channel9.msdn.com/wiki/default.aspx/Channel9.SilverlightFAQ

[InitParams]
http://msmvps.com/blogs/luisabreu/archive/2007/06/20/getting-your-initparams-from-managed-code.aspx

[Events]
http://blogs.msdn.com/devdave/archive/2007/05/21/calling-javascript-from-c.aspx

[Timer]
Through js:
http://dotupdate.wordpress.com/2007/08/13/timer-for-silverlight-11/
Through xaml:

[Dynamic XAML loading]
Through cs:
http://community.irritatedvowel.com/blogs/pete_browns_blog/archive/2007/10/12/UserControls-as-Screens-in-Silverlight-1.1.aspx
Through js:
http://www.silverlight.net/QuickStarts/BuildUi/SplashScreen.aspx

[Cross Domain downloading]
http://blogs.msdn.com/vasukipsarathy/archive/2007/11/06/silverlight-1-1-ajax-futures-and-web-service.aspx
http://dedjo.blogspot.com/2007/06/cross-domain-calls-and-server-side.html

Silverlight 2.0 (now known as 1.1) is to be released at Mix'08 at 5-8 march 2008

