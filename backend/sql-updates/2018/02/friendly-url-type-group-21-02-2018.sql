ALTER TABLE  `ps_products_typeLangs` ADD  `slug` VARCHAR( 255 ) NOT NULL AFTER  `name`;
UPDATE `ps_products_typeLangs` SET `slug` = `name`;

ALTER TABLE  `ps_products_groupLangs` ADD  `slug` VARCHAR( 255 ) NOT NULL AFTER  `name`;
UPDATE `ps_products_groupLangs` SET `slug` = `name`;