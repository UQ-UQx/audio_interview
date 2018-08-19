# ************************************************************
# Sequel Pro SQL dump
# Version 4529
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.6.38)
# Database: test
# Generation Time: 2018-08-19 06:43:12 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table posts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `posts`;

CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `authorId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authorId` (`authorId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `authors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;

INSERT INTO `posts` (`id`, `title`, `text`, `createdAt`, `updatedAt`, `authorId`)
VALUES
	(1,'A post by Maurine','Et qui quia odio dolore. Eligendi in deserunt. Harum sit odio dolor dicta provident quo provident.','2018-08-09 01:47:33','2018-08-09 01:47:33',1),
	(2,'A post by Edmond','Harum ullam pariatur quos est quod. Ea quisquam esse quia et commodi autem. Ut exercitationem maiores et voluptas.','2018-08-09 01:47:33','2018-08-09 01:47:33',2),
	(3,'A post by Katlyn','Omnis iusto doloremque et. Quos sequi molestiae beatae. Necessitatibus molestiae placeat saepe eligendi.','2018-08-09 01:47:33','2018-08-09 01:47:33',4),
	(4,'A post by Danika','Excepturi et laudantium fuga similique sed corporis voluptatem dolores esse. Et repudiandae magnam aut atque dolores voluptatibus ut. Iusto laborum placeat quia deleniti dolorem quibusdam.','2018-08-09 01:47:33','2018-08-09 01:47:33',3),
	(5,'A post by Millie','Veniam perspiciatis et nisi aut corporis nisi. Est soluta accusamus officiis ut excepturi. Libero enim qui quo fuga enim.','2018-08-09 01:47:33','2018-08-09 01:47:33',5),
	(6,'A post by Henderson','Non voluptas quia dicta ipsam omnis necessitatibus et. Adipisci dolores sunt numquam. Occaecati rerum neque et.','2018-08-09 01:47:33','2018-08-09 01:47:33',6),
	(7,'A post by Will','Quisquam asperiores sit voluptatum deserunt enim iste molestias nesciunt. Sequi omnis eligendi aut voluptatem. Eligendi voluptates omnis eius iure commodi et.','2018-08-09 01:47:33','2018-08-09 01:47:33',7),
	(8,'A post by Jayde','Voluptas impedit ea reprehenderit quae incidunt nemo vel in. Nihil iste asperiores consequatur ex quidem omnis. Deserunt quae eligendi.','2018-08-09 01:47:33','2018-08-09 01:47:33',9),
	(9,'A post by Giuseppe','Voluptatem exercitationem in omnis et consequatur nisi officiis excepturi. Nam omnis odit. Magni aut quia praesentium distinctio.','2018-08-09 01:47:33','2018-08-09 01:47:33',10),
	(10,'A post by Will','Nulla exercitationem omnis illum. Natus eum cum voluptatem consequatur ex et ipsum quam. Veritatis laboriosam deleniti omnis occaecati in culpa occaecati enim.','2018-08-09 01:47:33','2018-08-09 01:47:33',7),

/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
