<?php


use Phinx\Migration\AbstractMigration;

class AddActionGetImportantData extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` IS NULL 
            AND `controller` = 'Users' AND `action` = 'importantData' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => NULL,
                    'controller' => 'Users',
                    'action' => 'importantData',
                    'default' => 1
                ],
                [
                    'desc' => NULL,
                    'package' => NULL,
                    'controller' => 'Users',
                    'action' => 'patch_importantData',
                    'default' => 1
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }


    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` IS NULL  
            AND `controller` = 'Users' AND `action` = 'importantData'");
        $this->query("DELETE FROM `dp_permissions` WHERE `package` IS NULL  
            AND `controller` = 'Users' AND `action` = 'patch_importantData'");
    }
}
