using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

using Common;

namespace MainApp
{
    public class MainControl : ControlBase, IPlugin
    {
        public MainControl()
        {
            LoadXaml("MainApp.MainControl.xaml");
        }


        protected override void UpdateLayout()
        {
            // nothing to do for now
        }

        #region IPlugin Members

        FrameworkElement IPlugin.RootElement
        {
            get { return this ; }
        }

        #endregion

/*        public MainControl()
        {
            System.IO.Stream s = this.GetType().Assembly.GetManifestResourceStream("MainApp.MainControl.xaml");
            this.InitializeFromXaml(new System.IO.StreamReader(s).ReadToEnd());
        }
 */
    }
}
