<?php


use Phinx\Migration\AbstractMigration;

class AlterUsersAddCountryCode extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SHOW COLUMNS FROM `users` LIKE 'countryCode'");

        if (!$row) {
            $this->query("ALTER TABLE `users` ADD `countryCode` VARCHAR(3) NULL DEFAULT 'PL' AFTER `domainID`;");
        }
    }

    public function down()
    {
        $this->query("ALTER TABLE `users` DROP `countryCode`;");
    }
}
