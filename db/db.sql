/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE IF NOT EXISTS `chestionare` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_test` int unsigned NOT NULL,
  `id_intrebare` int unsigned NOT NULL,
  `valoareQ` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `id_test_id_intrebare` (`id_test`,`id_intrebare`),
  KEY `chestionare-FK-intrebari` (`id_intrebare`),
  CONSTRAINT `chestionare-FK-intrebari` FOREIGN KEY (`id_intrebare`) REFERENCES `intrebari` (`id_intrebare`) ON UPDATE RESTRICT,
  CONSTRAINT `chestionare-FK-teste` FOREIGN KEY (`id_test`) REFERENCES `teste` (`id_test`) ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `examene` (
  `id_examen` int unsigned NOT NULL AUTO_INCREMENT,
  `id_user` int unsigned NOT NULL,
  `id_test` int unsigned NOT NULL,
  `data` date NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `scor` tinyint unsigned DEFAULT NULL,
  `durata` int unsigned NOT NULL,
  PRIMARY KEY (`id_examen`) USING BTREE,
  KEY `examene-FK-useri` (`id_user`),
  KEY `examene-FK-teste` (`id_test`),
  CONSTRAINT `examene-FK-teste` FOREIGN KEY (`id_test`) REFERENCES `teste` (`id_test`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `examene-FK-useri` FOREIGN KEY (`id_user`) REFERENCES `useri` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `intrebari` (
  `id_intrebare` int unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(255) NOT NULL,
  `id_poza` int unsigned DEFAULT NULL,
  `tipQ_1xR` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_intrebare`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `pozeQ` (
  `id_poza` int unsigned NOT NULL AUTO_INCREMENT,
  `uri` varchar(255) NOT NULL DEFAULT 'sample.jpg',
  PRIMARY KEY (`id_poza`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `raspunsuriQ` (
  `id_raspunsQ` int unsigned NOT NULL AUTO_INCREMENT,
  `id_intrebare` int unsigned NOT NULL,
  `text` varchar(255) NOT NULL DEFAULT '',
  `corect` tinyint unsigned DEFAULT '0',
  PRIMARY KEY (`id_raspunsQ`) USING BTREE,
  KEY `raspunsuriQ-FK-intrebari` (`id_intrebare`),
  CONSTRAINT `raspunsuriQ-FK-intrebari` FOREIGN KEY (`id_intrebare`) REFERENCES `intrebari` (`id_intrebare`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `raspunsuriXam` (
  `id_raspunsXam` int unsigned NOT NULL AUTO_INCREMENT,
  `id_examen` int unsigned NOT NULL,
  `id_raspunsQ` int unsigned NOT NULL,
  `valoare` tinyint unsigned NOT NULL DEFAULT (0),
  PRIMARY KEY (`id_raspunsXam`) USING BTREE,
  UNIQUE KEY `id_examen_id_raspunsQ` (`id_examen`,`id_raspunsQ`),
  KEY `raspunsuriXam-FK-raspunsuriQ` (`id_raspunsQ`),
  CONSTRAINT `raspunsuriXam-FK-examene` FOREIGN KEY (`id_examen`) REFERENCES `examene` (`id_examen`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `raspunsuriXam-FK-raspunsuriQ` FOREIGN KEY (`id_raspunsQ`) REFERENCES `raspunsuriQ` (`id_raspunsQ`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `teste` (
  `id_test` int unsigned NOT NULL AUTO_INCREMENT,
  `nume` varchar(50) NOT NULL DEFAULT 'noName',
  `punctajStart` tinyint unsigned NOT NULL DEFAULT '0',
  `punctajMinim` tinyint unsigned NOT NULL DEFAULT (0),
  `timpLimitaS` int unsigned NOT NULL,
  `enabled` tinyint unsigned NOT NULL DEFAULT '1',
  `versiune` tinyint unsigned NOT NULL DEFAULT '1',
  `copyOf` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id_test`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `useri` (
  `id_user` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  `parola` varchar(45) NOT NULL,
  `nume` varchar(45) NOT NULL,
  `telefon` varchar(45) DEFAULT NULL,
  `enabled` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_user`) USING BTREE,
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
