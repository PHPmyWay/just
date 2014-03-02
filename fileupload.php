<?php

$allowedExts = array("gif", "jpeg", "jpg", "png");
$count = count($_FILES['file']['name']);

for ($i = 0; $i < $count; ++$i) {

    $temp = explode(".", $_FILES["file"]["name"][$i]);
    $extension = end($temp);
    
    if ((($_FILES["file"]["type"][$i] == "image/gif")
            || ($_FILES["file"]["type"][$i] == "image/jpeg")
            || ($_FILES["file"]["type"][$i] == "image/jpg")
            || ($_FILES["file"]["type"][$i] == "image/pjpeg")
            || ($_FILES["file"]["type"][$i] == "image/x-png")
            || ($_FILES["file"]["type"][$i] == "image/png"))
        && ($_FILES["file"]["size"][$i] < 988945 )
        && in_array($extension, $allowedExts)) {
        
        if ($_FILES["file"]["error"][$i] > 0) {
            echo "Return Code: " . $_FILES["file"]["error"][$i] . "<br>";
        }else {
            echo "Upload: " . $_FILES["file"]["name"][$i] . "<br>";
            echo "Type: " . $_FILES["file"]["type"][$i] . "<br>";
            echo "Size: " . ($_FILES["file"]["size"][$i] / 1024) . " kB<br>";
            echo "Temp file: " . $_FILES["file"]["tmp_name"][$i] . "<br>";

            if (file_exists(dirname(__FILE__) . "/upload/" . $_FILES["file"]["name"][$i])) {
                echo $_FILES["file"]["name"][$i] . " already exists. ";
            }else {
                move_uploaded_file($_FILES["file"]["tmp_name"][$i],
                dirname(__FILE__) . "/upload/" . $_FILES["file"]["name"][$i]);
                echo "Stored in: " . "upload/" . $_FILES["file"]["name"][$i];
            }
        }
        
    }else {
        echo "Invalid file";
    }  
}