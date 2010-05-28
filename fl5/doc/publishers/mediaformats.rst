.. _mediaformats:

=============
Media Formats
=============

Supported Media Files
=====================

The JW Player always tries to recognize a file format by its extension. If no suitable extension is found, **the player will presume you want to load a** :ref:`playlist <playlistformats>`! Get around this issue by setting the :ref:`provider  option <options>`, e.g. *provider=video*.

.. csv-table:: Supported Media Formats
	:widths: 5 5 5 10
	:header: "Format",													"Media Type",		:ref:`Provider <playlistitem>`,	Notes

	`FLV <http://en.wikipedia.org/wiki/Flv>`_,							Video,				video,							""
	`MP4 <http://en.wikipedia.org/wiki/H.264>`_,						Video,				video,							"MP4 files must be encoded in the H.264 format"
	`AAC <http://en.wikipedia.org/wiki/Advanced_Audio_Coding>`_,		Audio,				video,							"Audio in AAC format must use the *video* provider."
	`MP3 <http://en.wikipedia.org/wiki/MP3>`_,							Audio,				sound,							""
	`JPG <http://www.w3.org/Graphics/JPEG/>`_,							Image,				image,							""
	`GIF <http://en.wikipedia.org/wiki/Gif>`_,							Image,				image,							""
	`PNG <http://en.wikipedia.org/wiki/Portable_Network_Graphics>`_,	Image,				image,							""

For example, to load an MP3 file, set the *provider* flashvar or playlist property to *sound*.
	
Here's a list of commonly-encountered issues:

 * Though SWF files also load in the player, it is discouraged to use them. The player cannot read the duration and dimensions of SWF files and cannot control its volume or playback.
 * If you cannot seek within an MP4 file be before it is completely downloaded, the cause of this problem is that the so-called MOOV atom (which contains the seeking information) is located at the end of your video.  Check out `this little application <http://renaun.com/blog/2007/08/22/234/>`_ to parse your videos and fix them.
 * If you encounter too fast or too slow playback of MP3 files, it most likely contains variable bitrate encoding or unsupported sample frequencies (eg 48Khz). Please stick to constant bitrate encoding and 44 kHz. `iTunes <http://www.apple.com/itunes>`_ has a decent MP3 encoder. Note that versions 4 and 5 of the JW Player for Flash actually support fewer formats than the 3.x player (this is due to bugs in the `AVM2 <http://www.adobe.com/devnet/actionscript/articles/avm2overview.pdf>`_).
 * If the progress bar isn't running with your FLV file, or if your video dimensions are wrong, this means that your FLV lacks important metadata. Fix this by using the small tool from http://www.buraks.com/flvmdi/.

More technical info on the file formats supported by Flash can be found in [http://www.kaourantin.net/2007/08/what-just-happened-to-video-on-web_20.html this blogpost] from Tinic Uro, one of the developers of the Flash plugin.  Open Source Flash has another great article on [http://osflash.org/flv supported Flash file formats].

YouTube Videos
==============

The player includes native support for playing back Youtube videos (*provider=youtube*). Set this up by assigning the **file** flashvar to the URL of the Youtube video you want to play (e.g. *http://www.youtube.com/watch#!v=cyfyiEAI8P0*).

The player uses the official `YouTube API <http://code.google.com/apis/youtube/>`_ for this functionality. This API is accessed through the separate **yt.swf** file, which is included in the player download. In order for YouTube videos to play, **you must place the yt.swf file in the same folder as you place player.swf on your webserver**. 

The player currently does not support playback of high-quality YouTube videos.


Streaming Video
===============

The JW Player supports two types of streaming servers, :ref:`RTMP Streaming <rtmpstreaming>` and :ref:`HTTP Pseudo-Streaming <httpstreaming>`.  See :ref:`rtmpstreaming` and :ref:`httpstreaming` for information on how to configure the JW Player to play content from these types of streaming server.

CDNs
====

Certain `CDNs <http://en.wikipedia.org/wiki/Content_delivery_network>`_ have special configuration options which have built-in shortcuts for the JW Player.  These are:

.. csv-table:: CDN Provider Shortcuts
	:widths: 5 5
	:header: "CDN",								"Provider Shortcut"

	`BitGravity <http://www.bitgravity.com/>`_, bitgravity
	`EdgeCast <http://www.edgecast.com/>`_,		edgecast
	`HighWinds <http://www.highwinds.com/>`_,	highwinds
	`VDO-X <http://www.vdo-x.net/>`_,			vdox

Custom Providers
================

It is possible to include custom `MediaProviders <http://developer.longtailvideo.com/trac/browser/sdks/mediaprovider-sdk>`_ into the JW Player.  A MediaProvider are a type of plugin which can be loaded externally, ånd which allows the player to play content which is not otherwise playable in the player.  For more information on developing custom MediaProviders, download the `MediaProvider SDK <http://developer.longtailvideo.com/trac/changeset/1068/sdks/mediaprovider-sdk?old_path=%2F&format=zip>`_.