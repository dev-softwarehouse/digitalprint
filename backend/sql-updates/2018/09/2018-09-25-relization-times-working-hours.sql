DROP TABLE IF EXISTS `ps_config_realizationTimeWorkingHours`;
CREATE TABLE IF NOT EXISTS `ps_config_realizationTimeWorkingHours` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `day` tinyint(4) NOT NULL,
  `langName` varchar(255) DEFAULT NULL,
  `startHour` tinyint(4) NOT NULL,
  `endHour` tinyint(4) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8;

INSERT INTO `ps_config_realizationTimeWorkingHours` (`ID`, `day`, `langName`, `startHour`, `endHour`, `active`) VALUES
  (1, 1, NULL, 8, 16, 1),
  (2, 2, NULL, 8, 16, 1),
  (3, 3, NULL, 8, 16, 1),
  (4, 4, NULL, 8, 16, 1),
  (5, 5, NULL, 8, 16, 0),
  (6, 6, NULL, 0, 0, 0),
  (7, 7, NULL, 0, 0, 0);