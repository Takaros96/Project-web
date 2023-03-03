<?php
require_once '../Database.php';
$db = new Database();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'DELETE':
        $sql = "DELETE FROM stores";

        try {
            $res = $db->query($sql);
            $res->rowCount() > 0 ? http_response_code(200) : http_response_code(204);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => $e->getMessage()]);
        }
        break;
    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        // Creat multiline insert query
        $sql = 'INSERT INTO stores (id, name, type, latitude, longitude) VALUES ';
        $inserts = [];
        foreach ($body as $param) {
            $sql .= '(';
            $sql .= implode(',', array_fill(0, count($param), '?'));
            $sql .= '),';

            $inserts = array_merge($inserts, array_values($param));
        }
        $sql = rtrim($sql, ',');
        $sql .= 'ON DUPLICATE KEY UPDATE name = VALUES(name), type = VALUES(type), latitude = VALUES(latitude), longitude = VALUES(longitude)';

        try {
            $res = $db->query($sql, $inserts);
            $res->rowCount() > 0 ? http_response_code(201) : http_response_code(200);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }

        break;
}
