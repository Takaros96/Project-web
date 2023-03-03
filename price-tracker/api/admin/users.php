<?php
require_once '../Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = '
    SELECT u.id, u.username, SUM(t.amount) AS total_tokens,
    (
        SELECT amount FROM tokens
        ORDER BY DATE_ADD(DATE(year * 10000 + month * 100 + 1), INTERVAL 1 MONTH) DESC
        LIMIT 1
    ) AS current_tokens
    FROM users u
    LEFT JOIN tokens t ON u.id = t.user_id
    GROUP BY u.id
    LIMIT :limit
    OFFSET :offset
    ';

    $stmt = Database::$cnx->prepare($sql);
    $stmt->bindParam(':limit', $_GET['limit'], PDO::PARAM_INT);
    $stmt->bindParam(':offset', $_GET['offset'], PDO::PARAM_INT);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
}