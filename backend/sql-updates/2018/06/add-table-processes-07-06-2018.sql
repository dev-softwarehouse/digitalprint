CREATE TABLE IF NOT EXISTS `dp_processes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR( 255 ) NOT NULL,
  `order` INT NOT NULL DEFAULT  '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;