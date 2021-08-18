ALTER TABLE  `dp_reclamations` ADD  `operatorID` INT NULL AFTER  `statusID`;

ALTER TABLE  `ps_user_calc` ADD  `modified` DATETIME NULL;
ALTER TABLE  `ps_user_calc` ADD  `operatorID` INT NULL AFTER  `realisationDate`;

ALTER TABLE  `dp_base_prices` ADD  `copyFromID` INT NULL;

ALTER TABLE  `dp_reclamations` ADD  `pricesChanged` TINYINT( 1 ) NOT NULL DEFAULT  '0' AFTER  `operatorID`;