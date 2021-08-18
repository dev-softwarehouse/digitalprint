CREATE TABLE IF NOT EXISTS `dp_paymentReminder` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `orderID` int(11) NOT NULL,
  `remindDate1` datetime NOT NULL,
  `remindDate2` datetime DEFAULT NULL,
  `remindDate3` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `orderID` (`orderID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;