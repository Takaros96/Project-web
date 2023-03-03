<?php
require_once '../Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $sql = 'DELETE FROM offers WHERE id = :id';
    $res = $db->query($sql, [
        'id' => $_GET['id']
    ]);
    $res->rowCount() > 0 ? http_response_code(200) : http_response_code(500);
}