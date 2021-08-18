ALTER TABLE  `ps_config_priceLists` ADD  `allowJoinProcess` TINYINT( 1 ) NOT NULL DEFAULT  '0';
ALTER TABLE  `ps_user_calc` ADD  `beforeReCountPriceID` INT NULL AFTER  `priceID`;