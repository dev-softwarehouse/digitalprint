CREATE TABLE IF NOT EXISTS `dp_static_contentLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `staticContentID` int(11) NOT NULL,
  `content` text CHARACTER SET utf8 NOT NULL,
  `lang` varchar(4) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `staticContentID` (`staticContentID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `dp_static_contents` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(200) NOT NULL,
  `domainID` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
