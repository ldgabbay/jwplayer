# This is a simple script that compiles the plugin using the free Flex SDK on Linux/Mac.
# Learn more at http://developer.longtailvideo.com/trac/wiki/PluginsCompiling

FLEXPATH=/Developer/SDKs/flex_sdk_3


echo "Compiling flashvars plugin..."
$FLEXPATH/bin/mxmlc ./Flashvars.as -sp ./ -o ./flashvars.swf -use-network=false