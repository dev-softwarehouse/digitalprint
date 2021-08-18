CREATE TABLE IF NOT EXISTS `dp_departments` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `sort` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `color` VARCHAR(10) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `sort` (`sort`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;