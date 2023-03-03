<?php
require_once '../Database.php';
$db = new Database();

session_start();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        isset($_SESSION['id']) ? http_response_code(200) : http_response_code(401);
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        switch ($_SERVER['REQUEST_URI']) {
            case '/api/user/login/validate-username':
                $sql = 'SELECT username FROM users WHERE username = :username';
                $res = $db->query($sql, ['username' => $body['username']]);
                $res->rowCount() > 0 ? http_response_code(200) : http_response_code(404);
                break;

            case '/api/user/login':
                $sql = 'SELECT id, password FROM users WHERE username = :username';

                $res = $db->query($sql, ['username' => $body['username']]);

                if ($res->rowCount() > 0) {
                    $row = $res->fetch();
                    if (password_verify($body['password'], $row['password'])) {
                        $_SESSION['id'] = $row['id'];
                        http_response_code(200);
                    } else {
                        http_response_code(401);
                    }
                } else {
                    http_response_code(404);
                }
                break;
        }
}
