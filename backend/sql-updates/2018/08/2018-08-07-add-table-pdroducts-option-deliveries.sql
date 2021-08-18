CREATE TABLE IF NOT EXISTS `ps_products_optionDeliveries` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `productOptionID` int(11) NOT NULL,
  `deliveryID` int(11) NOT NULL,
  `typeID` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `productOptionID` (`productOptionID`,`deliveryID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;