using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace DefaultSkin
{
    public class DefaultButton : Control
    {
        FrameworkElement implementationRoot;
        TextBlock tb;

        public event EventHandler Click;

        public DefaultButton()
        {
            System.IO.Stream s = this.GetType().Assembly.GetManifestResourceStream("DefaultSkin.DefaultButton.xaml");
            implementationRoot = this.InitializeFromXaml(new System.IO.StreamReader(s).ReadToEnd());

            tb = implementationRoot.FindName("tb") as TextBlock;
            this.Loaded += new EventHandler(MyLabel_Loaded);
            base.Width = implementationRoot.Width;
            base.Height = implementationRoot.Height;

            implementationRoot.MouseLeftButtonUp += new MouseEventHandler(implementationRoot_MouseLeftButtonDown);
        }

        void implementationRoot_MouseLeftButtonDown(object sender, MouseEventArgs e)
        {
            if (Click != null)
            {
                Click(this, new EventArgs());
            }
        }

        void MyLabel_Loaded(object sender, EventArgs e)
        {
            UpdateLayout();
        }

        public virtual new double Width
        {
            get
            {
                return implementationRoot.Width;
            }
            set
            {
                implementationRoot.Width = value;
                UpdateLayout();
            }
        }

        public virtual new double Height
        {
            get
            {
                return implementationRoot.Height;
            }
            set
            {
                implementationRoot.Height = value;
                UpdateLayout();
            }
        }

        public String Text
        {
            get
            {
                return tb.Text;
            }
            set
            {
                tb.Text = value;
                UpdateLayout();
            }
        }

        protected void UpdateLayout()
        {
            tb.SetValue(Canvas.LeftProperty, (Width - tb.ActualWidth) / 2);
            tb.SetValue(Canvas.TopProperty, (Height - tb.ActualHeight) / 2);
        }
    }
}