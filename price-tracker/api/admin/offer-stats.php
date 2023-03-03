<?php
require_once '../Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['month']) && isset($_GET['year'])) {
        $sql = '
        SELECT DAY(date) AS day, COUNT(id) AS amount FROM offers
        WHERE MONTH(date) = :month
        AND YEAR(date) = :year
        GROUP BY day
        ';
        $res = $db->query($sql, [
            'month' => $_GET['month'],
            'year' => $_GET['year']
        ]);
        echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));//απο php σε json
    }else if (isset($_GET['week']) && isset($_GET['year'])) {
        if (isset($_GET['subcategory_id'])) {
            $sql = '
            SELECT pr.id as pr_id,AVG(p.price) AS week_price, AVG(o.price) AS offer_price
            FROM offers o
            LEFT JOIN prices p on o.product_id = p.product_id
            LEFT JOIN products pr on o.product_id = pr.id
            LEFT JOIN subcategories s on pr.subcategory_id = s.id
            LEFT JOIN categories c on s.parent_category_id = c.id
            WHERE WEEK(o.date) = :week
            AND s.id = :subcategory_id
            GROUP BY pr.id;
            ';
            $res = $db->query($sql, [
                'week' => $_GET['week'],
                'subcategory_id' => $_GET['subcategory_id']
            ]);
            $prices = $res->fetchAll(PDO::FETCH_ASSOC);

            $avg_diff = [];
            for ($i = 0; $i < count($prices); $i++) {
                $avg_diff[$i] = abs($prices[$i]['week_price'] - $prices[$i]['offer_price']);
            }
        } else {
            $sql = '
            SELECT AVG(p.price) AS week_price, AVG(o.price) AS offer_price
            FROM offers o
            LEFT JOIN prices p on o.product_id = p.product_id
            LEFT JOIN products pr on o.product_id = pr.id
            LEFT JOIN subcategories s on pr.subcategory_id = s.id
            LEFT JOIN categories c on s.parent_category_id = c.id
            WHERE WEEK(o.date) = :week
            AND c.id = :category_id
            GROUP BY c.id
            ';
            $res = $db->query($sql, [
                'week' => $_GET['week'],
                'category_id' => $_GET['category_id']
            ]);
            $prices = $res->fetch();

            if ($prices) {
                $avg_diff = abs($prices['week_price'] - $prices['offer_price']);
            } else {
                $avg_diff = 0;
            }
        }

        echo json_encode($avg_diff);
    }
}