<?php


use Phinx\Migration\AbstractMigration;

class AddActionDeleteAddress extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'address' 
            AND `controller` = 'Addresses' AND `action` = 'delete_address' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'address',
                    'controller' => 'Addresses',
                    'action' => 'delete_address',
                    'default' => 1
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }


    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'address'  
            AND `controller` = 'Addresses' AND `action` = 'delete_address'");
    }
}
