CREATE TABLE IF NOT EXISTS `ps_user_calc_product_specialAttributes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `calcProductID` int(11) NOT NULL,
  `name` varchar(300) NOT NULL,
  `price` int(11) NOT NULL,
  `expense` int(11) DEFAULT NULL,
  `type` tinyint(3) NOT NULL,
  `operatorID` int(11) NOT NULL,
  `weight` float(9,4) DEFAULT NULL,
  `modified` datetime NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `calcProductID` (`calcProductID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;