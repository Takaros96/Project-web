<?php
require_once '../Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    // Creat multiline insert query
    $sql = 'INSERT INTO prices (product_id, date, price) VALUES ';
    $inserts = [];
    foreach ($body as $param) {
        $sql .= '(';
        $sql .= implode(',', array_fill(0, count($param), '?'));
        $sql .= '),';

        $inserts = array_merge($inserts, array_values($param));
    }
    $sql = rtrim($sql, ',');
    $sql .= 'ON DUPLICATE KEY UPDATE product_id = VALUES(product_id), date = VALUES(date), price = VALUES(price)';

    try {
        $res = $db->query($sql, $inserts);
        $res->rowCount() > 0 ? http_response_code(201) : http_response_code(200);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
