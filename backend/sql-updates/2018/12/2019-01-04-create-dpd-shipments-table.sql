CREATE TABLE IF NOT EXISTS `dp_dpdShipments` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `shipmentID` int(11) NOT NULL,
  `trackingNumber` varchar(200) DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `shipmentID` (`shipmentID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;