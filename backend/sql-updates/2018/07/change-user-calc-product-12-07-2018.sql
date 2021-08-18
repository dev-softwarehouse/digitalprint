ALTER TABLE  `ps_user_calc_products` CHANGE  `numberOfSheets`  `projectSheets` INT( 11 ) NULL DEFAULT NULL;
ALTER TABLE  `ps_user_calc_products` ADD  `sheets` INT NULL DEFAULT NULL AFTER  `projectSheets`;
ALTER TABLE  `ps_user_calc_products` CHANGE  `projectSheets`  `projectSheets` DOUBLE NULL DEFAULT NULL;