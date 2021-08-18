<?php


use Phinx\Migration\AbstractMigration;

class AlterOrderAddress extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SHOW COLUMNS FROM `dp_orderAddress` LIKE 'collectionPointID'");

        if (!$row) {
            $this->query("ALTER TABLE `dp_orderAddress` ADD `collectionPointID` INT(11) NULL DEFAULT NULL AFTER `shipmentID`;");
        }
    }

    public function down()
    {
        $this->query("ALTER TABLE `dp_orderAddress` DROP `collectionPointID`;");
    }
}
