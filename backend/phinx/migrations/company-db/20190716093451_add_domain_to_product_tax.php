<?php


use Phinx\Migration\AbstractMigration;

class AddDomainToProductTax extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SHOW COLUMNS FROM `ps_products_typeTaxes` LIKE 'domainID'");

        if( !$row ) {
            $this->query("ALTER TABLE `ps_products_typeTaxes` ADD `domainID` INT NOT NULL AFTER `taxID`, ADD INDEX `domainID` (`domainID`);");
        }
    }

    public function down()
    {
        $this->query("ALTER TABLE `ps_products_typeTaxes` DROP `domainID`;");
    }

}
