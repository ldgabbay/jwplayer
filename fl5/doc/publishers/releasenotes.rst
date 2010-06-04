.. _releasenotes:

=============
Release Notes
=============


Version 5.2
===========

Build 1065
----------

Skinning Features
+++++++++++++++++

Version 5.2 introduces a number of new features to the XML/PNG skinning model.

 * Support for customized font settings
 
  * Controlbar text fields (**elapsed**, **duration**) can specify font face (*_sans*, *_serif*, *_typewriter*), font weight (*bold*), font style (*italic*) and font color (*0x123456*)
  * Playlist text fields (**title**, **description**, **duration**) can specify font face (*_sans*, *_serif*, *_typewriter*), font weight (*bold*), font style (*italic*) and font color (*0x123456*)
  
 * Customized controlbar layout
 
  * Allows placement of any button, text field or slider available in the controlbar
  * Adds the ability to insert arbitrary divider images
  * Adds the ability to insert arbitrary 'spacer' elements
  * Additional **<layout>** XML tag:

.. code-block:: xml

	<layout>
		<group position="left">
			<button name="play" />
			<!-- Standard divider (i.e. "divider" element) -->
			<divider />
			<button name="stop" />
			<!-- Alternate divider -->
			<divider element="divider2" />
			<button name="next" />
			<!-- 5-pixel spacer -->
			<divider width="5" />
			<button name="prev" />
			<divider />
			<text name="elapsed" />
		</group>
		<group position="center">
			<slider name="time" />					
		</group>
		<group position="right">
			<text name="duration" />
			<divider />
			<button name="blank" />
			<divider />
			<button name="mute" />
			<slider name="volume" />
			<divider />
			<button name="fullscreen" />
		</group>
	</layout>

* Ability to control rate and amount of buffer rotation:

.. code-block:: xml

	<component name="display">
		<settings>
			<!-- Delay between buffer icon rotation, in milliseconds -->
			<setting name="bufferinterval" value="10" />
			<!-- Amount to rotate the buffer icon per interval, in degrees -->
			<setting name="bufferrotation" value="5" />
		</settings>
	...
	</component>

* Replaces general SWF-skin colorization settings (*frontcolor*, *backcolor*, *lightcolor*, *screencolor*) with component-specific settings

 * Controlbar
 
  * *fontcolor*: Color for elapsed time and duration
  * *buttoncolor*: Colorization setting for controlbar icons
  
 * Playlist
 
  * *fontcolor*: Color for all text fields
  * *overcolor*: Colorization for playlist text fields when the mouse moves over the playlist item
  * *activecolor*: Color for the text fields in the currently active playlist item
  * *backgroundcolor*: Color of the background that sits behind the playlist items.
  
 * Display
 
  * *backgroundcolor*: replaces *screencolor* setting
  
* New skinning elements

 * Playlist
 
  * Active state for playlist item background (*itemActive* element)
  * Image placeholder for playlist images (*itemImage* element)
  * Top and bottom end caps for playlist slider (*sliderCapTop*, *sliderCapBottom*)
  
 * Controlbar
 
  * Left and right end caps for time and volume sliders (*timeSliderCapLeft*, *timeSliderCapRight*, *volumeSliderCapLeft*, *volumeSliderCapRight*)
  * Background images for text fields (*elapsedBackground*, *durationBackground*)
  
 * Display
 
  * Over states for display icons (*playIconOver*, *muteIconOver*, *errorIconOver*, *bufferIconOver*)
  
* Ability to use SWF assets in addition to JPGs and PNGs in XML skinning


Version 5.1
===========

Build 897
---------

Bug Fixes
+++++++++

 * Fixed an issue where load-balanced RTMP streams with bitrate switching could cause an error
 * Fixed buffer icon centering and rotation for v5 skins

Build 854
---------

New Features
++++++++++++

 * Since 5.0 branched off from 4.5, version 5.1 re-integrates changes from 4.6+ into the 5.x branch, including:
 
  * Bitrate Switching
  * Bandwidth detection
  
 * DVR functionality for [wiki:FlashMediaServerDVR RTMP live streams].

Major Bug Fixes
+++++++++++++++

 * Allows loading images from across domains without :ref:`security restrictions <crossdomain>`.
 * Fixes some RTMP live/recorded streaming issues
 * Fixes an issue where the *volume* flashvar is not respected when using RTMP
 * Fixes issue where adjusting volume for YouTube videos doesn't work in Internet Explorer
 * Various Javascript API fixes
 * Various visual tweaks
 * Brings back icons=false functionality
 * Brings back *id* flashvar, for Linux compatibility
 * Better support of loadbalancing using the SMIL format

A full changelog can be found `here <http://developer.longtailvideo.com/trac/query?group=status&milestone=Flash+5.1&order=type>`_

Version 5.0
===========

Build 753
---------

Features new to 5.0
+++++++++++++++++++

 * Bitmap Skinning (PNG, JPG, GIF)
 * API Update for V5 plugins
 
  * Player resizes plugins when needed
  * Player sets X/Y coordinates of plugins
  * Plugins can request that the player block (stop playback) or lock (disable player controls).
  
 * MXMLC can be used to [browser:/trunk/fl5/README.txt compile the player].
 * Backwards compatibility
 
  * SWF Skins
  * Version 4.x plugins
  * Version 4.x javascript

4.x features not available in 5.0
+++++++++++++++++++++++++++++++++

 * Bitrate switching, introduced in 4.6
 * *displayclick* flashvar
 * *logo* flashvar (for non-commercial players)

A full changelog can be found [/query?group=status&milestone=Flash+5.0&order=type here]
