ALTER TABLE  `ps_user_deliveryPrices` ADD  `productID` INT NULL;
ALTER TABLE  `ps_user_deliveryPrices` ADD  `volume` INT NULL;

ALTER TABLE  `dp_orderAddress` ADD  `shipmentID` VARCHAR( 200 ) NULL