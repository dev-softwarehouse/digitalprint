-- +migrate Up
-- MySQL dump 10.13  Distrib 5.5.54, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dp
-- ------------------------------------------------------
-- Server version       5.5.54-0ubuntu0.12.04.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dp_auction_companies`
--

CREATE DATABASE IF NOT EXISTS `vprojekt`;

DROP TABLE IF EXISTS `dp_auction_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_auction_companies` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `auctionID` int(11) NOT NULL,
  `companyID` int(11) NOT NULL,
  `responseID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=394 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_auction_files`
--

DROP TABLE IF EXISTS `dp_auction_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_auction_files` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created` date NOT NULL,
  `auctionID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_auction_responseItemFiles`
--

DROP TABLE IF EXISTS `dp_auction_responseItemFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_auction_responseItemFiles` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created` date NOT NULL,
  `offerItemID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_auction_responseItems`
--

DROP TABLE IF EXISTS `dp_auction_responseItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_auction_responseItems` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `responseID` int(11) NOT NULL,
  `itemID` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `finalPrice` int(11) DEFAULT NULL,
  `inOrder` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_auction_responses`
--

DROP TABLE IF EXISTS `dp_auction_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_auction_responses` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `realizationDate` date NOT NULL,
  `description` text,
  `realizationDateFinal` date DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_auctions`
--

DROP TABLE IF EXISTS `dp_auctions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_auctions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `endDate` datetime NOT NULL,
  `companyID` int(11) NOT NULL,
  `offerID` int(11) NOT NULL,
  `description` text,
  `inRealization` tinyint(1) NOT NULL DEFAULT '0',
  `winnerResponseID` int(11) DEFAULT NULL,
  `inOrder` tinyint(1) NOT NULL DEFAULT '0',
  `orderDescription` text,
  `poNumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_config_moduleKeyLangs`
--

DROP TABLE IF EXISTS `dp_config_moduleKeyLangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_config_moduleKeyLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `moduleKeyID` int(11) NOT NULL,
  `lang` varchar(3) NOT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `courierKeyID` (`moduleKeyID`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_config_moduleKeys`
--

DROP TABLE IF EXISTS `dp_config_moduleKeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_config_moduleKeys` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `moduleID` int(11) NOT NULL,
  `key` varchar(100) NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'string',
  `func` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `courierUniqe` (`moduleID`,`key`),
  KEY `courierID` (`moduleID`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_config_moduleOptionLangs`
--

DROP TABLE IF EXISTS `dp_config_moduleOptionLangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_config_moduleOptionLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `moduleOptionID` int(11) NOT NULL,
  `lang` varchar(3) NOT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_config_moduleOptions`
--

DROP TABLE IF EXISTS `dp_config_moduleOptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_config_moduleOptions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `moduleKeyID` int(11) NOT NULL,
  `value` varchar(100) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_config_moduleTypes`
--

DROP TABLE IF EXISTS `dp_config_moduleTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_config_moduleTypes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `key` varchar(100) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_config_modules`
--

DROP TABLE IF EXISTS `dp_config_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_config_modules` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `key` varchar(100) NOT NULL,
  `typeID` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_currency`
--

DROP TABLE IF EXISTS `dp_currency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_currency` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `name` varchar(50) NOT NULL,
  `symbol` varchar(4) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_domains`
--

DROP TABLE IF EXISTS `dp_domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_domains` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `companyID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `port` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `companyID_2` (`companyID`,`name`),
  KEY `companyID` (`companyID`)
) ENGINE=InnoDB AUTO_INCREMENT=544 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_helpKeys`
--

DROP TABLE IF EXISTS `dp_helpKeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_helpKeys` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `moduleID` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `created` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_helpLangs`
--

DROP TABLE IF EXISTS `dp_helpLangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_helpLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `keyID` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `lang` varchar(3) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `keyID` (`keyID`,`lang`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_helps`
--

DROP TABLE IF EXISTS `dp_helps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_helps` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(200) NOT NULL,
  `description` tinytext,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `module` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_langSettings`
--

DROP TABLE IF EXISTS `dp_langSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_langSettings` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `name` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_langs`
--

DROP TABLE IF EXISTS `dp_langs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_langs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(200) NOT NULL,
  `value` varchar(255) NOT NULL,
  `lang` varchar(3) NOT NULL,
  `create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=6668 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_langs.copy`
--

DROP TABLE IF EXISTS `dp_langs.copy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_langs.copy` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(200) NOT NULL,
  `value` varchar(255) NOT NULL,
  `lang` varchar(3) NOT NULL,
  `create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=1194 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_mail_typeLangs`
--

DROP TABLE IF EXISTS `dp_mail_typeLangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_mail_typeLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `mailTypeID` int(11) NOT NULL,
  `lang` varchar(5) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `mailTypeID` (`mailTypeID`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_mail_types`
--

DROP TABLE IF EXISTS `dp_mail_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_mail_types` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_mail_variableLangs`
--

DROP TABLE IF EXISTS `dp_mail_variableLangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_mail_variableLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `variableID` int(11) NOT NULL,
  `desc` varchar(255) NOT NULL,
  `lang` varchar(4) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_mail_variables`
--

DROP TABLE IF EXISTS `dp_mail_variables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_mail_variables` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `mailTypeID` int(11) NOT NULL,
  `variable` varchar(120) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `mailTypeID` (`mailTypeID`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_menu`
--

DROP TABLE IF EXISTS `dp_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_menu` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(150) NOT NULL,
  `desc` text,
  `super` tinyint(1) NOT NULL DEFAULT '0',
  `title` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_permissions`
--

DROP TABLE IF EXISTS `dp_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_permissions` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `desc` varchar(50) DEFAULT NULL,
  `package` varchar(100) DEFAULT NULL,
  `controller` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `default` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=898 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_reclamationFaultDescriptions`
--

DROP TABLE IF EXISTS `dp_reclamationFaultDescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_reclamationFaultDescriptions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `faultID` int(11) NOT NULL,
  `description` text NOT NULL,
  `lang` varchar(6) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `foultID` (`faultID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_reclamationFaults`
--

DROP TABLE IF EXISTS `dp_reclamationFaults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_reclamationFaults` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_rolePerms`
--

DROP TABLE IF EXISTS `dp_rolePerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_rolePerms` (
  `roleID` int(10) unsigned NOT NULL,
  `permID` int(10) unsigned NOT NULL,
  UNIQUE KEY `roleID` (`roleID`,`permID`),
  UNIQUE KEY `roleID_2` (`roleID`,`permID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_roles`
--

DROP TABLE IF EXISTS `dp_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_roles` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `desc` text,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_subMenu`
--

DROP TABLE IF EXISTS `dp_subMenu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_subMenu` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `menuID` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `controller` varchar(100) DEFAULT NULL,
  `action` varchar(150) DEFAULT NULL,
  `package` varchar(100) DEFAULT NULL,
  `path` varchar(200) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_superusers`
--

DROP TABLE IF EXISTS `dp_superusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_superusers` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(200) NOT NULL,
  `pass` varchar(128) NOT NULL,
  `name` varchar(200) NOT NULL,
  `lastLogin` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_templates`
--

DROP TABLE IF EXISTS `dp_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_templates` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `fileName` varchar(255) DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_viewToVariables`
--

DROP TABLE IF EXISTS `dp_viewToVariables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_viewToVariables` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `viewID` int(11) NOT NULL,
  `variableID` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `templateID` (`viewID`,`variableID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_viewVariableLangs`
--

DROP TABLE IF EXISTS `dp_viewVariableLangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_viewVariableLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `variableID` int(11) NOT NULL,
  `desc` varchar(255) NOT NULL,
  `lang` varchar(4) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp_viewVariables`
--

DROP TABLE IF EXISTS `dp_viewVariables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp_viewVariables` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `function` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `e_layerTypes`
--

DROP TABLE IF EXISTS `e_layerTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `e_layerTypes` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `e_objectTypes`
--

DROP TABLE IF EXISTS `e_objectTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `e_objectTypes` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
