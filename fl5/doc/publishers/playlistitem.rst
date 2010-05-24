.. _playlistitem:

Playlist Items
==============

Playlist Items contain the following properties:

 * **author** (*String*): Author of the video, shown in the display or playlist.
 * **date** (*String*): Publish date of the media file.
 * **description** (*String*): Text description of the file.
 * **duration** (*Number*): Duration of the file in seconds
 * **file** (*String*): Location of the mediafile or playlist to play.
 * **image** (*String*): Location of a preview image; shown in display and playlist.
 * **mediaid** (*String*): Unique value used to identify the media file.  Used for certain plugins.
 * **start** (*Number*): Position in seconds where playback should start. Won't work for regular (progressive) videos, but only for streaming (HTTP / RTMP).
 * **streamer** (*String*): Location of an rtmp/http server instance to use for streaming. Can be an RTMP application or external PHP/ASP file. [wiki:FlashFormats More info here].
 * **tags** (*String*): Keywords associated with the media file.
 * **title** (*String*): Title of the video, shown in the display or playlist.
 * **provider** (*String*): This is determines what type of mediafile this item is, and thus which MediaSource the player should use for playback. By default, the type is detected by the player based upon the file extension. If there's no suitable extension or the player detects the type wrong, it can be manually set. The following default types are supported:
   * *video*: progressively downloaded FLV / MP4 video, but also AAC audio.
   * *sound*: progressively downloaded MP3 files.
   * *image*: JPG/GIF/PNG images.
   * *youtube*: videos from Youtube.
   * *http*: FLV/MP4 videos played as http pseudo-streaming.
   * *rtmp*: FLV/MP4/MP3 files played from an RTMP server.