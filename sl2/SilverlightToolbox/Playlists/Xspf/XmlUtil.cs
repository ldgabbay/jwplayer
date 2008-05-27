/***************************************************************************
 *  XmlUtil.cs
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
using SilverlightToolbox.Xml;

namespace SilverlightToolbox.Playlists.Xspf
//namespace Banshee.Playlists.Formats.Xspf
{
    internal static class XmlUtil
    {
        static string stripNamespace(string xpath)
        {
            // Strip off namespace. "xspf:title" becomes "title"
            string[] tags = xpath.Split(':');
            string tag = tags[tags.Length - 1];
            return tag;
        }

        internal static string ReadString(SimpleXmlElement parentNode, string xpath)
        //internal static string ReadString(XmlNode parentNode, XmlNamespaceManager xmlns, string xpath)
        {
            string tag = stripNamespace(xpath);

            //XmlNode node = parentNode.SelectSingleNode(xpath, xmlns);
            IList<SimpleXmlElement> nodes = parentNode.GetElementsByTagName(tag);
            if (nodes == null || nodes.Count == 0)
            {
                return null;
            }

            // Get the first node.
            SimpleXmlElement node = nodes[0];
            if (node == null)
            {
                return null;
            }

            return node.Text == null ? null : node.Text.Trim();
        }

        internal static Uri ReadUri(SimpleXmlElement node, string xpath)
        //internal static Uri ReadUri(SimpleXmlElement node, XmlNamespaceManager xmlns, Uri baseUri, string xpath)
        {
            string str = ReadString(node, xpath);
            if (str == null)
            {
                return null;
            }

            return new Uri(str, UriKind.RelativeOrAbsolute);
        }


        internal static DateTime ReadDate(SimpleXmlElement node, string xpath)
        {
            string str = ReadString(node, xpath);
            if (str == null)
            {
                return DateTime.MinValue;
            }

            W3CDateTime datetime = W3CDateTime.Parse(str);
            return datetime.LocalTime;
        }

        internal static uint ReadUInt(SimpleXmlElement node, string xpath)
        {
            string str = ReadString(node, xpath);
            if (str == null)
            {
                return 0;
            }

            return UInt32.Parse(str);
        }

        internal static string ReadRelPair(SimpleXmlElement node, out Uri rel)
        {
            //XmlAttribute attr = node.Attributes["rel"];
            //string rel_value = attr == null || attr.Value == null ? null : attr.Value.Trim();
            string attr = node.Attributes["rel"];
            string rel_value = attr == null || attr == null ? null : attr.Trim();
            string value = node.Text == null ? null : node.Text.Trim();

            if (rel_value == null || value == null)
            {
                rel = null;
                return null;
            }

            rel = new Uri(rel_value);
            return value;
        }

        internal static List<MetaEntry> ReadMeta(SimpleXmlElement parentNode, string xpath)
        {
            List<MetaEntry> meta_collection = new List<MetaEntry>();

            string tag = stripNamespace(xpath);

            foreach (SimpleXmlElement node in parentNode.GetElementsByTagName(tag))
            {
                Uri rel;
                string value = ReadRelPair(node, out rel);

                if (value == null || rel == null)
                {
                    continue;
                }

                meta_collection.Add(new MetaEntry(rel, value));
            }

            return meta_collection;
        }

        internal static List<LinkEntry> ReadLinks(SimpleXmlElement parentNode, string xpath)
        {
            List<LinkEntry> link_collection = new List<LinkEntry>();

            string tag = stripNamespace(xpath);

            foreach (SimpleXmlElement node in parentNode.GetElementsByTagName(tag))
            {
                Uri rel;
                string value = ReadRelPair(node, out rel);

                if (value == null || rel == null)
                {
                    continue;
                }

                link_collection.Add(new LinkEntry(rel, new Uri(value)));
            }

            return link_collection;
        }

        internal static List<Uri> ReadUris(SimpleXmlElement parentNode, string xpath)
        {
            List<Uri> uri_collection = new List<Uri>();

            string tag = stripNamespace(xpath);

            foreach (SimpleXmlElement node in parentNode.GetElementsByTagName(tag))
            {
                string value = node.Text == null ? null : node.Text.Trim();
                if (value != null)
                {
                    // Convert %20 -> space and such.
                    //value = Uri.UnescapeDataString(value);
                    uri_collection.Add(new Uri(value, UriKind.RelativeOrAbsolute));
                }
            }

            return uri_collection;
        }
    }
}
