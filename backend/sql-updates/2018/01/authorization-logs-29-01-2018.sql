CREATE TABLE IF NOT EXISTS `dp_authorizationLogs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `controller` varchar(200) NOT NULL,
  `action` varchar(200) NOT NULL,
  `package` varchar(100) DEFAULT NULL,
  `domainID` int(11) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `userID` (`userID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;