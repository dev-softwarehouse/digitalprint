CREATE TABLE IF NOT EXISTS `ps_config_priceListLanguages` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `priceListID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `lang` varchar(4) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `priceListID` (`priceListID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;