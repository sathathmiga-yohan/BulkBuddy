-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: bulkbuddy_database
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('6c07552ffd85');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `description` text,
  `normal_price` decimal(10,2) NOT NULL,
  `group_price` decimal(10,2) NOT NULL,
  `minimum_buyers` int NOT NULL,
  `maximum_quantity` int NOT NULL,
  `deadline` datetime NOT NULL,
  `status` enum('ACTIVE','SUCCESSFUL','FAILED') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_deals_id` (`id`),
  KEY `ix_deals_seller_id` (`seller_id`),
  CONSTRAINT `deals_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `check_group_price_less_than_normal` CHECK ((`group_price` < `normal_price`)),
  CONSTRAINT `check_group_price_positive` CHECK ((`group_price` > 0)),
  CONSTRAINT `check_maximum_quantity` CHECK ((`maximum_quantity` >= `minimum_buyers`)),
  CONSTRAINT `check_minimum_buyers_positive` CHECK ((`minimum_buyers` > 0)),
  CONSTRAINT `check_normal_price_positive` CHECK ((`normal_price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
INSERT INTO `deals` VALUES (1,2,'Dell Inspiron Laptop','15-inch laptop with 8GB RAM and 512GB SSD',120000.00,95000.00,2,5,'2026-12-31 18:29:59','ACTIVE','2026-09-29 07:47:46','2026-09-29 07:47:46'),(2,2,'Hand bags','test',1200.00,850.00,20,30,'2026-10-06 18:29:59','ACTIVE','2026-09-29 08:13:40','2026-09-29 08:13:40'),(3,5,'Laptop','Laptop group buying deal',150000.00,120000.00,2,3,'2026-10-10 12:30:00','ACTIVE','2026-09-29 14:22:04','2026-09-29 14:22:04'),(4,2,'Samsung Galaxy A55','128GB smartphone with AMOLED display',145000.00,125000.00,5,20,'2027-01-15 18:29:00','ACTIVE','2026-09-29 18:15:29','2026-09-29 18:15:29'),(5,2,'HP Pavilion Laptop','Intel Core i5 laptop with 16GB RAM and 512GB SSD',245000.00,215000.00,4,15,'2027-01-20 18:29:00','ACTIVE','2026-09-29 18:15:29','2026-09-29 18:15:29'),(6,2,'Sony Wireless Headphones','Bluetooth headphones with noise cancellation',35000.00,28500.00,5,30,'2027-02-10 18:29:00','ACTIVE','2026-09-29 18:15:29','2026-09-29 18:15:29'),(7,2,'Samsung Smart TV','43 inch Full HD smart television',165000.00,145000.00,3,12,'2027-02-15 18:29:00','ACTIVE','2026-09-29 18:15:29','2026-09-29 18:15:29'),(8,2,'Logitech Wireless Mouse','Ergonomic wireless mouse with USB receiver',8500.00,6500.00,10,50,'2027-03-01 18:29:00','ACTIVE','2026-09-29 18:15:29','2026-09-29 18:15:29'),(9,5,'phone','sertyuikjnbnmklkjhbv',50000.00,35000.00,2,4,'2026-10-01 18:29:59','FAILED','2026-09-30 15:07:43','2026-10-02 06:10:50');
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_notifications_id` (`id`),
  KEY `ix_notifications_user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,'Added to Waiting List','The deal \'Laptop\' is currently full. You have been added to the waiting list.',0,'2026-09-29 18:06:57'),(2,4,'You Have Been Promoted! (Deal #3)','A slot is now available for \'Laptop\'. You have been moved from WAITING to JOINED.',0,'2026-09-30 03:57:20'),(3,1,'Added to Waiting List','The deal \'Laptop\' is currently full. You have been added to the waiting list.',0,'2026-09-30 03:57:47'),(4,1,'You Have Been Promoted! (Deal #3)','A slot is now available for \'Laptop\'. You have been moved from WAITING to JOINED.',0,'2026-09-30 06:13:08');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deal_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `quantity` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `delivery_name` varchar(100) NOT NULL,
  `delivery_phone` varchar(30) NOT NULL,
  `delivery_address` varchar(500) NOT NULL,
  `delivery_city` varchar(100) NOT NULL,
  `delivery_postal_code` varchar(20) DEFAULT NULL,
  `status` enum('CONFIRMED','PROCESSING','COMPLETED','CANCELLED') NOT NULL,
  `payment_status` enum('PENDING','PAID') NOT NULL,
  `payment_method` enum('COD') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_deal_customer` (`deal_id`,`customer_id`),
  KEY `ix_orders_customer_id` (`customer_id`),
  KEY `ix_orders_deal_id` (`deal_id`),
  KEY `ix_orders_id` (`id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`),
  CONSTRAINT `check_order_quantity_positive` CHECK ((`quantity` > 0)),
  CONSTRAINT `check_order_total_price_positive` CHECK ((`total_price` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participations`
--

DROP TABLE IF EXISTS `participations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deal_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `status` enum('JOINED','WAITING','CANCELLED','EXPIRED') NOT NULL,
  `delivery_name` varchar(100) DEFAULT NULL,
  `delivery_phone` varchar(30) DEFAULT NULL,
  `delivery_address` varchar(500) DEFAULT NULL,
  `delivery_city` varchar(100) DEFAULT NULL,
  `delivery_postal_code` varchar(20) DEFAULT NULL,
  `joined_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_participation_deal_customer` (`deal_id`,`customer_id`),
  KEY `ix_participations_customer_id` (`customer_id`),
  KEY `ix_participations_deal_id` (`deal_id`),
  KEY `ix_participations_id` (`id`),
  CONSTRAINT `participations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `participations_ibfk_2` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participations`
--

LOCK TABLES `participations` WRITE;
/*!40000 ALTER TABLE `participations` DISABLE KEYS */;
INSERT INTO `participations` VALUES (1,3,1,'JOINED','sahta','0774556352','tdfghjjbn','srilanka','40000','2026-09-30 03:57:47','2026-09-30 06:13:08'),(2,3,3,'CANCELLED',NULL,NULL,NULL,NULL,NULL,'2026-09-29 18:03:20','2026-09-30 06:13:08'),(3,3,6,'JOINED','aakash','0258666464','dftgyuhijokbvgvhhj','jaffna','40000','2026-09-29 18:05:50','2026-09-29 18:05:50'),(4,3,4,'JOINED','sanju','056998452','cgfhujkmnjhbk','srilanka','40000','2026-09-29 18:06:57','2026-09-30 03:57:20');
/*!40000 ALTER TABLE `participations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role` enum('CUSTOMER','SELLER','ADMIN') NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'satha','satha@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$zXd7QTkZX+NjdUnCTkqWSg$VBLvVEL+e2GBvq0TxhijuLpspzv+kqO0dbIJ1TXHxUM','CUSTOMER',1,'2026-09-29 05:44:27','2026-09-29 05:44:27'),(2,'santhu','santhu@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$VRUKBbTOReckfGOMhZtgRw$m5BOVznuNwwIXXF+cIT0oPzMC/OGZNYUDkKJt3X3Hr4','SELLER',1,'2026-09-29 05:45:03','2026-09-29 05:45:03'),(3,'resia','resia@example.com','$argon2id$v=19$m=65536,t=3,p=4$77yk//mVmH9Y41RO7rzLVw$CUtnhe6AQuOaRbwC9fbPwT4H75Mb5LzPtkjRtlImYIQ','CUSTOMER',1,'2026-09-29 06:44:27','2026-09-29 06:44:27'),(4,'sanju','sanju@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$8/BRhknmYgvFE/KDzilndQ$Hl6SMXoDDAoTewT+91JNXymv83p8IBlNVm6PloPxRWU','CUSTOMER',1,'2026-09-29 14:20:12','2026-09-29 14:20:12'),(5,'sangee','sangee@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$cfdebpK+WwngHPL5JN+l9A$ADuTeNSR7OepyCNroFprRxSLxPLlkkcz131nhBRNCQY','SELLER',1,'2026-09-29 14:20:42','2026-09-29 14:20:42'),(6,'aakash','aakash@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$em5Dt3ADhGrcW3epjWH+mw$UxCDJ4aatC98XODkOSVakr1Lz/BAnIndgvuibQfLag0','CUSTOMER',1,'2026-09-29 18:04:27','2026-09-29 18:04:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-02 12:42:27
