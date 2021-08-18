<?php


use Phinx\Migration\AbstractMigration;

class AddDomainToSliders extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SHOW COLUMNS FROM `ps_products_descriptionsFiles` LIKE 'domainID'");

        if( !$row ) {
            $this->query("ALTER TABLE `ps_products_descriptionsFiles` ADD `domainID` INT NULL AFTER `fileID`, ADD INDEX (`domainID`);");
        }

        $bannerRow = $this->fetchRow("SHOW COLUMNS FROM `dp_homepageBanner` LIKE 'domainID'");

        if( !$bannerRow ) {
            $this->query("ALTER TABLE `dp_homepageBanner` ADD `domainID` INT NOT NULL AFTER `link`, ADD INDEX (`domainID`);");
        }

    }

    public function down()
    {
        $this->query("ALTER TABLE `dp_homepageBanner` DROP `domainID`;");
        $this->query("ALTER TABLE `ps_products_descriptionsFiles` DROP `domainID`;");
    }
}
