CREATE TABLE IF NOT EXISTS `dp_orderMessages` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `orderID` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `isAdmin` tinyint(1) NOT NULL,
  `senderID` int(11) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  `isFirst` TINYINT( 1 ) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `orderID` (`orderID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='messages to order' AUTO_INCREMENT=1;

