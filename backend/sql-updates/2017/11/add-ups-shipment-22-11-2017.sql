CREATE TABLE IF NOT EXISTS `dp_upsShipments` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `shipmentID` int(11) NOT NULL,
  `trackingNumber` varchar(100) NOT NULL,
  `created` DATETIME NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `shimpentID` (`shipmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;