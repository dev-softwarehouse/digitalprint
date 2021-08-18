CREATE TABLE IF NOT EXISTS `ps_products_printTypeWorkspaces` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `formatID` int(11) NOT NULL,
  `printTypeID` int(11) NOT NULL,
  `workspaceID` int(11) NOT NULL,
  `usePerSheet` int(11) DEFAULT NULL,
  `operationDuplication` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `workspaceID` (`workspaceID`),
  KEY `printTypeID` (`printTypeID`),
  KEY `formatID` (`formatID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

