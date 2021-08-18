ALTER TABLE  `dp_ongoings` ADD  `sheetNumber` INT NULL DEFAULT NULL AFTER  `processID`;
ALTER TABLE  `dp_ongoings` ADD  `processSideType` TINYINT NULL DEFAULT NULL AFTER  `sheetNumber`;

ALTER TABLE  `dp_ongoingLogs` ADD  `sheetNumber` INT NULL DEFAULT NULL;
ALTER TABLE  `dp_ongoingLogs` ADD  `processSideType` TINYINT NULL;