using System;
using System.Collections.Generic;
using System.IO;
using System.IO.IsolatedStorage;
using System.Xml;

namespace SilverlightToolbox
{
    public interface IPersistentStorage
    {
        void Set(String key, String value);
        String Get(String key);
        String Get(String key, String defaultValue);
        void ResetSettings();
    }


    public abstract class AbstractPersistentStorage : IPersistentStorage
    {
        // Use the template pattern.
        protected abstract Boolean OpenPersistentStore();
        protected abstract void DeserializeSettings();
        protected abstract void WriteSetting(String key, String value);
        protected abstract String ReadSetting(String key);
        protected abstract void SerializeSettings();
        protected abstract void ClosePersistantStore();
        protected abstract Boolean OpenNewPersistantStore();

        private void Init()
        {
            if (OpenPersistentStore())
            {
                // Ok, successfully opened the store.
                DeserializeSettings();
            }
            else
            {
                // Unable to open the store. Create new one.
                ResetSettings();
                Init();
            }
        }

        public void ResetSettings()
        {
            // Create a new store...
            OpenNewPersistantStore();
            // ...and populate with default XML structure so it'll be deserializable.
            SerializeSettings();
            ClosePersistantStore();
        }


        public void Set(String key, String value)
        {
            Init();
            WriteSetting(key, value);
            SerializeSettings();
            ClosePersistantStore();
        }

        public String Get(String key)
        {
            return Get(key, null);
        }

        public String Get(String key, String defaultValue)
        {
            Init();
            String value = ReadSetting(key);
            if (value == null && defaultValue != null)
            {
                value = defaultValue;
            }

            ClosePersistantStore();
            return value;
        }
    }


    /// <summary>
    /// Using the Isolated Storage functionality for persistance allows a browser independant store of data.
    /// </summary>
    public class IsolatedStorage : AbstractPersistentStorage
    {
        private const String settingsFile = "persistent.xml";
        IsolatedStorageFile isoFile;
        IsolatedStorageFileStream isoStream;
        Dictionary<String, String> pairs;

        public IsolatedStorage()
        {
            isoFile = IsolatedStorageFile.GetUserStoreForApplication();
        }

        protected override Boolean OpenPersistentStore()
        {
            try
            {
                if (isoStream == null)
                {
                    isoStream = new IsolatedStorageFileStream(settingsFile, FileMode.Open, isoFile);
                }
                else
                {
                    isoStream.Position = 0;
                }
                return true;
            }
            catch (FileNotFoundException)
            {
                return false;
            }
        }

        protected override Boolean OpenNewPersistantStore()
        {
            pairs = new Dictionary<string, string>();
            isoStream = new IsolatedStorageFileStream(settingsFile, FileMode.Create, isoFile);
            return true;
        }

        protected override void DeserializeSettings()
        {
            pairs = new Dictionary<string, string>();
            try
            {

                isoStream.Position = 0;
                using (XmlReader reader = XmlReader.Create(isoStream))
                {
                    if (reader.ReadToFollowing("Settings"))
                    {
                        while (reader.MoveToNextAttribute())
                        {
                            String key = reader.Name;
                            String value = reader.Value.ToString();
                            pairs.Add(key, value);
                        }
                    }
                }
            }
            catch (System.IO.FileNotFoundException)
            {
                // this is OK - will be not found first time in
            }
        }

        protected override void WriteSetting(string key, string value)
        {
            pairs.Add(key, value);
        }

        protected override string ReadSetting(string key)
        {
            if (pairs.ContainsKey(key))
            {
                return pairs[key];
            }
            else
            {
                return null;
            }
        }

        private void writeXML(Stream ms)
        {
            using (XmlWriter w = XmlWriter.Create(ms))
            {
                w.WriteStartElement("Settings");
                foreach (KeyValuePair<String, String> pair in pairs)
                {
                    w.WriteAttributeString(pair.Key, pair.Value);
                }
                w.WriteEndElement();
            }
        }

        protected override void SerializeSettings()
        {
            using (MemoryStream ms = new MemoryStream())
            {
                writeXML(ms);
                ms.Flush();
                // convert the stream to a string
                string xmlFragment = System.Text.Encoding.UTF8.GetString(ms.GetBuffer(), 0, (int)ms.Length);
            }

            isoStream.Position = 0;
            writeXML(isoStream);
            isoStream.Flush();
        }

        protected override void ClosePersistantStore()
        {
            isoStream.Close();
            isoStream.Dispose();
            isoStream = null;
        }
    }
}