<?php


use Phinx\Migration\AbstractMigration;

class ChangeRoutesToAutoload extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'address' AND `controller` = 'Addresses' ) as rowExist");

        if ($row['rowExist'] == 1) {
            $this->query("UPDATE `dp_permissions` SET `package`= 'Addresses' WHERE `controller` = 'Addresses' AND `package` = 'address'");
        }

        $rowHelps = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'admin_help' AND `controller` = 'Help' ) as rowExist");

        if($rowHelps['rowExist'] == 1) {
            $this->query("UPDATE `dp_permissions` SET `package`= 'AdminHelp' WHERE `controller` = 'Help' AND `package` = 'admin_help'");
        }

        $rowMenu = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` IS NULL AND `controller` = 'Menu' ) as rowExist");

        if($rowMenu['rowExist'] == 1) {
            $this->query("UPDATE `dp_permissions` SET `package`= 'Others' WHERE `controller` = 'Menu' AND `package` IS NULL");
        }

    }

    public function down()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'Addresses' AND `controller` = 'Addresses' ) as rowExist");

        if($row['rowExist'] == 1) {
            $this->query("UPDATE `dp_permissions` SET `package`= 'address' WHERE `controller` = 'Addresses' AND `package` = 'Addresses'");
        }

        $rowHelps = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'AdminHelp' AND `controller` = 'Help' ) as rowExist");

        if($rowHelps['rowExist'] == 1) {
            $this->query("UPDATE `dp_permissions` SET `package`= 'admin_help' WHERE `controller` = 'Help' AND `package` = 'AdminHelp'");
        }

        $rowMenu = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'Others' AND `controller` = 'Menu' ) as rowExist");

        if($rowMenu['rowExist'] == 1) {
            $this->query("UPDATE `dp_permissions` SET `package` = NULL WHERE `controller` = 'Menu' AND `package` = 'Others'");
        }
    }
}
