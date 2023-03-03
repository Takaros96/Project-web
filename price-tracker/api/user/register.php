<?php
require_once '../Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    switch ($_SERVER['REQUEST_URI']) {
        case '/api/user/register/validate-email':
            $sql = 'SELECT email FROM users WHERE email = :email';
            $res = $db->query($sql, ['email' => $body['email']]);
            $res->rowCount() > 0 ? http_response_code(409) : http_response_code(200);
            break;
        case '/api/user/register/validate-username':
            $sql = 'SELECT username FROM users WHERE username = :username';
            $res = $db->query($sql, ['username' => $body['username']]);
            $res->rowCount() > 0 ? http_response_code(409) : http_response_code(200);
            break;
        case '/api/user/register':
            $sql = 'INSERT INTO users (username, email, password) VALUES (:username, :email, :password)';
            $res = $db->query($sql, [
                'username' => $body['username'],
                'email' => $body['email'],
                'password' => password_hash($body['password'], PASSWORD_DEFAULT)
            ]);

            $res->rowCount() > 0 ? http_response_code(201) : http_response_code(500);
            break;
    }
}
