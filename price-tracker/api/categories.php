<?php
require_once './Database.php';
$db = new Database();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['parent_category_id'])) {
        $sql = 'SELECT * FROM subcategories WHERE parent_category_id = :parent_category_id';
        $res = $db->query($sql, [':parent_category_id' => $_GET['parent_category_id']]);
        $subcategories = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($subcategories);
    } else {
        $sql = 'SELECT * FROM categories';
        $res = $db->query($sql);
        $categories = $res->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($categories);
    }
}
