#!/bin/bash
# This is a simple script that compiles the plugin using the free Flex SDK on Linux/Mac.
# Learn more at http://developer.longtailvideo.com/trac/wiki/PluginsCompiling

FLEXPATH=/Developer/SDKs/flex_sdk_3


echo "Compiling dockable skinnable plugin..."
$FLEXPATH/bin/mxmlc ./DockableSkinnablePlugin.as -sp ./ -o ./dockableskinnableplugin.swf -library-path+=../../lib -load-externs ../../lib/jwplayer-5-classes.xml -use-network=false