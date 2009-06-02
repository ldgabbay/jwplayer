# This is a simple script that compiles the plugin using MXMLC (free & cross-platform).
# To use, make sure you have downloaded and installed the Flex SDK in the following directory:
FLEXPATH=/Developer/SDKs/flex_sdk_3


echo "Compiling docking plugin..."
$FLEXPATH/bin/mxmlc ./Docking.as -sp ./ -o ./docking.swf -use-network=false