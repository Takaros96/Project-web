<?php
require_once './Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['subcategory_id'])) {
        $sql = 'SELECT * FROM products WHERE subcategory_id = :subcategory_id';
        $res = $db->query($sql, [':subcategory_id' => $_GET['subcategory_id']]);
        $products = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
    } else if (isset($_GET['name'])) {
        $sql = 'SELECT * FROM products WHERE name LIKE :name';
        $res = $db->query($sql, ['name' => '%' . $_GET['name'] . '%']);
        $products = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
    }
}
