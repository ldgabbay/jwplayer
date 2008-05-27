﻿//------------------------------------------------------------------------------
// SimpleXmlDocument.cs
// Jeff Wilcox <http://blogs.msdn.com/JeffWilcox>
//------------------------------------------------------------------------------

namespace SilverlightToolbox.Xml
//namespace JeffWilcox.FX.Silverlight.Xml
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Text;
    using System.Xml;

    /// <summary>
    /// A very simple in-memory representation of an XML document.  Does not 
    /// support many key XML needs and will not preserve a document during a 
    /// roundtrip.
    /// 
    /// Not implemented include 
    /// - Built-in namespace support
    /// - PIs
    /// - CDATA
    /// - Document type or declarations
    /// - Comments
    /// 
    /// What you do get includes
    /// - Element names ["TagName"]
    /// - Children
    /// - Parent [null for root]
    /// 
    /// This was not designed to be a replacement for richer .NET XmlDocument 
    /// classes, nor to be compatible with their syntax.
    /// </summary>
    public class SimpleXmlDocument
    {
        /// <summary>
        /// Root element
        /// </summary>
        private SimpleXmlElement _root;

        /// <summary>
        /// Simple XML document constructor
        /// </summary>
        public SimpleXmlDocument()
        {
            _root = null;
        }

        /// <summary>
        /// Simple XML document constructor
        /// </summary>
        public SimpleXmlDocument(string xmlString)
            : this()
        {
            ParseString(xmlString);
        }

        /// <summary>
        /// Static creation method
        /// </summary>
        public static SimpleXmlDocument Create(string xmlString)
        {
            SimpleXmlDocument doc = new SimpleXmlDocument(xmlString);
            return doc;
        }

        /// <summary>
        /// Parse a string containing XML (uses System.Xml.XmlReader) 
        /// and populate the object.
        /// </summary>
        public void ParseString(string xmlString)
        {
            using (StringReader sr = new StringReader(xmlString))
            {
                XmlReader reader = XmlReader.Create(sr);
                _root = ParseReader(reader);
            }
        }

        /// <summary>
        /// Root element
        /// </summary>
        public SimpleXmlElement Root
        {
            get
            {
                return _root;
            }
        }

        /// <summary>
        /// Use a forward, read-only reader to fill the DOM tree.  
        /// Pretty bad code with the indent checks, but works for now.
        /// </summary>
        private static SimpleXmlElement ParseReader(XmlReader reader)
        {
            List<SimpleXmlElement> parent = new List<SimpleXmlElement>();
            SimpleXmlElement current = null;
            int indent = 0;

            while (reader.Read())
            {
                switch (reader.NodeType)
                {
                    case XmlNodeType.Element:

                        if (reader.Depth != indent)
                        {
                            // Moved to a child
                            if (reader.Depth > indent)
                                parent.Add(current);
                            indent = reader.Depth;
                        }

                        current = new SimpleXmlElement(reader.Name);

                        // Root element
                        if (indent == 0 && parent.Count == 0)
                            parent.Add(current);
                        else
                            parent[indent].AppendChild(current);

                        if (reader.HasAttributes)
                        {
                            while (reader.MoveToNextAttribute())
                                current.Attributes.Add(reader.Name, reader.Value);
                            reader.MoveToElement(); // move back to element
                        }

                        break;

                    case XmlNodeType.EndElement:
                        current = null;
                        break;

                    // Treat CDATA and Text the same
                    case XmlNodeType.CDATA:
                    case XmlNodeType.Text:
                        if (current != null)
                            current.SetText(reader.ReadContentAsString());
                        break;

                    default:
                        break;
                }
            }

            return parent.Count > 0 ? parent[0] : null;
        }

    }
}
