<?php
require_once './Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['name'])) {
        $sql = 'SELECT s.*, COUNT(o.id) AS offers_amount FROM stores s
                LEFT JOIN offers o ON o.store_id = s.id
                WHERE name LIKE :name
                GROUP BY s.id';
        $res = $db->query($sql, ['name' => '%' . $_GET['name'] . '%']);
        $stores = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($stores);
    } else if (isset($_GET['category_id'])) {
        $sql = 'SELECT s.*, COUNT(o.id) AS offers_amount FROM offers o
                LEFT JOIN stores s ON o.store_id = s.id
                LEFT JOIN products p ON o.product_id = p.id
                LEFT JOIN subcategories s2 ON p.subcategory_id = s2.id
                LEFT JOIN categories c ON s2.parent_category_id = c.id
                WHERE c.id = :category_id GROUP BY s.id';
        $res = $db->query($sql, ['category_id' => $_GET['category_id']]);
        $stores = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($stores);
    } else if (isset($_GET['with_offers'])) {
        $sql = 'SELECT s.*, COUNT(o.id) AS offers_amount FROM offers o
                LEFT JOIN stores s ON o.store_id = s.id
                GROUP BY s.id';
        $res = $db->query($sql);
        $stores = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($stores);
    }
}