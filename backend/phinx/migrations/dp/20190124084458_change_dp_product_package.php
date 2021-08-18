<?php


use Phinx\Migration\AbstractMigration;

class ChangeDpProductPackage extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $this->query("UPDATE `dp_permissions` SET `package`= 'Orders' WHERE `controller` = 'DpProducts'");
    }

    public function down()
    {
        $this->query("UPDATE `dp_permissions` SET `package`= 'orders' WHERE `controller` = 'DpProducts'");
    }

}
