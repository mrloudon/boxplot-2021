<?php

/*
 * School of Psychology
 * Turitea Campus, Palmerston North
 * MASSEY UNIVERSITY
 */


define("MAX_LEN", 1024);
define("MIN_LEN", 1);
define("RESULTS_FILE", "posted.csv");

header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain");

function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP')) {
        $ipaddress = getenv('HTTP_CLIENT_IP');
    } else if (getenv('HTTP_X_FORWARDED_FOR')) {
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    } else if (getenv('HTTP_X_FORWARDED')) {
        $ipaddress = getenv('HTTP_X_FORWARDED');
    } else if (getenv('HTTP_FORWARDED_FOR')) {
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    } else if (getenv('HTTP_FORWARDED')) {
        $ipaddress = getenv('HTTP_FORWARDED');
    } else if (getenv('REMOTE_ADDR')) {
        $ipaddress = getenv('REMOTE_ADDR');
    } else {
        $ipaddress = 'UNKNOWN';
    }
    return $ipaddress;
}

if (!($data = filter_input(INPUT_POST, "text", FILTER_UNSAFE_RAW))) {
    exit("No data passed." . PHP_EOL);
}
if (strlen($data) >= MAX_LEN) {
    exit("Excessive data." . PHP_EOL);
}
if (strlen($data) < MIN_LEN) {
    exit("Inadequate data." . PHP_EOL);
}

// echo $data;

date_default_timezone_set('NZ');
$date = new DateTime();
$ip_address = get_client_ip();
$clean =  $date->format('Y-m-d, H:i:s,') . $ip_address . ',' . trim($data);

if (($fp = fopen(RESULTS_FILE, "a"))) {
    flock($fp, LOCK_EX);
    fwrite($fp, trim($clean) . PHP_EOL);
    flock($fp, LOCK_UN);
    fclose($fp);
    chmod(RESULTS_FILE, 0664);
    echo "OK" . PHP_EOL;
} else {
    exit("Could not open " . RESULTS_FILE . PHP_EOL);
}