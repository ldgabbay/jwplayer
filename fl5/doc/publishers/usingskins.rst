.. _usingskins:

----------------------------------
Using XML/ZIP Skins in JW Player 5
----------------------------------

==================================
Installing a Skin Into Your Player
==================================

Once you have downloaded a skin or created your own skin (see :ref:`skinning`), it is simple to embed the skin into the JW Player.

First, upload the zipped skin onto your webserver in a location that can be accessible by the webpage.  Then, instruct the player to point to your zipped skin.  You can also unzip the entire skin, and have the player point to the skin.xml file in the root of the skin's file structure.

.. note:: Performance is superior when loading the zipped directly into the player, as opposed to pointing to the XML file.

The following flashvars are used to enable and configure skinning:


Flashvar: skin
--------------

In the following line, you will see the skin flashvar added to the player.  In this case, it is looking for the skin.zip:

.. code-block:: javascript

	so.addVariable('skin', 'path/to/example_skin.zip');

If you choose unzip the skin and load its XML file directly, the code would look like this:

.. code-block:: javascript

	so.addVariable('skin', 'path/to/example_skin/example_skin.xml');


Flashvar: controlbar
--------------------

You can position the Controlbar in your player to either under the display (*controlbar=bottom*, which is the default option), above the display (*controlbar=top*, or hovering over the display (*controlbar=over*). 

.. code-block:: javascript
	
	so.addVariable('controlbar','over');

Flashvar: playlist
------------------

You can position the Playlist in your player to the left or right of the display (*playlist=left,right*), above or below the display (*playlist=top,bottom*, or hovering over the display (*playlist=over*).  You must also specify a **playlistsize**, which, depending on its orientation, will correspond to the playlist's width or height.

.. code-block:: javascript
	
	so.addVariable('playlist','right');
	so.addVariable('playlistsize','250');


Putting it all together
-----------------------

Here is an example of a complete JW Player 5 Embed with Skin, the Dock disabled and the Controlbar at the top.

.. code-block:: html

	<div id="videoDiv">this will be replaced by the JW Player.</div>
	
	<script type="text/javascript">
		var so = new SWFObject('JWPlayer5.swf','mpl','800','400','9');
		so.addParam('allowfullscreen','true');
		so.addParam('allowfullscriptaccess','always');
		so.addVariable('skin', 'path/to/example_skin.zip');
		so.addVariable('controlbar','over');
		so.addVariable('playlist','right');
		so.addVariable('playlistsize','250');
		so.write('videoDiv');
	</script>

=============
Example Skins
=============

`Download Example Skin: Beelden <http://developer.longtailvideo.com/trac/changeset/643/skins/beelden?old_path=%2F&format=zip>`_ - Example Skin Source (Files, XML, Photoshop Originals)