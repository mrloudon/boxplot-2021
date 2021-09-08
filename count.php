<?php

/*
 * School of Psychology
 * Turitea Campus, Palmerston North
 * MASSEY UNIVERSITY
 */

define("FILE_NAME", "ip.txt");
define("MAX_LEN", 512);
define("MAX_IP", 64);

if(!($browser = filter_input(INPUT_POST, "browser",FILTER_SANITIZE_STRING))){
    exit("No browser." . PHP_EOL);
} 
if (strlen($browser) >= MAX_LEN){
    exit("Excessive data." . PHP_EOL);
}
$ip = trim($_SERVER['REMOTE_ADDR']);
if (strlen($ip) >= MAX_IP){
    exit("Excessive IP." . PHP_EOL);
}
date_default_timezone_set('NZ');
$date = new DateTime();
$clean =  $date->format('Y-m-d, H:i:s,') . $ip . ',' .trim($browser);

if (($fp = fopen(FILE_NAME, "a"))) {
    
    flock($fp, LOCK_EX);
    fwrite($fp, $clean . PHP_EOL);
    flock($fp, LOCK_UN);
    fclose($fp);
    echo "OK" . PHP_EOL;
} else {
    exit("Could not open " . $file . PHP_EOL);
}