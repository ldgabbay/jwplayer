.. _embed:

Embedding the player
====================

Embedding the HTML5 player into a page is essentially a two-step process. First, include the **jquery.js** and **jquery.jwplayer.js** scripts into the *<head>* of a page. This can be done with the following code:

.. code-block:: html

    <script type="text/javascript" src="/static/scripts/jquery.js"></script>
    <script type="text/javascript" src="/static/scripts/jquery.jwplayer.js"></script>

If you already use the jQuery library on your page, make sure to not include it twice. The JW Player should work with jQuery version 1.3 and above.

Second, instantiate the player into one or more elements in the *<body>* of a page. A player will automatically be instantiated for each *<video>* element with the classname **jwplayer**. The player automatically assumes certain attributes of the video object as its options:

.. code-block:: html

    <video class="jwplayer" src="/static/files/bunny.mp4" width="480" height="270">

The player can also be instantiated over selected *<video>* elements, with certain options. See below for more info.



Multiple video sources
----------------------

Video tags with multiple nested *<source>* tags are also supported by the player. A typical setup is one where an H264/AAC video is provided for playback in Safari/Chrome and an OGG Theora/Vorbis video is provided for playback in Firefox/Opera:

.. code-block:: html

    <video width="480" height="270" class="jwplayer">
      <source src="/static/files/bunny.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
      <source src="/static/files/bunny.ogv" type='video/ogg; codecs="theora, vorbis"' />
    </video>

The player tries to playback the *<source>* videos in order of appearance. So with the above example, if a browsers supports both H264/AAC and Theora/Vorbis, the first option would be played.

If no codecs are provided, the player presumes an H264/AAC video for **.mp4** and **.mov** files, and a Theora/Vorbis video for **.ogv** and **.ogg** files. See :ref:`formats` for a full list of supported media formats.



Flash player fallback
---------------------

When the player detects that none of the source videos can be played, it can fall back to an instance of the `JW Player for Flash <http://www.longtailvideo.com/players/jw-flv-player/>`_:

.. code-block:: html

    <video width="480" height="270" class="jwplayer" >
      <source src="/static/files/bunny.mp4" type='video/mp4' />
      <source src="/static/files/bunny.ogv" type='video/ogg' />
      <source src="/static/files/bunny.flv" type='video/flv' />
    </video>

If Adobe Flash also is not supported by the browser, the player does not touch the *<video>* element at all. A fallback message can be placed in those tags to warn the end-user:

.. code-block:: html

    <video id="container" src="/static/files/bunny.mp4" width="480" height="270" class="jwplayer" >
      Your browser does not support video playback, but you can <a href="/static/files/bunny.mp4">download the video here</a>.
    </video>




Instantiating with options
--------------------------

Instantiating the player is a matter of invoking the main **jwplayer()** function on a `jQuery selector <http://api.jquery.com/category/selectors/>`_. For example, here we apply the player to all *<video>* elements on the page, setting the **skin** and **mute** :ref:`options <options>`:

.. code-block:: html

    <video src="/static/files/bunny.mp4" width="480" height="270">
    <video src="/static/files/corrie.mp4" width="480" height="270">
    <script type="text/javascript">
      $('video').jwplayer({
        skin:'/static/skins/five.xml',
        mute:true
      });
    </script>

Here is another example, in which the player is instantiated over one *<video>* element with a specific **id**:

.. code-block:: html

    <video id="myVideo" src="/static/files/bunny.mp4" width="480" height="270">

    <script type="text/javascript">
      $('#myVideo').jwplayer({
        autostart:true,
        flashplayer:'/static/swf/player.swf',
        skin:'/static/skins/five.xml'
      });
    </script>
