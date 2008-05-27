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
using System.IO;

namespace Common
{   
    public interface IPlugin
    {
        FrameworkElement RootElement { get; }

        // you can put in lots of other things here, like an Activate or Start method, 
        // functions to provide access to a common in-memory data store etc.
    }


    public class PluginAssembly
    {
        private string _assemblyName;
        private Uri _url;

        public PluginAssembly()
        {

        }

        public PluginAssembly(string assemblyName, Uri url)
        {
            _assemblyName = assemblyName;
            _url = url;
        }



        public string AssemblyName
        {
            get { return _assemblyName; }
            set { _assemblyName = value; }
        }

        public Uri Url
        {
            get { return _url; }
            set { _url = value; }
        }
    }

    public abstract class ControlBase : Control
    {
        private DependencyObject _rootElement;  // Set by LoadXaml. This is the starting point for all name searches
        protected bool _layoutSuspended = false;

        public ControlBase()
        {
            Loaded += new EventHandler(OnLoaded);
        }

        // assumes xaml file is in the same assembly
        public ControlBase(string xamlResouceName)
            : this()
        {
            LoadXaml(xamlResouceName);
        }

        public ControlBase(Assembly assembly)
            : this()
        {
            Stream resourceStream = null;
            string resourceName = this.GetType().ToString();

            if (assembly == null)
            {
                assembly = Assembly.GetCallingAssembly();
            }

            resourceStream = assembly.GetManifestResourceStream(resourceName);
        }


        /// <summary>
        /// Searches for an element by its name. Since this is a generic function,
        /// it returns a strongly-typed reference to the found element
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="name"></param>
        /// <returns></returns>
        protected T FindByName<T>(string name) where T : DependencyObject
        {
            return _rootElement.FindName(name) as T;
        }

        /// <summary>
        /// Set by LoadXaml. This is the starting point for all name searches.
        /// </summary>
        protected DependencyObject RootElement
        {
            get { return _rootElement; }
            set { _rootElement = value; }
        }

        protected virtual void OnLoaded(object sender, EventArgs e)
        {
            UpdateLayout();
        }

        /// <summary>
        /// Handles the InitializeFromXaml call that typically shows up 
        /// in a usercontrol's constructor.
        /// </summary>
        /// <param name="xamlResourceName"></param>
        protected void LoadXaml(string xamlResourceName)
        {
            try
            {

                System.IO.Stream s = this.GetType().Assembly.GetManifestResourceStream(xamlResourceName);

                LoadXaml(s);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.ToString());
                throw;
            }
        }

        /// <summary>
        /// Handles the InitializeFromXaml call that typically shows up 
        /// in a usercontrol's constructor.
        /// </summary>
        /// <param name="xamlResourceName"></param>
        protected void LoadXaml(System.IO.Stream xamlStream)
        {
            try
            {
                Loaded += new EventHandler(OnLoaded);

                _rootElement = this.InitializeFromXaml(new System.IO.StreamReader(xamlStream).ReadToEnd());
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.ToString());
                throw;
            }
        }

        public void SuspendLayout()
        {
            _layoutSuspended = true;
        }

        public void ResumeLayout()
        {
            _layoutSuspended = false;
            UpdateLayout();
        }

        protected abstract void UpdateLayout();

    }


}
