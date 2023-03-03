DROP DATABASE IF EXISTS price_tracker;
CREATE DATABASE price_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE price_tracker;

CREATE TABLE admins (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    INDEX(username)
) ENGINE=InnoDB;

CREATE TABLE users (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    total_score INT UNSIGNED NOT NULL DEFAULT 0,
    current_score MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    INDEX (username)
) ENGINE=InnoDB;

CREATE TABLE tokens (
    user_id SMALLINT UNSIGNED NOT NULL,
    year YEAR NOT NULL,
    month TINYINT NOT NULL,
    amount SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (user_id, year, month),
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE stores (
    id SMALLINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('supermarket', 'convenience') NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,

    PRIMARY KEY (id),
    INDEX (name)
) ENGINE=InnoDB;

CREATE TABLE categories (
    id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    INDEX (name)
) ENGINE=InnoDB;

CREATE TABLE subcategories (
    id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_category_id VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    INDEX (name),
    FOREIGN KEY (parent_category_id) REFERENCES categories(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE products (
    id MEDIUMINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    subcategory_id VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE prices (
    product_id MEDIUMINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(6, 3),

    PRIMARY KEY (product_id, date),
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE offers (
    id INT NOT NULL AUTO_INCREMENT,
    store_id SMALLINT UNSIGNED NOT NULL,
    product_id MEDIUMINT UNSIGNED NOT NULL,
    user_id SMALLINT UNSIGNED NOT NULL,
    price DECIMAL(6,3) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    date DATE NOT NULL DEFAULT (CURRENT_DATE),
    better_than_previous_day_avg BOOLEAN NOT NULL DEFAULT FALSE,
    better_than_previous_week_avg BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE offer_reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    offer_id INT NOT NULL,
    user_id SMALLINT UNSIGNED NOT NULL,
    positive BOOLEAN NOT NULL,
    date DATE NOT NULL DEFAULT (CURRENT_DATE),

    PRIMARY KEY (id),
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (username, email, password)
VALUES ('user1', 'user1@mail.com', '$2y$10$4347F5AohUmZHhkgGcMShuWgem5WicEq9MLpPw9CO/LeC/gKADmB.');

INSERT INTO tokens (user_id, year, month, amount)
VALUES
(1, 2022, 11, 87),
(1, 2022, 10, 39);

INSERT INTO admins (username, password)
VALUES ('admin1', '$2y$10$4347F5AohUmZHhkgGcMShuWgem5WicEq9MLpPw9CO/LeC/gKADmB.');

SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT users_transfer_tokens
ON SCHEDULE EVERY 1 MONTH
DO
BEGIN
DECLARE users_count INT;
DECLARE i INT DEFAULT 0;
DECLARE user_score MEDIUMINT DEFAULT 0;

SELECT COUNT(*) INTO users_count FROM users;

WHILE i < users_count DO
SELECT current_score INTO user_score FROM users LIMIT i, 1;
INSERT INTO tokens (user_id, year, month, amount) VALUES (i, YEAR(CURRENT_DATE), MONTH(CURRENT_DATE), user_score);
UPDATE users SET current_score = 0 WHERE id = i;
SET i = i + 1;
END WHILE;
END //
DELIMITER ;
