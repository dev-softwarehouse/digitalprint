CREATE TABLE IF NOT EXISTS `dp_mainMetaTags` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `routeID` int(11) NOT NULL,
  `domainID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_mainMetaTagLanguages` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `mainMetaTagID` int(11) NOT NULL,
  `lang` varchar(4) NOT NULL,
  `title` varchar(400) NOT NULL,
  `description` text,
  `keywords` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `mainMetaTagID` (`mainMetaTagID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
