<?php


use Phinx\Migration\AbstractMigration;

class RoutesChanges extends AbstractMigration
{
    public function up()
    {
        $this->query("UPDATE `dp_permissions` SET `package`= 'Route' WHERE `controller` = 'Routes'");

        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'Route' 
            AND `controller` = 'Routes' AND `action` = 'translateState' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'Route',
                    'controller' => 'Routes',
                    'action' => 'translateState',
                    'default' => 1
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'Route' 
            AND `controller` = 'Routes' AND `action` = 'translateState'");

        $this->query("UPDATE `dp_permissions` SET `package`= NULL WHERE `controller` = 'Routes'");
    }
}
