.. _crossdomain:

====================
Crossdomain Security
====================

The Adobe Flash Player contains a `crossdomain security mechanism <http://www.adobe.com/devnet/flashplayer/security.html>`_, similar to JavaScript's `Cross-Site Scripting <http://en.wikipedia.org/wiki/Cross-site_scripting>`_ restrictions.   Flash's security model denies certain operations on files that are loaded from a different domain than the *player.swf*.  Roughly speaking, three basic operations are denied:

 * Loading of data files (such as :ref:`playlistformats`, :ref:`skins <skinning>` or `captions <http://developer.longtailvideo.com/trac/wiki/PluginsCaptions>`_).
 * Loading of SWF files (such as :ref:`plugins <buildingplugins>`). 
 * Accessing raw data of media files (such as `waveform data <http://developer.longtailvideo.com/trac/wiki/PluginsRevolt>`_ or `bitmap data <http://developer.longtailvideo.com/trac/wiki/PluginsSnapshot>`_).

Generally, file loads (playlists or captions) will fail if there's no crossdomain access. Attempts to access or manipulate data (ID3, waveform, smoothing) will abort. Crossdomain security restrictions can be lifted by either hosting a *crossdomain.xml* on the server that contains the files or by using a serverside *proxy*.

Crossdomain XML
===============

The easiest and best way to access 3rd party data is for the provider of that data to host a `crossdomain.xml configuration file <http://www.adobe.com/devnet/articles/crossdomain_policy_file_spec.html>`_ in its web root. Before the Flash Player attempts to load data from any site other than the one hosting the SWF, it first checks the remote site for the existence of a *crossdomain.xml* file. If Flash finds it, and if the configuration permits external access of its data, then the data is loaded. Otherwise, a runtime security error is thrown. Here’s an example of a *crossdomain.xml* that allows access to the domain's data from SWF files on any site:

.. code-block:: xml

	<?xml version="1.0"?>
	<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">
	
	<cross-domain-policy>
	    <allow-access-from domain="*" />
	</cross-domain-policy>


Our *plugins.longtailvideo.com* domain includes such a crossdomain file, so players from any domain cal load the plugins hosted there.

Although plugins will reside on *plugins.longtailvideo.com* (or on another server which hosts your plugins), the *crossdomain.xml* file needs to allow data access from the site hosting the player itself, not the plugin. For example, if the player is hosted at *www.site.com/player.swf* and tries to access data from *www.data.com*, even if data.com's *crossdomain.xml* file allows access to *plugins.longtailvideo.com*, the Flash player will throw a security exception.

Using a proxy
=============

If the site from which you’d like to pull data does not host a crossdomain.xml policy file, you can still give users access to that data by hosting a proxy on your web server. A proxy is a simple program that tunnels all external data through your server. Yahoo has `some more info on proxies <http://developer.yahoo.com/javascript/howto-proxy.html>`_ and you can find `a PHP proxy example <http://developer.yahoo.com/javascript/samples/proxy/php_proxy_simple.txt>`_ here. 

When you host the proxy for players that are on other sites (e.g. in case of a plugin), your site in turn needs to include a permissive *crossdomain.xml* policy file.

Local playback
==============

When embedding the player in a locally served page or SWF (not on  a http:// server), the following restrictions apply:

 * Javascript interaction will NOT work.
 * Any files loaded from the web may not play.