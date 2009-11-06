:: This is a simple script that compiles the plugin using the free Flex SDK on Windows.
:: Learn more at http://developer.longtailvideo.com/trac/wiki/PluginsCompiling

SET FLEXPATH="\Program Files\flex_sdk_3"

echo "Compiling positioning plugin..."

%FLEXPATH%\bin\mxmlc .\Player5Plugin.as -sp .\ -o .\player5plugin.swf -library-path .\lib -load-externs sdk-classes.xml  -use-network=false