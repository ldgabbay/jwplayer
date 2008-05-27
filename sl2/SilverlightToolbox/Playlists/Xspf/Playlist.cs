/***************************************************************************
 *  Playlist.cs
 *
 *  Copyright (C) 2006 Novell, Inc.
 *  Written by Aaron Bockover <aaron@abock.org>
 ****************************************************************************/

/*  THIS FILE IS LICENSED UNDER THE MIT LICENSE AS OUTLINED IMMEDIATELY BELOW: 
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a
 *  copy of this software and associated documentation files (the "Software"),  
 *  to deal in the Software without restriction, including without limitation  
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense,  
 *  and/or sell copies of the Software, and to permit persons to whom the  
 *  Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 *  DEALINGS IN THE SOFTWARE.
 */


using System;
using System.IO;
using System.Xml;
using System.Collections.Generic;
using System.Collections.ObjectModel;

using SilverlightToolbox.Xml;

namespace SilverlightToolbox.Playlists.Xspf
//namespace Banshee.Playlists.Formats.Xspf
{
    public class Playlist : XspfBaseObject
    {
        // TODO: Add attribution, extension support

        //private static string XspfNamespace = "http://xspf.org/ns/0/";

        private Uri location;
        private Uri identifier;
        private Uri license;
        private DateTime date;

        private SimpleXmlElement root;

        private List<Track> tracks = new List<Track>();

        public void Load(SimpleXmlDocument doc)
        {
            this.root = doc.Root;

            //SimpleXmlElement playlist_node = root.GetElementByTagName("/xspf:playlist");
            SimpleXmlElement playlist_node = root.GetElementByTagName("playlist");

            if (playlist_node == null)
            {
                throw new ApplicationException("Not a valid XSPF playlist");
            }

            /*
            XmlAttribute version_attr = playlist_node.Attributes["version"];
            if(version_attr == null || version_attr.Value == null) {
                throw new ApplicationException("XSPF playlist version must be specified");
            } else {
                try {
                    int version = Int32.Parse(version_attr.Value);
                    if(version < 0 || version > 1) {
                        throw new ApplicationException("Only XSPF versions 0 and 1 are supported");
                    }
                } catch(FormatException) {
                    throw new ApplicationException("Invalid XSPF Version '" + version_attr.Value + "'");
                }
            }
            
            XmlAttribute base_attr = playlist_node.Attributes["xml:base"];
            if(base_attr != null) {
                document_base_uri = new Uri(base_attr.Value);
            }
            */

            LoadBase(playlist_node);

            /*
            location = XmlUtil.ReadUri(playlist_node, xmlns, ResolvedBaseUri, "xspf:location");
            identifier = XmlUtil.ReadUri(playlist_node, xmlns, ResolvedBaseUri, "xspf:identifier");
            license = XmlUtil.ReadUri(playlist_node, xmlns, ResolvedBaseUri, "xspf:license");
            
            date = XmlUtil.ReadDate(playlist_node, xmlns, "xspf:date");
              */

            SimpleXmlElement tracklist_node = root.GetElementByTagName("trackList");
            if (tracklist_node == null)
            {
                throw new ApplicationException("No trackList found");
            }

            foreach (SimpleXmlElement node in tracklist_node.GetElementsByTagName("track"))
            {
                Track track = new Track();
                track.Load(this, node);
                AddTrack(track);
            }
        }

        public void AddTrack(Track track)
        {
            track.Parent = this;
            tracks.Add(track);
        }

        public Uri Location
        {
            get { return location; }
            set { location = value; }
        }

        public Uri Identifier
        {
            get { return identifier; }
            set { identifier = value; }
        }

        public Uri License
        {
            get { return license; }
            set { license = value; }
        }

        public DateTime Date
        {
            get { return date; }
            set { date = value; }
        }

        public ReadOnlyCollection<Track> Tracks
        {
            get { return new ReadOnlyCollection<Track>(tracks); }
        }

        public int TrackCount
        {
            get { return tracks.Count; }
        }
    }
}