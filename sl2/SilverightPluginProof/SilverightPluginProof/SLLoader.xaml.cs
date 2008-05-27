using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Reflection;
using Common;


namespace SilverightPluginProof
{

    public partial class Page : Canvas
    {
        public void Page_Loaded(object o, EventArgs e)
        {
            // Required to initialize variables
            InitializeComponent();

            // Load main dll

            try
            {
                // Copy the DLL of MainApp (MainhApp.dll to the SilverlightPluginProof\ClientBin)

                PluginAssembly assembly = new PluginAssembly("MainApp, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
                    new Uri("MainApp.dll", UriKind.Relative));

                // load the assembly into our app domain
                Assembly pluginAssembly = Assembly.Load(assembly.AssemblyName);

                Type[] types = pluginAssembly.GetTypes();

                // enumerate all types in the assembly and pull out all the ones that are of type IPlugin
                // this allows for more than one IPlugin per assembly.
                foreach (Type type in types)
                {
                    if (type.GetInterface(typeof(IPlugin).FullName, false) != null)
                    {
                        // instantiate and load the plugin
                        Control instance = (Control)Activator.CreateInstance(type);

                        // _plugins.Add(instance);
                        pluginCanvas.Children.Add(instance);
                    }
                    else
                    {
                        // doesn't implement the interface we want
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.ToString());

            }
        }
    }
}
