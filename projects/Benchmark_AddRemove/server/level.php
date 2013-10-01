<?php
error_reporting(-1);
//header('Content-type: application/xml');
header('Access-Control-Allow-Origin: *');


//print_r($_POST);
echo doAction($_POST['action']);

//set path to current file path
$path = dirname(__FILE__);
chdir($path);

function doAction($action){
	
	$id = $_POST['id'];
	$mapFile = "map/".$id.".map";
	$offlineFile = "map/offline/".$id.".js";
	
	switch($action) {
		case "save": {
			if(!is_dir("map")) {
				mkdir("map");
				mkdir("map/offline");
			}
			file_put_contents($mapFile, $_POST['data']);
			file_put_contents($offlineFile, "Map.level[".$id."]  = ".$_POST['data']);
			return $_POST['data'];
		} break;

		case "load": {
			if(!empty($_POST['offlineMode'])){
				return file_get_contents($offlineFile);
			}
			
			if(file_exists($mapFile)){
				return file_get_contents($mapFile);
			}
			
			echo "Echo file not found: ".$mapFile;
			ThrowNotFound();
		} break;
	}

}


die();

function GetMapData($fileName)
{
	$file = @fopen($fileName, "rb");
	if($file === false) {
		ThrowNotFound();
	}

	$size = filesize($fileName);

	if($size > 0) {
		return fread($file, $size);
	}

	ThrowNotFound();

	return "";
}

function ThrowNotFound()
{
	header("HTTP/1.0 418 I'm a teapot");
	header("Status 418 I'm a teapot");
	die();
}
