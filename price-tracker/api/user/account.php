<?php
require_once '../Database.php';
$db = new Database();

session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    switch ($_SERVER['REQUEST_URI']) {
        case '/api/user/account/validate-username':
            $sql = 'SELECT username FROM users WHERE username = :username AND id != :id';
            $res = $db->query($sql, ['username' => $body['username'], 'id' => $_SESSION['id']]);
            $res->rowCount() > 0 ? http_response_code(409) : http_response_code(200);
            break;

        case '/api/user/account':
            $sql = 'UPDATE users SET username = :username, password = :password WHERE id = :id';
            $res = $db->query($sql, [
                'username' => $body['username'],
                'password' => password_hash($body['password'], PASSWORD_DEFAULT),
                'id' => $_SESSION['id']
            ]);
            $res->rowCount() > 0 ? http_response_code(200) : http_response_code(500);
            break;
    }
} else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql1 = '
    SELECT amount AS prev_month_tokens FROM tokens
    WHERE user_id = :user_id
    AND year = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    AND month = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    ';

    $sql2 = '
    SELECT SUM(amount) AS total_tokens FROM tokens
    WHERE user_id = :user_id
    ';

    $sql3 = '
    SELECT current_score, total_score FROM users
    WHERE id = :user_id
    ';

    $res1 = $db->query($sql1, ['user_id' => $_SESSION['id']]);
    $res2 = $db->query($sql2, ['user_id' => $_SESSION['id']]);
    $res3 = $db->query($sql3, ['user_id' => $_SESSION['id']]);

    $score = $res3->fetch();

    echo json_encode([
        'prev_month_tokens' => $res1->fetch()['prev_month_tokens']??0,
        'total_tokens' => $res2->fetch()['total_tokens']??0,
        'current_score' => $score['current_score'] ?? 0,
        'total_score' => $score['total_score']??0
    ]);
}
