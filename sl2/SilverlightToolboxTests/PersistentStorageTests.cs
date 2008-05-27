using NUnit.Framework;
using WatiN.Core;
using SilverlightToolbox;

namespace SilverlightToolboxTests
{
    public abstract class TestBase
    {
        protected IE ie = null;

        [TestFixtureSetUpAttribute]
        public void SetUp()
        {
            ie = new IE();
            ie.GoTo("file:///C:/trunk/silverlight/SilverlightProofs/SilverlightProofs/Playground.html");
        }

        [TestFixtureTearDownAttribute]
        public void TearDown()
        {
            ie.Close();
        }
    }


    /// <summary>
    /// WARNING: These tests won't run correct under 64bit Vista. Silverlight 1.1a September is 32bit only.
    /// </summary>
    [TestFixture]
    public class PersistentStorageTests : TestBase
    {
        [Test]
        public void Testing()
        {
            IPersistentStorage iso = new IsolatedStorage();
            iso.ResetSettings();
            iso.Set("beer", "yes please");
            Assert.AreEqual("yes please", iso.Get("beer"));
        }
    }
}
