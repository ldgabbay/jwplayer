﻿//------------------------------------------------------------------------------
// SimpleXmlElement.cs
// Jeff Wilcox <http://blogs.msdn.com/JeffWilcox>
//------------------------------------------------------------------------------

namespace SilverlightToolbox.Xml
//namespace JeffWilcox.FX.Silverlight.Xml
{
    using System;
    using System.IO;
    using System.Text;
    using System.Xml;
    using System.Collections.Generic;

    /// <summary>
    /// Node in a DOM tree.  Similar to the standard .NET XmlElement, 
    /// but simplified.
    /// </summary>
    public class SimpleXmlElement
    {
        /// <summary>
        /// Tag Name
        /// </summary>
        private string _tagName;

        /// <summary>
        /// Contained text, if any
        /// </summary>
        private string _text;

        /// <summary>
        /// Element attributes
        /// </summary>
        private Dictionary<string, string> _attributes;

        /// <summary>
        /// Child nodes
        /// </summary>
        private List<SimpleXmlElement> _children;

        /// <summary>
        /// Keep memory consumption down by defaulting to a small size 
        /// for the attribute dictionary
        /// </summary>
        private const int DefaultAttributeAssumption = 2;

        /// <summary>
        /// Size for new child lists 
        /// </summary>
        private const int DefaultChildrenAssumption = 1;

        /// <summary>
        /// Reference to a parent object, if any
        /// </summary>
        internal SimpleXmlElement _parent;

        /// <summary>
        /// Constructor, must be created internally (SimpleXmlDocument)
        /// </summary>
        internal SimpleXmlElement(string tagName)
        {
            _tagName = tagName;
            _text = string.Empty;
            _attributes = new Dictionary<string, string>(DefaultAttributeAssumption);
            _children = new List<SimpleXmlElement>(DefaultChildrenAssumption);
            _parent = null;
        }

        /// <summary>
        /// Constructor, must be created internally (SimpleXmlDocument)
        /// </summary>
        internal SimpleXmlElement(string tagName, string text)
            : this(tagName)
        {
            _text = text;
        }

        /// <summary>
        /// Element tag name as parsed by XmlReader
        /// </summary>
        public string TagName
        {
            get { return _tagName; }
        }

        /// <summary>
        /// Contained text, if any, for the element
        /// </summary>
        public string Text
        {
            get { return _text; }
        }

        /// <summary>
        /// Override the text in the node
        /// </summary>
        internal void SetText(string text)
        {
            _text = text;
        }

        /// <summary>
        /// Whether the element has any text
        /// </summary>
        public bool HasText
        {
            get { return _text.Length > 0; }
        }

        /// <summary>
        /// Whether the element has any children
        /// </summary>
        public bool HasChildren
        {
            get { return _children.Count > 0; }
        }

        /// <summary>
        /// Whether the element has any attributes
        /// </summary>
        public bool HasAttributes
        {
            get { return _attributes.Count > 0; }
        }

        /// <summary>
        /// Append a child element and assign its parent reference
        /// </summary>
        internal void AppendChild(SimpleXmlElement child)
        {
            child._parent = this;
            _children.Add(child);
        }

        /// <summary>
        /// Return the parent element
        /// </summary>
        public SimpleXmlElement Parent
        {
            get { return _parent; }
        }

        /// <summary>
        /// Return the attributes dictionary
        /// </summary>
        public IDictionary<string, string> Attributes
        {
            get { return _attributes; }
        }

        /// <summary>
        /// Return the attributes list
        /// </summary>
        public IList<SimpleXmlElement> Children
        {
            get { return _children; }
        }

        /// <summary>
        /// Simple tagname and # of children as the ToString, 
        /// only useful for debugging.
        /// </summary>
        public override string ToString()
        {
            return _tagName + " with " + _children.Count.ToString() + " siblings";
        }

        /// <summary>
        /// Effectively the XmlElement::OuterHTML
        /// </summary>
        public string ToXmlString()
        {
            return ToXmlString(0);
        }

        /// <summary>
        /// Get a list of elements 
        /// </summary>
        public IList<SimpleXmlElement> GetElementsByTagName(string tagName)
        {
            List<SimpleXmlElement> elements = new List<SimpleXmlElement>();
            if (_tagName == tagName)
            {
                elements.Add(this);
            }
            foreach (SimpleXmlElement child in _children)
            {
                elements.AddRange(child.GetElementsByTagName(tagName));
            }
            return elements;
        }

        /// <summary>
        /// Get a single element by tag name
        /// </summary>
        /// <remarks>Be forewarned, if there are >1 tags you'll receive an exception</remarks>
        public SimpleXmlElement GetElementByTagName(string singleTagName)
        {
            IList<SimpleXmlElement> tags = GetElementsByTagName(singleTagName);
            if (tags.Count == 1)
                return tags[0];
            if (tags.Count > 1)
                throw new InvalidOperationException("Multiple " + singleTagName + " tags were located.");
            return null;
        }

        /// <summary>
        /// Return the contained text of a single node by tag name
        /// </summary>
        public string GetTextOfSingleTagName(string singleTagName)
        {
            SimpleXmlElement tag = GetElementByTagName(singleTagName);
            return (tag != null) ? tag.Text : null;
        }

        /// <summary>
        /// Effectively the XmlElement::OuterHTML
        /// </summary>
        private string ToXmlString(int indent)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < indent; ++i) sb.Append("\t");

            sb.Append("<");
            sb.Append(_tagName);

            if (HasAttributes)
            {
                foreach (string key in _attributes.Keys)
                {
                    sb.Append(" ");
                    sb.Append(key);
                    sb.Append("=");
                    sb.Append("\"");
                    sb.Append(_attributes[key]);
                    sb.Append("\"");
                }
            }

            if (HasChildren || HasText)
            {
                sb.AppendLine(">");
                foreach (SimpleXmlElement node in _children)
                    sb.AppendLine(node.ToXmlString(indent + 1));
                if (_text.Length > 0)
                {
                    sb.AppendLine();
                    for (int i = 0; i < indent; ++i) sb.Append("\t");
                    sb.Append("\t");
                    sb.AppendLine(_text);
                }
                for (int i = 0; i < indent; ++i) sb.Append("\t");

                sb.Append("</");
                sb.Append(_tagName);
                sb.Append(">");
            }
            else
                sb.AppendLine(" />");

            return sb.ToString();
        }
    }

}
