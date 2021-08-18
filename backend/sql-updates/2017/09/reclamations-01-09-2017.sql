CREATE TABLE IF NOT EXISTS `dp_reclamations` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `addressID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `orderID` int(11) NOT NULL,
  `faults` VARCHAR( 100 ) NOT NULL,
  `products` VARCHAR( 500 ) NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `statusID` int(11) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `modified` DATETIME NULL,
  PRIMARY KEY (`ID`),
  KEY `addressID` (`addressID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_reclamationFiles` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `reclamationID` int(11) NOT NULL,
  `folder` INT( 11 ) NOT NULL,
  `isAdmin` TINYINT( 1 ) NOT NULL DEFAULT  '0',
  `name` VARCHAR( 200 ) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_reclamationStatuses` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `active` tinyint(4) NOT NULL DEFAULT '1',
  `domainID` int(11) NOT NULL,
  `sort` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_reclamationStatusLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `statusID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `lang` varchar(4) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_reclamationMessages` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `reclamationID` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `isAdmin` tinyint(1) NOT NULL,
  `senderID` int(11) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `reclamationID` (`reclamationID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='messages to reclamation' AUTO_INCREMENT=1;
