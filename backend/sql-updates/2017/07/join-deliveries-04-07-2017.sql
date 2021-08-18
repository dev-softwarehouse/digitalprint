ALTER TABLE  `ps_user_deliveryPrices` ADD  `joined` TINYINT(1) NOT NULL DEFAULT  '0';
ALTER TABLE  `ps_user_deliveryPrices` ADD  `active` TINYINT(1) NOT NULL DEFAULT  '1';
ALTER TABLE  `dp_orderAddress` ADD  `joined` TINYINT( 1 ) NOT NULL DEFAULT  '0';