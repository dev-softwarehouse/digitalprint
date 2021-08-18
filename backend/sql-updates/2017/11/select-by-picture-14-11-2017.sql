CREATE TABLE IF NOT EXISTS `ps_products_attributeSettings` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `typeID` int(11) NOT NULL,
  `attrID` int(11) NOT NULL,
  `selectByPicture` tinyint(1) NOT NULL DEFAULT  '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;