CREATE TABLE IF NOT EXISTS `dp_ongoingProgress` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ongoingID` int(11) NOT NULL,
  `type` tinyint(4) NOT NULL COMMENT  '1 - obverse, 2 - reverse',
  `sheets` int(11) NOT NULL,
  `updated` DATETIME NULL DEFAULT NULL,
  `created` DATETIME NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `ongoingID` (`ongoingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;