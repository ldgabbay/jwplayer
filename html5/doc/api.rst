.. api:

Player API
==========

The HTML5 player contains a simple javascript API which can be used to:

* Request the various playback states (*position*, *volume*, *dimensions*).
* Control the player through a number of available methods (*play*, *pause*, *load*).
* Track the player state by listening to certain events (*time*, *volume*, *resize*).

Since the HML5 player is built using the jQuery, its API is using several conventions found in this framework.

Referencing a player
--------------------

Before you can interact with the player, you need to be able to reference it (get a hold of it) from your javascript code. If you use a single player on the page, this is very simple: 

.. code-block:: html

   <video class="jwplayer" width="400" height="300" src="/static/video.mp4">
   <script type="text/javascript">
     var player = $.jwplayer();
     player.play();
   </script>

If you have multiple players on a page, you can reference a single player by giving each player a specific ID. Next, you use a `jQuery selector <http://api.jquery.com/category/selectors/>`_ to get to the player you want:

.. code-block:: html

   <video class="jwplayer" id="player1" width="400" height="300" src="/static/video1.mp4">
   <video class="jwplayer" id="player2" width="400" height="300" src="/static/video2.mp4">

   <script type="text/javascript">
     var player = $.jwplayer("#player1");
     player.play();
   </script>


Requesting properties
---------------------

The following player properties can be requested using javascript: 

.. describe:: buffer ()

   The percentage of the videofile that is downloaded to the page. Can be **0** to **100**.

.. describe:: duration ()

   The duration of the video file, in seconds. This will not be available on startup, but as of the moment the metadata of a video is loaded. 

.. describe:: fullscreen ()

   The fullscreen state of the player. Can be **true** or **false**.

   .. note:: Current browsers do not support true fullscreen, like Flash or Silverlight do. The fullscreen mode of the HTML5 player will rather be a full-browser-screen.

.. describe:: height ()

   The height of the player, in pixels.


.. describe:: mute ()

   The sound muting state of the player. Can be **true** (no sound) or **false**.

   .. note:: *Volume* and *mute* are separate properties. This allows the player to switch to the previously used volume when the player is muted and then unmuted.

.. describe:: position ()

   The current playback position of the video, in seconds.

.. describe:: state ()

   The current playback state of the player. Can be:

   * **idle**: Video not playing, video not loaded.
   * **buffering**: Video is loading, the player is waiting for enough data to start playback.
   * **playing**: Video is playing.
   * **paused** Video has enough data for playback, but the user has paused the video. 

.. describe:: volume ()

   The audio volume percentage of the player, can be **0** to **100**.

.. describe:: width ()

   The width of the player, in pixels.


Here's how to request a player property:

.. code-block:: html

   <video class="jwplayer" width="400" height="300" src="/static/video.mp4">

   <p onclick="alert($.jwplayer().volume())">Get player volume</p>


Calling methods
---------------

The player exposes a list of methods you can use to control it from javascript:

.. describe:: fullscreen (state) 

   Change fullscreen playback. The state can be **true** or **false**.

   .. note:: Current browsers do not support true fullscreen, like Flash or Silverlight do. The fullscreen mode of the HTML5 player will rather be a full-browser-screen.

.. describe:: load (url)

   Load a new video into the player. The **url** should be a valid hyperlink to the video file (e.g. **/static/video/holiday.mp4**). The file can be in any :ref:`supported media type <formats>`.

.. describe:: mute (state)

   Change the mute state of the player. The *state* can be **true** or **false**. 

.. describe:: pause ()

   Pause playback of the video. If the video is already *paused* (or *idle*), this method does nothing.

.. describe:: play ()

   Start playback of the video. If the video is already *playing* (or *buffering*), this method does nothing.

.. describe:: resize (width,height)

   Resize the player to a certain **width** and **height** (in pixels). Use this to e.g. toggle between a small and large  player view like Youtube does.

.. describe:: seek (position)

   Seek to and playing the video from a certain *position*, in seconds (e.g. **120** for 2 minutes in). If the player is *paused* or *idle*, it will start playback.

.. describe:: stop ()

   Stop playing the video, unload the video and display the poster frame. The player proceeds to the **idle** state.

.. describe:: volume (volume)

   Set the player audio volume percentage, a number between 0 and 100. When changing the volume while the player is muted, it will also automatically be unmuted.


Here's how to invoke a player method:

.. code-block:: html

   <video class="jwplayer" width="400" height="300" src="/static/video.mp4">
   <ul>
     <li> onclick="$.jwplayer().play()">play the video</li>
     <li> onclick="$.jwplayer().pause()">pause the video</li>
     <li> onclick="$.jwplayer().seek(0)">play from the beginning of the video</li>
   </ul>
