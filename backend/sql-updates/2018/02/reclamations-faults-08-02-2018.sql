CREATE TABLE IF NOT EXISTS `dp_reclamationFaults` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_reclamationFaultDescriptions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `faultID` int(11) NOT NULL,
  `description` text NOT NULL,
  `lang` varchar(6) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `foultID` (`faultID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;