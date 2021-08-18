CREATE TABLE IF NOT EXISTS `ps_promotions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DomainID` int(11) NOT NULL,
  `promotionID` int(11) NOT NULL,
  `productGroupID` int(11) NOT NULL,
  `productType` int(11) DEFAULT NULL,
  `productFormat` int(11) DEFAULT NULL,
  `qty_start` decimal(18,2) NOT NULL,
  `qty_end` decimal(18,2) DEFAULT NULL,
  `active` bit(1) DEFAULT NULL,
  `serialno` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `ps_promotionLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `promotionID` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `lang` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;