<?php
require_once '../Database.php';
$db = new Database();

session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $body = json_decode(file_get_contents("php://input"), true);

    switch ($_SERVER['REQUEST_URI']) {
        case '/api/user/offers':
            // Check if other offer exists
            $sql = 'SELECT * FROM offers
                    WHERE store_id = :store_id
                    AND product_id = :product_id
                    AND (SELECT price * 0.8) < :price
                    ORDER BY price
                    ';
            $res = $db->query($sql, [
                'store_id' => $body['store_id'],
                'product_id' => $body['product_id'],
                'price' => $body['price'],
            ]);

            if ($res->rowCount() > 0) {
                http_response_code(409);
                exit();
            }

            // Calculate percentage difference from previous weeks
            $day_sql = '
                SELECT price FROM prices
                WHERE product_id = :product_id
                AND DATE_SUB(CURDATE(), INTERVAL 1 DAY) = date
                ';

            $res = $db->query($day_sql, [
                'product_id' => $body['product_id'],
            ]);

            $day_price = $res->fetch()['price'];
            if ($body['price'] < $day_price * 0.8) {
                $day_avg = true;
                $week_avg = false;
            } else {
                $day_avg = false;

                $week_sql = '
                SELECT AVG(price) AS price FROM prices
                WHERE product_id = :product_id
                AND DATE_SUB(CURDATE(), INTERVAL 7 DAY) < date
                ';

                $res = $db->query($week_sql, [
                    'product_id' => $body['product_id'],
                ]);

                $week_avg = $res->fetch()['price'];
                if ($body['price'] < $week_avg * 0.8) {
                    $week_avg = true;
                } else {
                    $week_avg = false;
                }
            }

            $sql = "INSERT INTO offers (store_id, product_id, user_id, price, better_than_previous_day_avg, better_than_previous_week_avg) VALUES (:store_id, :product_id, :user_id, :price, :day_avg, :week_avg)";
            $res = $db->query($sql, array(
                ':store_id' => $body['store_id'],
                ':product_id' => $body['product_id'],
                ':user_id' => $_SESSION['id'],
                ':price' => $body['price'],
                ':day_avg' => $day_avg,
                ':week_avg' => $week_avg,
            ));

            if ($day_avg) {
                $sql = 'UPDATE users SET current_score = current_score + 50, total_score = total_score + 50 WHERE id = :id';
                $db->query($sql, [
                    'id' => $_SESSION['id'],
                ]);
            } else if ($week_avg) {
                $sql = 'UPDATE users SET current_score = current_score + 20, total_score = total_score + 20 WHERE id = :id';
                $db->query($sql, [
                    'id' => $_SESSION['id'],
                ]);
            }

            $res->rowCount() > 0 ? http_response_code(201) : http_response_code(400);
            break;

        case '/api/user/stock':
            $sql = 'UPDATE offers SET in_stock = :in_stock WHERE id = :id';
            $res = $db->query($sql, [
                'in_stock' => $body['inStock'],
                'id' => $body['offerId']
            ]);

            $res->rowCount() > 0 ? http_response_code(200) : http_response_code(400);
    }
} else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['store_id'])) {
        $sql = 'SELECT o.id AS offer_id, o.price AS offer_price,//epilefoume oles tis prosfores gia to katasthma sto poio kaname klik gia kth prosora eplegoyme ola ta pedia ths ,kai gia to kathe eidos ths prosforas.epilegoyme gia kth prosfora plhthos like, dislkike
            o.in_stock, o.date AS offer_date, o.better_than_previous_day_avg AS day_avg,
            o.better_than_previous_week_avg AS week_avg, p.id AS product_id,
            p.name AS product_name, u.id AS user_id, u.username AS user_username,
            u.total_score AS user_total_score,
            (SELECT COUNT(*) FROM offer_reviews o2 WHERE o2.positive = TRUE AND o2.offer_id = o.id) AS likes,
            (SELECT COUNT(*) FROM offer_reviews o2 WHERE o2.positive = FALSE AND o2.offer_id = o.id) AS dislikes
            FROM offers o
            LEFT JOIN products p ON o.product_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.store_id = :store_id
            ';
        $res = $db->query($sql, [
            'store_id' => $_GET['store_id']
        ]);
        echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));
    } else {
        $sql = 'SELECT o.price, o.date AS offer_date, o.in_stock,
                o.better_than_previous_day_avg AS day_avg,
                o.better_than_previous_week_avg AS week_avg,
                s.name AS store_name, p.name AS product_name,
                (SELECT COUNT(*) FROM offer_reviews o2 WHERE o2.positive = TRUE AND o2.offer_id = o.id) AS likes,
                (SELECT COUNT(*) FROM offer_reviews o2 WHERE o2.positive = FALSE AND o2.offer_id = o.id) AS dislikes
                FROM offers o
                LEFT JOIN stores s ON o.store_id = s.id
                LEFT JOIN products p ON o.product_id = p.id
                WHERE o.user_id = :user_id
                ';
        $res = $db->query($sql, [
            'user_id' => $_SESSION['id']
        ]);

        echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));
    }
}
