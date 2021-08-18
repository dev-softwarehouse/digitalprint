CREATE TABLE IF NOT EXISTS `dp_invoices` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `invoiceID` int(11) NOT NULL,
  `type` tinyint(2) NOT NULL,
  `documentDate` date NOT NULL,
  `paymentDate` date DEFAULT NULL,
  `sellDate` date DEFAULT NULL,
  `orderID` int(11) NOT NULL,
  `addressID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;