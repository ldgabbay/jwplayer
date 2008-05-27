using System;
// For parsing the arguments
using System.Collections.Generic;
using System.Windows;
// For the Scriptable decorator (In System.Silverlight)
using System.Windows.Browser;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using SilverlightToolbox;
using SilverlightToolbox.Playlists.Xspf;
using SilverlightToolbox.Xml;

namespace SilverlightProofs
{
    // Allow external JS code to interact with scriptable methods below
    [Scriptable]
    public partial class Page : Canvas
    {
        private Rectangle theRectangle = null;

        // Use a form of persistent storage to get and set user settings.
        IPersistentStorage iso;

        public void Page_Loaded(object o, EventArgs e)
        {
            // Required to initialize variables
            InitializeComponent();

            // Export this class for external visibility.
            WebApplication.Current.RegisterScriptableObject("Page", this);

            // Get "TheRect" from the Page.xaml page
            theRectangle = TheRect;
            // Add eventhandler from C# to C#
            theRectangle.MouseLeftButtonUp += new MouseEventHandler(Make_Red);

            // Use startup arguments
            parseInitParams();

            // Display the user settings from the persisent store.
            iso = new IsolatedStorage();
            ClickGetKeyButton(this, null);

            // Start the timer loop
            InitTimer();

            // Try parsing a XSPF playlist
            ReadXSPF();
        }

        void Make_Red(object sender, MouseEventArgs e)
        {
            // Color the rectangle RED
            changeRectangleColor(Colors.Red);
        }

        void Make_Yellow(object o, EventArgs e)
        {
            // Color the rectangle YELLOW
            changeRectangleColor(Colors.Yellow);
        }

        // Allow JS to bind this event.
        [Scriptable]
        public event EventHandler<EventArgs> ColorChangedEvent;

        // Allow JS to bind this event.
        [Scriptable]
        public event EventHandler<EventArgs> DoNotSubscribeToThisEvent;

        void changeRectangleColor(Color newColor)
        {
            // Color the rectangle RED
            SolidColorBrush brush = new SolidColorBrush();
            brush.Color = newColor;
            theRectangle.Fill = brush;

            // Send out JS event to indicate color change.
            if (ColorChangedEvent != null)
            {
                EventArgs ea = new EventArgs();
                ColorChangedEvent.Invoke(this, ea);
            }

            // Also send out another event that is supposed to have zero subscribers, to check if JS warns us.
            if (DoNotSubscribeToThisEvent != null)
            {
                EventArgs ea = new EventArgs();
                DoNotSubscribeToThisEvent.Invoke(this, ea);
            }
        }

        [Scriptable]
        public void SetRectangleColor(String strColor)
        {
            Color color;
            switch (strColor.ToLower())
            {
                case "green": color = Colors.Green; break;
                default: color = Colors.Gray; break;
            }
            changeRectangleColor(color);
        }

        void parseInitParams()
        {
            // Get the startup arguments (passed from the hosting web page).
            IDictionary<string, string> startupArguments = WebApplication.Current.StartupArguments;

            // Display all arguments in a textblock.
            TextBlock tb = new TextBlock
            {
                TextWrapping = TextWrapping.Wrap
            };

            foreach (KeyValuePair<string, string> kv in startupArguments)
            {
                tb.Text += kv.Key + ":" + kv.Value + " ";
            }
            this.Children.Add(tb);
        }

        // These 3 eventhandler demonstrate the persisent storage by setting and getting a key-value pair.
        void ClickGetKeyButton(object o, EventArgs e)
        {
            TheValue.Text = iso.Get("testkey", "No value...");
        }
        void ClickStoreKeyButton(object o, EventArgs e)
        {
            iso.Set("testkey", "hello");
        }
        void ClickResetStoreButton(object o, EventArgs e)
        {
            iso.ResetSettings();
        }

        Storyboard timer;
        void InitTimer()
        {
            timer = (Storyboard)XamlReader.Load("<Storyboard xmlns:x=\"http://schemas.microsoft.com/winfx/2006/xaml\" x:Name=\"TimerClick\" Duration=\"00:00:02\" />");
            timer.Completed += new EventHandler(timer_Completed);
            this.Resources.Add(timer);
            timer.Begin();
        }

        int timerCounter = 0;
        void timer_Completed(object sender, EventArgs e)
        {
            timerCounter++;
            TheTimerCounter.Text = timerCounter.ToString();
            timer.Begin();
        }

        private void ReadXSPF()
        {
            string url = "Resources/xspf_full_playlist.xml";
            Downloader downloader = new Downloader();
            downloader.Completed += new EventHandler(downloadCompleted);
            downloader.Open("GET", new Uri(url, UriKind.RelativeOrAbsolute));
            downloader.Send();
        }

        void downloadCompleted(object sender, EventArgs e)
        {
            Downloader d = (Downloader)sender;

            // Retrieve downloaded content.
            var xmlFragment = d.ResponseText;

            Playlist playlist = new Playlist();
            SimpleXmlDocument doc = new SimpleXmlDocument(xmlFragment);
            playlist.Load(doc);
            FillPlaylist(playlist);
        }

        private void FillPlaylist(Playlist playlist)
        {
            TheValue.Text = "Loaded " + playlist.TrackCount + " items from playlist";
        }
    }
}
