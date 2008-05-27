/***************************************************************************
 *  Track.cs
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
using System.Xml;
using System.Collections.Generic;
using System.Collections.ObjectModel;

using SilverlightToolbox.Xml;
namespace SilverlightToolbox.Playlists.Xspf
//namespace Banshee.Playlists.Formats.Xspf
{
    public class Track : XspfBaseObject
    {
        // TODO: Add attribution, extension support
            
        private string album;
        
        private uint track_num;
        private TimeSpan duration;
    
        private List<Uri> locations = new List<Uri>();
        private List<Uri> identifiers = new List<Uri>();
        
        private Playlist parent;
        
        public Track()
        {
        }

        internal void Load(Playlist playlist, SimpleXmlElement node)
        //internal void Load(Playlist playlist, XmlNode node, XmlNamespaceManager xmlns)
        {            
            LoadBase(node);
            
            album = XmlUtil.ReadString(node, "xspf:album");

            track_num = XmlUtil.ReadUInt(node, "xspf:trackNum");
            duration = TimeSpan.FromMilliseconds(XmlUtil.ReadUInt(node, "xspf:duration"));
            
            locations = XmlUtil.ReadUris(node, "xspf:location");
            identifiers = XmlUtil.ReadUris(node, "xspf:identifier");
        }
        
        public Uri GetLocationAt(int position)
        {
            return locations[position];
        }
        
        public void InsertLocation(int position, Uri uri)
        {
            locations.Insert(position, uri);
        }
        
        public void ReplaceLocation(int position, Uri uri)
        {
            locations.RemoveAt(position);
            locations.Insert(position, uri);
        }
        
        public void AddLocation(Uri uri)
        {
            locations.Add(uri);
        }
        
        public void RemoveLocation(Uri uri)
        {
            locations.Remove(uri);
        }
        
        public void ClearLocations()
        {
            locations.Clear();
        }
        
        public Uri GetIdentifierAt(int position)
        {
            return identifiers[position];
        }
        
        public void InsertIdentifier(int position, Uri uri)
        {
            identifiers.Insert(position, uri);
        }
        
        public void AddIdentifier(Uri uri)
        {
            identifiers.Add(uri);
        }
        
        public void RemoveIdentifier(Uri uri)
        {
            identifiers.Remove(uri);
        }
        
        public void ClearIdentifiers()
        {
            identifiers.Clear();
        }
                
        public string Album {
            get { return album; }
            set { album = value; }
        }
        
        public uint TrackNumber {
            get { return track_num; }
            set { track_num = value; }
        }
        
        public TimeSpan Duration {
            get { return duration; }
            set { duration = value; }
        }
                
        public ReadOnlyCollection<Uri> Locations {
            get { return new ReadOnlyCollection<Uri>(locations); }
        }
        
        public ReadOnlyCollection<Uri> Identifiers {
            get { return new ReadOnlyCollection<Uri>(identifiers); }
        }
        
        public int LocationCount {
            get { return locations.Count; }
        }
        
        public int IdentifierCount {
            get { return identifiers.Count; }
        }
        
        public Playlist Parent {
            internal set { parent = value; }
            get { return parent; }
        }
    }
}
