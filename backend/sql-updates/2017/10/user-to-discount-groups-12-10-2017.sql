CREATE TABLE IF NOT EXISTS `dp_userDiscountGroups` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `discountGroupID` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `userID` (`userID`,`discountGroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;