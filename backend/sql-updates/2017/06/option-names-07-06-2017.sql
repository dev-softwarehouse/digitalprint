CREATE TABLE IF NOT EXISTS `ps_products_attributeNames` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `lang` varchar(3) NOT NULL,
  `typeID` int(11) NOT NULL,
  `attrID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;