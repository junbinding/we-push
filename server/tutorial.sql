# ************************************************************
# Sequel Pro SQL dump
# Version 5446
#
# https://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.31)
# Database: tutorial
# Generation Time: 2020-10-09 12:37:18 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table subscriber
# ------------------------------------------------------------

DROP TABLE IF EXISTS `subscriber`;

CREATE TABLE `subscriber` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `topic_id` bigint(20) unsigned NOT NULL COMMENT '主题ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `unique_id` (`topic_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table topic
# ------------------------------------------------------------

DROP TABLE IF EXISTS `topic`;

CREATE TABLE `topic` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(10) unsigned NOT NULL COMMENT '用户ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `code` char(32) NOT NULL DEFAULT '' COMMENT '标识',
  `type` varchar(16) NOT NULL DEFAULT 'SINGLE' COMMENT '个人SINPLE多人MULTI',
  `title` varchar(256) NOT NULL DEFAULT '' COMMENT '标题',
  `status` varchar(16) NOT NULL DEFAULT 'NORMAL' COMMENT '状态：NORMAL,CLOSED',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `topic` WRITE;
/*!40000 ALTER TABLE `topic` DISABLE KEYS */;

INSERT INTO `topic` (`id`, `user_id`, `created_at`, `updated_at`, `code`, `type`, `title`, `status`)
VALUES
	(1,8,'2020-10-09 18:35:01','2020-10-09 18:35:01','2DCE4E4BD9DE05A0872AD7122F26138D','SINGLE','','NORMAL'),
	(2,9,'2020-10-09 18:35:01','2020-10-09 18:35:01','31E9BE56090897E5FB1CAF91DA0F641C','SINGLE','','NORMAL');

/*!40000 ALTER TABLE `topic` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table topic_pub_log
# ------------------------------------------------------------

DROP TABLE IF EXISTS `topic_pub_log`;

CREATE TABLE `topic_pub_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `topic_id` bigint(20) unsigned NOT NULL,
  `title` varchar(64) NOT NULL DEFAULT '' COMMENT '标题',
  `content` varchar(1024) NOT NULL DEFAULT '' COMMENT '内容',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `topic_pub_log` WRITE;
/*!40000 ALTER TABLE `topic_pub_log` DISABLE KEYS */;

INSERT INTO `topic_pub_log` (`id`, `topic_id`, `title`, `content`, `created_at`, `updated_at`)
VALUES
	(1,2,'fasdfasdfadf','','2020-10-09 18:35:05','2020-10-09 18:35:05'),
	(2,2,'兄弟该吃肉啦~asdfasf','','2020-10-09 18:36:00','2020-10-09 18:36:00'),
	(3,2,'兄弟该吃肉啦~','','2020-10-09 19:20:48','2020-10-09 19:20:48'),
	(4,2,'兄弟该吃肉啦~','','2020-10-09 19:25:41','2020-10-09 19:25:41');

/*!40000 ALTER TABLE `topic_pub_log` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nickname` varchar(32) NOT NULL DEFAULT '' COMMENT '昵称',
  `openid` varchar(128) NOT NULL DEFAULT '' COMMENT '微信openId',
  `avatar` varchar(256) NOT NULL DEFAULT '' COMMENT '头像',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` varchar(16) NOT NULL DEFAULT 'NORMAL' COMMENT '状态: NORMAL,CLOSE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;

INSERT INTO `user` (`id`, `nickname`, `openid`, `avatar`, `created_at`, `updated_at`, `status`)
VALUES
	(8,'','oB0QG08hN9---huuj7a5puEm5rpc','','2020-10-09 18:35:01','2020-10-09 18:35:01','NORMAL'),
	(9,'','oB0QG0wxH8UK2shNGSbBLiHHNi9Y','','2020-10-09 18:35:01','2020-10-09 18:35:01','NORMAL');

/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
