.. _options:

Configuration Options
=====================

Here's a list of all configuration options (flashvars) the player accepts. Options are entered in the :ref:`embed code <embedding>` to set how the player looks and functions.

Encoding
--------

First, a note on encoding. You must URL encode the three glyphs **?** **=** **&** inside flashvars, because of the way these flashvars are loaded into the player (as a querystring). The urlencoded values for these symbols are listed here:

 * ? → %3F
 * = → %3D
 * & → %26

If, for example, your **file** flashvar is at the location *getplaylist.php?id=123&provider=flv*, you must encode the option to:

.. code-block:: html

   getplaylist.php%3Fid%3D123%26provider%3Dflv

The player will automatically URLdecode every option it receives.



.. _options-playlist:

Playlist properties
-------------------

To load a playlist, only a single flashvars is required:

.. describe:: playlistfile ( undefined ) 

   Location of an :ref:`XML playlist <playlistformats>` which will be loaded as the player :ref:`starts <startup>`.

The following flashvars can be set instead of **playlistfile**. They are used to create a playlist with a single item.  They set various properties of the :ref:`media item <playlistformats>` to load (e.g. the source file or preview image or title). Those properties are:

.. describe:: duration ( 0 )

   Duration of the file in seconds. Set this to present the duration in the controlbar before the video starts. It can also be set to a shorter value than the actual file duration. The player will restrict playback to only that section.

.. describe:: file ( undefined )

   Location of the file or playlist to play, e.g. *http://www.mywebsite.com/myvideo.mp4*.

.. describe:: image ( undefined )

   Location of a preview (poster) image; shown in display before the video starts.

.. describe:: link ( undefined )

   URL to an external page the display can link to (see *displayclick* below). Sharing - related plugins also use this link.

.. describe:: mediaid ( undefined )

   Unique string (e.g. *9Ks83JsK*) used to identify this media file. Is used by certain plugins, e.g. for the targeting of advertisements. The player itself doesn't use this ID anywhere.

.. describe:: provider ( undefined )

   Set this flashvar to tell the player in which format (regular/streaming) the player is. By default, the **provider** is detected by the player based upon the file extension. If there is no suiteable extension, it can be manually set. The following provider strings are supported:

   * **video**: progressively downloaded FLV / MP4 video, but also AAC audio. See :ref:`mediaformats`.
   * **sound**: progressively downloaded MP3 files. See :ref:`mediaformats`.
   * **image**: JPG/GIF/PNG images. See :ref:`mediaformats`.
   * **youtube**: videos from Youtube. See :ref:`mediaformats`.
   * **http**: FLV/MP4 videos using HTTP pseudo-streaming. See :ref:`httpstreaming`.
   * **rtmp**: FLV/MP4/MP3 files or live streams using RTMP streaming. See :ref:`httpstreaming`.

   .. note::
      
      In addition to these built-in providers, it is possible to load custom providers into the JW Player, e.g. for *Livestream.com* channels. Custom providers are packed in a separate SWF file, much like a **plugin**. 

      A number of custom providers is available from our `addons repository <http://www.longtailvideo.com/addons/>`_. Third party developers interested in building a custom provider should check our our `developer site <http://developer.longtailvideo.com/>`_, which includes documentation and a MediaProvider SDK.

.. describe:: start ( 0 )

   Position in seconds where playback should start. This option works for :ref:`httpstreaming`, :ref:`rtmpstreaming` and the MP3 and Youtube :ref:`files <mediaformats>`. It does not work for regular videos.

.. describe:: streamer ( undefined )

   Location of an RTMP or HTTP server instance to use for streaming. Can be an RTMP application or external PHP/ASP file. See :ref:`rtmpstreaming` and :ref:`httpstreaming`.

.. note::

   Technically, any playlist item property is also available as an option. In practice though, the properties *author*, *date*, *description*,tags* and *title* are not used anywhere if a single media file is loaded.




.. _options-layout:

Layout
------

These flashvars control the looks of the player. 

.. describe:: controlbar ( bottom )

   Position of the controlbar. Can be set to *bottom*, *over* and *none*.

.. describe:: dock ( false )

   set this to **true** to list plugin buttons in display. By default (*false*), plugin buttons are shown in the controlbar.

.. describe:: playlist ( none )

   Position of the playlist. Can be set to **bottom**, **right**, **left**, **over** or **none**.

.. describe:: playlistsize ( 180 )

   When the playlist is positioned below the display, this option can be used to change its height. When the playlist lives left or right of the display, this option represents its width. In the other cases, this option isn't needed.

.. describe:: skin ( undefined )

   Location of a so-called **skin**, an SWF file with the player graphics. Our `addons repository <http://www.longtailvideo.com/addons>`_ contains a list of available skins.

The player has a simple :ref:`layout engine <layout>` which positions the controlbar, the playlist, and any positioned plugins.




.. _options-behavior:

Behaviour
---------

These flashvars control the playback behaviour of the player. 

.. describe:: autostart ( false )

   Set this to *true* to automatically start the player on load.

.. describe:: bufferlength ( 1 )

   Number of seconds of the file that has to be loaded before the player starts playback. Set this to a low value to enable instant-start (good for fast connections) and to a high value to get less mid-stream buffering (good for slow connections).

.. describe:: displayclick ( play )

   What to do when a user clicks the display. Can be:

   * **play**: toggle playback
   * **link**: jump to the URL set by the *link* flashvar. 
   * **none**: do nothing (the handcursor is also not shown).

.. describe:: item ( 0 )

    :ref:`Playlist item <playlistformats>` that should start to play. Use this to start the player with a specific item instead of with the first item.

.. describe:: mute ( false )

   Mute the sounds on startup. Is saved in a cookie.

.. describe:: playerready ( undefined )

   By default, the player calls a :ref:`playerReady() <javascriptapi>` javascript function when it is initialized. This option is used to let the player call a different function after it's initialized (e.g. *registerPlayer()*).

.. describe:: plugins ( undefined )

   A powerful feature, this is a comma-separated list of plugins to load (e.g. **hd,viral**). Plugins are separate SWF files that extend the functionality of the player, e.g. with advertising, analytics or viral sharing features. Visit `our addons repository <http://www.longtailvideo.com/addons/>`_ to browse the long list of available plugins.

.. describe:: repeat ( none )

   What to do when the mediafile has ended. Has several options:

   * **none**: do nothing (stop playback) whever a file is completed.
   * **list**: play each file in the playlist once, stop at the end.
   * **always**: continously play the file (or all files in the playlist).
   * **single**: continously repeat the current file in the playlist.

.. describe:: shuffle ( false )

   Shuffle playback of playlist items. The player will randomly pick the items.

.. describe:: smoothing ( true )

   This sets the smoothing of videos, so you won't see blocks when a video is upscaled. Set this to **false** to disable the feature and get performance improvements with old computers / big files.

.. describe:: stretching ( uniform )

   Defines how to resize the poster image and video to fit the display. Can be:

   * **none**: keep the original dimensions.
   * **exactfit**: disproportionally stretch the video/image to exactly fit the display.
   * **uniform**: stretch the image/video while maintaining its aspect ratio. There'll be black borders.
   * **fill**: stretch the image/video while maintaining its aspect ratio, completely filling the display.

.. describe:: volume ( 90 )

   Startup audio volume of the player. Can be 0 to 100.




.. _options-colors:

Colors
------

These flashvars are available when using 4.x (SWF) skins.  They will be deprecated once SWF skinning support is dropped in a future release.

.. describe:: backcolor ( ffffff )

   background color of the controlbar and playlist. This is white  by default.

.. describe:: frontcolor ( 000000 )

   color of all icons and texts in the controlbar and playlist. Is black by default.

.. describe:: lightcolor ( 000000 )

   Color of an icon or text when you rollover it with the mouse. Is black by default.

.. describe:: screencolor ( 000000 )

   Background color of the display. Is black by default.


The four color flashvars must be entered using hexadecimal values, as is common for `web colors <http://en.wikipedia.org/wiki/Web_colors#Hex_triplet>`_ (e.g. *FFCC00* for bright yellow).




.. _options-logo:

Logo
----

Unlicensed copies of the JW Player contain a small watermark that pops up when the player is buffering. In licensed copies of the player, this watermark is empty by default. It is possible to place your own watermark in the player using the following options:

.. describe:: logo.file ( undefined )

   Location of an external JPG, PNG or GIF image to be used as watermark. PNG images with transparency give the best results.

.. describe:: logo.link ( undefined )

   HTTP link to jump to when the watermark image is clicked. If it is not set, a click on the watermark does nothing.

.. describe:: logo.linktarget ( _blank )

   Link target for logo click.  Can be *_self*, *_blank*, *_parent*, *_top* or a named frame.

.. describe:: logo.hide ( true ) 

   By default, the logo will automatically show when the player buffers and hide 5 seconds later. When this option is set *false*, the logo will stay visible all the time.

.. describe:: logo.position ( bottom-left )

   This sets the corner in which to display the watermark. It can be one of the following:

   * **bottom-left**
   * **bottom-right**
   * **top-left**
   * **top-right**


.. note::

   Once again: the logo options can only be used for licensed players!




Config XML
----------

All options can be listed in an XML file and then fed to the player with a single option:

.. describe:: config ( undefined )

   location of a XML file with flashvars. Useful if you want to keep the actual embed codes short. Here's an example:

Here is an example of such an XML file:

.. code-block:: xml

   <config>
     <file>files/bunny.mp4</file>
     <image>files/bunny.jpg</image>
     <repeat>true</repeat>
     <backcolor>333333</backcolor>
     <volume>40</volume>
     <controlbar>over</controlbar>
   </config>

Options set in the embed code will overwrite those set in the config XML.

.. note:: 

   Due to the :ref:`crossdomain` restrictions of Flash, you cannot load a config XML from one domain in a player on another domain. This issue can be circumvented by placing a *crossdomain.xml* file on the server that hosts your XML.
