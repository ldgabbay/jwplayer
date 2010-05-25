.. _options:

=====================
Configuration options
=====================

Here's a list of all flashvars the player accepts. Flashvars are variables entered in the embed HTML code to set how the player looks and functions. The setting of all these flashvars can be accessed  through javascript and by plugins. For more info, [wiki:Player5Api see the API page].

Some of these flashvars represent a certain status: they are read-only and automatically updated by the player. Plugins and Javascripts may [wiki:Player5Api request through the API]. 

Note that you must urlencode the three glyphs ? = & inside flashvars, because of the way these flashvars are loaded into the player. The urlencoded values for these symbols are listed here:

 * ? → %3F
 * = → %3D
 * & → %26

So if, fore example, your *file* flashvar is at the location *getplaylist.php?id=123&type=flv*, you must set the file flashvar to *getplaylist.php%3Fid%3D123%26type%3Dflv*.

.. _options-playlist:

Playlist properties
===================

To load a playlist, only a single flashvars is required:

 * **playlistfile** (*undefined*): Location of an [wiki:Player5Formats#XMLPlaylists XML playlist] which will be loaded as the player [wiki:Player5Startup starts].

The following flashvars can be set instead of **playlistfile**, and are used to create a playlist with a single item.  They set various properties of the :ref:`media item <playlistitem>` to load (e.g. the source file, preview image or title).  Those properties are:

 * **author** (*undefined*): author of the video, shown in the display or playlist.
 * **date** (*undefined*): publish date of the media file. Available since 4.3. 
 * **description** (*undefined*): text description of the file.
 * **duration** (*0*): duration of the file in seconds.
 * **file** (*undefined*): location of the mediafile or playlist to play.
 * **image** (*undefined*): location of a preview image; shown in display and playlist.
 * **mediaid** (*String*): Unique value used to identify the media file.  Used for certain plugins.
 * **start** (*0*): position in seconds where playback has to start. Won't work for regular (progressive) videos, but only for streaming (HTTP / RTMP).
 * **streamer** (*undefined*): location of an rtmp/http server instance to use for streaming. Can be an RTMP application or external PHP/ASP file. [wiki:Player5Formats More info here].
 * **tags** (*undefined*): keywords associated with the media file.  Available since 4.3.
 * **title** (*undefined*): title of the video, shown in the display or playlist.
 * **provider** (*undefined*): this is determines what type of mediafile this item is, and thus which provider the player should [wiki:Player5MediaProviders use for playback]. By default, the type is detected by the player based upon the file extension. If there's no suitable extension or the player detects the type wrong, it can be manually set. The following default types are supported:
   * *video*: progressively downloaded FLV / MP4 video, but also AAC audio.
   * *sound*: progressively downloaded MP3 files.
   * *image*: JPG/GIF/PNG images.
   * *youtube*: videos from Youtube.
   * *http*: FLV/MP4 videos played as http pseudo-streaming.
   * *rtmp*: FLV/MP4/MP3 files played from an RTMP server.

In addition to these default **providers**, the player has specific support for certain streaming servers or CDNs. A full list of mediafile types can be found on the :ref:`supported filetypes <mediaformats>` page.

.. _options-layout:

Layout
======

These flashvars control the look and layout of the player. 

 * **controlbar** (*bottom*): position of the controlbar. Can be set to *bottom*, *over* and *none*.
 * **dock** (*false*): set this to *true* to show the dock with large buttons in the top right of the player. Available since 4.5. 
 * **height** (*400*): height of the display in pixels. 
 * **icons** (*true*): set this to *false* to hide the play button and buffering icon in the middle of the video. Available since 4.2.
 * **logo.file** (*undefined*): location of an external jpg, png or gif image which replaces the watermark image (**Licensed players only**)
 * **logo.link** (*undefined*): link to direct to when the watermark image is clicked on (**Licensed players only**)
 * **logo.hide** (*true*): When set to true, the logo will auto-hide (**Licensed players only**)
 * **logo.position** (*bottom-left*): The corner in which to display the logo.  Can be *bottom-left*, *bottom-right*, *top-left* or *top-right* (**Licensed players only**)
 * **playlist** (*none*): position of the playlist. Can be set to *bottom*, *over*, *right* or *none*.
 * **playlistsize** (*180*): when *below* this refers to the height, when *right* this refers to the width of the playlist. 
 * **skin** (*undefined*): location of a [wiki:Player5Skinning skin file] containing the player graphics.  The [/browser SVN repository] contains [browser:skins a couple of example skins].
 * **width** (*280*): width of the display in pixels.

.. _options-colors:

Colors
======

These flashvars are available when using 4.x (SWF) skins.  They will be deprecated once SWF skinning support is dropped in a future release.

 * **backcolor** (*undefined*): background color of the controlbar and playlist. This is white with the default skin.
 * **frontcolor** (*undefined*): color of all icons and texts in the controlbar and playlist.
 * **lightcolor** (*undefined*): color of an icon or text when you rollover it with the mouse.
 * **screencolor** (*undefined*): background color of the display

The four color flashvars must be entered using hexadecimal values, as is common for [http://en.wikipedia.org/wiki/Web_colors#Hex_triplet web colors] (e.g. *FFCC00* for bright yellow).

.. _options-behavior:

Behavior
========

These flashvars control the playback behavior of the player. 

 * **autostart** (*false*): Automatically start the player on load.
 * **bufferlength** (*1*): Number of seconds of the file that has to be loaded before starting. Set this to a low value to enable instant-start and to a high value to get less mid-stream buffering.
 * **displaytitle** (*false*): Set this to *true* to print the title of a video in the display. (*Currently not implemented*)
 * **fullscreen** (*false*): Fullscreen state of the player. This is a read-only flashvar, useful for plugins. Available since 4.4. 
 * **item** (*0*): :ref:`Playlist item <playlistitem>` that should start to play. Use this to start the player with a specific item selected.
 * **mute** (*false*): Mute all sounds on startup.  This can be overridden by a user's cookie, which stores the user's last muting state.
 * **playerready** (*undefined*): Javascript callback when the player has completed its [wiki:Player5Startup setup].
 * **repeat** (*none*): Set to *list* to play the entire playlist once, to *always* to continously play the song/video/playlist and to *single* to continue repeating the selected file in a playlist.
 * **shuffle** (*false*): Randomly choose which playlist item to play.
 * **smoothing** (*true*): This sets the smoothing of videos, so you won't see blocks when a video is upscaled. Set this to *false* to get performance improvements with old computers / big files. Available since 4.4. 
 * **stretching** (*uniform*): Defines how to resize images in the display. Can be *none* (no stretching), *exactfit* (disproportionate), *uniform* (stretch with black borders) or *fill* (uniform, but completely fill the display).
 * **volume** (*90*): Startup volume of the player. Can be 0 to 100. The user's last volume setting is saved in a cookie and overrides this flashvar.

.. _options-api:

API
===

These flashvars relate to the API of the player:

 * **debug** (*undefined*): Set this to either *arthropod*, *console* or *trace* to let the player log events. Available since 4.5. Also saved as cookie since 4.6. More info in the [wiki:Player5PluginsBuilding#Debugging plugins documentation].
 * **plugins** (*undefined*): This is a comma-separated list of swf plugins to load (e.g. *yousearch,viral*). Each plugin has a unique ID and resides at *plugins.longtailvideo.com*. Go to [http://www.longtailvideo.com/AddOns/ the LongTailVideo AddOns section] to see all available plugins.
 * **id** (*undefined*): This flashvar is necessary for javascript interaction on linux platforms..  It should be set to the id of the player's DOM element.

.. _options-config-xml:

Config XML
==========

All of the above flashvars can also be listed in an XML file and then fed to the player with a single flashvars:

 * **config** (*undefined*): location of a XML file with flashvars. Useful for short embed codes or CDN stream redirecting. Here's an example:

.. code-block:: xml

	<config>
	   <image>files/bunny.jpg</image>
	   <repeat>true</repeat>
	   <backcolor>333333</backcolor>
	   <volume>40</volume>
	   <playlist>right</playlist>
	   <playlist.size>150</playlist.size>
	   <controlbar>over</controlbar>
	</config>

Flashvars set in the embed code will overwrite those in the config XML.