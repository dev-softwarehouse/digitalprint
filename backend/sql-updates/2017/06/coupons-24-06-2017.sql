CREATE TABLE IF NOT EXISTS `dp_couponProducts` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `couponID` varchar(200) NOT NULL,
  `groupID` int(11) DEFAULT NULL,
  `typeID` int(11) DEFAULT NULL,
  `formatID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `dp_coupons` (
  `ID` varchar(200) NOT NULL,
  `created` datetime NOT NULL,
  `expires` date NOT NULL,
  `value` int(11) NOT NULL,
  `multiUser` tinyint(1) NOT NULL DEFAULT '0',
  `percent` tinyint(1) NOT NULL DEFAULT '0',
  `used` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `dp_couponOrders` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `orderID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `couponID` varchar(200) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;