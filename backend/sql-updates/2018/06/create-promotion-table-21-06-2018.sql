DROP TABLE IF EXISTS `dp_promotions`;
DROP TABLE IF EXISTS `ps_promotions`;
CREATE TABLE IF NOT EXISTS `ps_promotions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `productGroupID` int(11) DEFAULT NULL,
  `productTypeID` int(11) DEFAULT NULL,
  `productFormatID` int(11) DEFAULT NULL,
  `qtyStart` int(11) DEFAULT NULL,
  `qtyEnd` int(11) DEFAULT NULL,
  `metersStart` int(11) DEFAULT NULL,
  `metersEnd` int(11) DEFAULT NULL,
  `percentage` tinyint(4) NOT NULL DEFAULT '1',
  `timePromotion` tinyint(1) NOT NULL DEFAULT '0',
  `startTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` BIGINT( 20 ) NULL DEFAULT NULL,
  `repeat` tinyint(1) NOT NULL DEFAULT '0',
  `repeatTime` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `domainID` int(11) NOT NULL,
  `created` DATETIME NOT NULL,
  `iconID` INT NULL,
  PRIMARY KEY (`ID`),
  KEY `productGroupID` (`productGroupID`,`productTypeID`,`productFormatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `ps_promotionLangs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `promotionID` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `lang` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;