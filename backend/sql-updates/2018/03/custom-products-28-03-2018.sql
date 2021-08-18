CREATE TABLE IF NOT EXISTS `dp_customProducts` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `orderID` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `userID` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_customProductFiles` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `customProductID` int(11) NOT NULL,
  `folder` tinyint(4) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `customProductID` (`customProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE  `ps_products_types` ADD  `isCustomProduct` TINYINT( 1 ) NOT NULL DEFAULT  '0';