<?php
require_once '../Database.php';
$db = new Database();

session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $body = json_decode(file_get_contents("php://input"), true);
    
    $sql = 'SELECT user_id FROM offers WHERE id = :id';
    $resUser = $db->query($sql, ['id' => $body['offerId']]);
    $user_id = $resUser->fetch()['user_id'];

    $sql = 'INSERT INTO offer_reviews (offer_id, user_id, positive, date) VALUES (:offer_id, :user_id, :positive, NOW())';
    $res = $db->query($sql, [
        'offer_id' => $body['offerId'],
        'user_id' => $user_id,
        'positive' => $body['isPositive']
    ]);

    // Add points for user
    if ($body['isPositive']) {
        $sql = 'UPDATE users SET current_score = current_score + 5, total_score = total_score + 5 WHERE id = :id';
    } else {
        $sql = 'SELECT current_score FROM users WHERE id = :id';
        $resUser = $db->query($sql, ['id' => $user_id]);
        $user = $resUser->fetch();

        if ($user['current_score'] - 1 < 0) {
            $sql = 'UPDATE users SET current_score = 0, total_score = total_score - 1 WHERE id = :id';
        } else {
            $sql = 'UPDATE users SET current_score = current_score - 1, total_score = total_score - 1 WHERE id = :id';
        }
    }
    $db->query($sql, ['id' => $user_id]);

    $res->rowCount() > 0 ? http_response_code(200) : http_response_code(500);
} else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = 'SELECT r.date AS review_date, r.positive AS is_positive,
            o.price, o.date AS offer_date,
            o.better_than_previous_day_avg AS day_avg,
            o.better_than_previous_week_avg AS week_avg,
            s.name AS store_name, p.name AS product_name,
            u.username AS user_username, u.total_score AS user_total_score
            FROM offer_reviews r
            LEFT JOIN offers o ON r.offer_id = o.id
            LEFT JOIN stores s ON o.store_id = s.id
            LEFT JOIN products p ON o.product_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE r.user_id = :user_id
            ';
    $res = $db->query($sql, ['user_id' => $_SESSION['id']]);
    echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));
}
