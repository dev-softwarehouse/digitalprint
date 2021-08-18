ALTER TABLE  `dp_orderStatuses` ADD  `type` TINYINT( 1 ) NOT NULL DEFAULT  '0' COMMENT  '0 - default, 1- first, 2 - last, 3 - rejected';

ALTER TABLE `dp_orders` ADD `ended` DATETIME NULL DEFAULT NULL;

