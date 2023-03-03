<?php
require_once '../Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
}