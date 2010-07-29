<?php
if(isset ($GLOBALS["HTTP_RAW_POST_DATA"])) {
	$im =  $GLOBALS["HTTP_RAW_POST_DATA"];
	$rn = rand();
	$fp = fopen('./'.$rn.'.jpg', 'wb');
	fwrite($fp, $im);
	fclose($fp);
	if (exif_imagetype($rn.'.jpg') == IMAGETYPE_JPEG) {
		echo 'http://127.0.0.1/player/testing/files/'.$rn.'.jpg';
		exit();
	}
}
echo "error";
?>