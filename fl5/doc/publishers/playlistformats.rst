.. _playlistformats:

=============
XML Playlists
=============

The JW Player for Flash supports several XML-based playlist formats.  They are listed in the table below.

First, note that playlist XML files are subject to the :ref:`crossdomain security restrictions <crossdomain>` of Flash. This means that a videoplayer on one domain cannot load a playlist from another domain. It can be fixed by placing a :ref:`crossdomain.xml <crossdomain>` file at the server the captions are loaded from. That said, the following playlist formats are supported:


Supported Playlist Formats
==========================

The following XML-based playlist formats are supported by the JW Player:

.. _XSPF: http://xspf.org/specs
.. _ASX: http://msdn2.microsoft.com/en-us/library/ms910265.aspx
.. _ATOM: http://code.google.com/apis/youtube/2.0/developers_guide_protocol.html#Understanding_Video_Entries
.. _RSS: http://cyber.law.harvard.edu/rss/rss.html
.. _iTunes: http://apple.com/itunes/store/podcaststechspecs.html
.. _MediaRSS: http://search.yahoo.com/mrss


 * ASX_ feeds (`example <http://developer.longtailvideo.com/player/testing/files/asx.xml>`_)
 * ATOM_ feeds with _MediaRSS extensions (`example <http://developer.longtailvideo.com/player/testing/files/atom.xml>`_)
 * RSS_ feeds with iTunes_ (`example <http://developer.longtailvideo.com/player/testing/files/irss.xml>`_) extensions and _MediaRSS extensions (`example <http://developer.longtailvideo.com/player/testing/files/mrss.xml>`_)
 * XSPF_ feeds (`example <http://developer.longtailvideo.com/player/testing/files/xspf.xml>`_)


Here is an overview of all the tags for each playlist format the player processes, and the :ref:`Playlist Item <playlistitem>` property they correspond to:

.. csv-table:: Playlist Properties for XML Formats
	:widths: 25 10 10 10 10 10 10
	:header: "Property", 				XSPF_,	 	RSS_, 			iTunes_, 	_MediaRSS, 		ASX_, 		ATOM_
	
	:ref:`author <playlistitem>`, 		creator,  	--,  			author,  	credit,  		author,		--
	:ref:`date <playlistitem>`,  		--,  		pubDate,		--,  		--,  			--,  		published
	:ref:`description <playlistitem>`,	annotation,	description,	summary,	description,  	abstract,  	summary
	:ref:`duration <playlistitem>`, 	duration,  	--,  			duration,  	content,  		duration,  	--
	:ref:`file <playlistitem>`,  		location,  	enclosure,  	--,  		content,  		ref,  		--
	:ref:`link <playlistitem>`,  		info,  		link,  			--,  		--,  			moreinfo,  	link
	:ref:`image <playlistitem>`,  		image,		--,				--,			thumbnail,		--,			--
	:ref:`start <playlistitem>`,  		--,  		--,  			--,  		--,  			starttime,	--
	:ref:`streamer <playlistitem>`,  	--,			--,				--,			--,				--,  		--
	:ref:`tags <playlistitem>`,  		--,			category,		keywords,	keywords,		--,  		--
	:ref:`title <playlistitem>`,  		title,		title,			--,			title,			title,		title
	:ref:`provider <playlistitem>`,		--,			--,				--,			--,				--,			--		


All **media:** tags can be embedded in a **media:group** element. A **media:content** element can also act as a container. Additionally, iTunes_ and MediaRSS_ tags can be mixed in one RSS_ feed. The player will pick the last matching element for each property.

JWPlayer Namespace
==================

In order to enable all JW Player file properties for all feed formats, the 4.4 player introduced a **jwplayer** namespace. By inserting this into your feed, file properties that are not supported by the feed format itself (such as the **provider** or **duration** in an RSS feed) can be amended without breaking validation.  Any of the flashvars listed in the above table can be inserted. Here's an example:

.. code-block:: xml

	<rss version="2.0" xmlns:jwplayer="http://developer.longtailvideo.com/trac/wiki/FlashFormats">
	  <channel>
	    <title>Example RSS feed with jwplayer extensions</title>
	    <item>
	      <title>FLV Video</title>
	      <link>http://www.bigbuckbunny.org/</link>
	      <description>Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation.</description>
	      <enclosure url="../../testing/files/bunny.flv" type="video/x-flv" length="1192846" />
	      <jwplayer:author>the Peach Open Movie Project</jwplayer:author>
	      <jwplayer:provider>http</jwplayer:provider>
	      <jwplayer:duration>34</jwplayer:duration>
	    </item>
	  </channel>
	</rss>

Pay attention to the top level tag, which describes the JW Player namespace with the **xmlns** attribute. This must be available in order to not break validity.

You can mix **jwplayer** elements with both the regular elements of a feed and elements from other extensions (mrss/itunes). If multiple elements match the same property, the elements will be prioritized:

 * Elements defined by the **jwplayer** extension always gets the highest priority.
 * Element defined by the **media** namespace (e.g. **media:content**) rank second.
 * Elements defined by the **itunes** namespace rank third.
 * Elements that are defined by the feed format (e.g. the **enclosure** in RSS_)  get the lowest priority.

This feature allows you to set, for example, a specific video version or streaming **provider** for the JW Player, while other feed aggregators will pick the default content.

Adding Additional Properties
============================

Certain plugins, and some media-related player options, support item-specific configuration options.  These are placed inside **jwplayer** tags as well, and are inserted like this:

.. code-block:: xml

	<rss version="2.0" xmlns:jwplayer="http://developer.longtailvideo.com/trac/wiki/FlashFormats">
	  <channel>
	    <title>Example RSS feed with playlist item extensions</title>
	    <item>
	      <title>First Video</title>
	      <link>http://www.bigbuckbunny.org/</link>
	      <description>Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation.</description>
	      <enclosure url="../../testing/files/bunny.flv" type="video/x-flv" length="1192846" />
	      <jwplayer:provider>http</jwplayer:provider>
	      <jwplayer:http.startparam>start</jwplayer:http.startparam>
	      <jwplayer:captions.file>testing/files/captions_1.xml</jwplayer:captions.file>
	    </item>
	    <item>
	      <title>Second Video</title>
	      <link>http://www.bigbuckbunny.org/</link>
	      <description>Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation.</description>
	      <enclosure url="../../testing/files/bunny.mp4" type="video/mp4" length="1192846" />
	      <jwplayer:provider>http</jwplayer:provider>
	      <jwplayer:http.startparam>offset</jwplayer:http.startparam>
	      <jwplayer:captions.file>testing/files/captions_2.xml</jwplayer:captions.file>
	    </item>
	  </channel>
	</rss>
	
Notice that the **<jwplayer:http.startparam>** and **<jwplayer:captions.file>** properties are set differently for each of the playlist items.
