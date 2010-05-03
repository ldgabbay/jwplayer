import base64
from xml.dom import minidom

basePath = "../assets"
skinName = "five"
skinPath = basePath + "/" + skinName + "/" + skinName + ".xml"
skinFile = open(skinPath,"r")
skin = minidom.parse(skinFile)
components = skin.getElementsByTagName('component')
for component in components:
	componentName = component.attributes["name"]
	elements = component.getElementsByTagName('element')
	for element in elements:
		elementPath = basePath + "/" + skinName + "/" + componentName.value + "/" + element.attributes['src'].value
		imageText = base64.b64encode(open(elementPath,"rb").read())
		element.attributes['src'].value = "url('data:image/png;base64," + imageText+ "')"
outputPath = skinPath = basePath + "/" + skinName + "/" + skinName + "-min.xml"
outputFile = open(skinPath,"w")
outputFile.write(skin.toxml())
outputFile.close()