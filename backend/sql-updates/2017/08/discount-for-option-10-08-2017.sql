CREATE TABLE IF NOT EXISTS `ps_config_discountPrices` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `discountGroupID` int(11) NOT NULL,
  `controllerID` int(11) NOT NULL COMMENT 'pricelist or workspace or printType ID',
  `attrID` int(11) NOT NULL,
  `optID` int(11) NOT NULL,
  `amount` double NOT NULL,
  `value` double NOT NULL,
  `priceType` int(11) NOT NULL,
  `expense` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `controllerID` (`controllerID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;