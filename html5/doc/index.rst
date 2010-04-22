.. _overview:

JW Player for HTML5
===================

The JW Player for HTML5 is a fully skinneable and configurable player based upon the new <video> tag found in HTML5. It is built using javascript (`jQuery <http://jquery.org'>`_) and skinned using PNG images, which makes it extremely easy to modify both the behaviour and looks. Since HTML5 support is currently not widespread, the player integrates a seamless fallback to the popular JW Player for Flash.


Documentation
-------------

 .. toctree::
    :maxdepth: 2

    embed
    formats
    options
    api


Skinning
--------

The JW Player for HTML5 is fully compatible with the `PNG Skinning model <http://www.longtailvideo.com/support/jw-player/jw-player-for-flash-v5/14/skinning-the-jw-player-5>`_ of the JW Player for Flash. Any PNG skin built for the Flash player can be used in the HTML5 player. There are, however, two things to take into account:

* The JW Player for HTML5 does currently not support any playlist functionalities. Considering the flexibility of building your playlist totally in HTML, this should not be an issue.
* The JW Player for HTML5 does currently only load unzipped skins. Unzipping a skin should not be a big issue; any modern OS has built-in ZIP support.


Plugins
-------

The current version of the player does not allow for (javascript) plugins. They will be in there before doing an official release though. Building javascript plugins to extend the player's functionality will be far easier to do than building actionscript plugins.

Ideas for plugins that would be great to have are:

* *jquery.jwplayer.adtonomy*
* *jquery.jwplayer.gapro*
* *jquery.jwplayer.hd*
* *jquery.jwplayer.playlist*
* *jquery.jwplayer.viral*