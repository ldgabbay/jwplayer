# This is a simple script that compiles the plugin using MXMLC (free & cross-platform).
# To use, make sure you have downloaded and installed the Flex SDK in the following directory:
FLEXPATH=/Developer/SDKs/flex_sdk_3


echo "Compiling listening plugin..."
$FLEXPATH/bin/mxmlc ./Listening.as -sp ./ -o ./listening.swf -use-network=false