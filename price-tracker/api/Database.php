<?php

class Database
{
    public static $cnx = null;

    public function __construct()
    {
        $host = 'localhost';
        $db_name = 'price_tracker';
        $username = 'root';
        $password = '';
        $port = '3308';
        $charset = 'utf8mb4';

        try {
            Database::$cnx = new PDO("mysql:host=$host;port=$port;dbname=$db_name;charset=$charset", $username, $password);
            Database::$cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }
    }

    public function __destruct()
    {
        Database::$cnx = null;
    }

    public function query($sql, $params = [])
    {
        $stmt = Database::$cnx->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
}
