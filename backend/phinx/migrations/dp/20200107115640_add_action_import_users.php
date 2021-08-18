<?php


use Phinx\Migration\AbstractMigration;

class AddActionImportUsers extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'config' 
            AND `controller` = 'Config' AND `action` = 'post_importUsers' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'config',
                    'controller' => 'Config',
                    'action' => 'post_importUsers',
                    'default' => 0
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }


    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'config'  
            AND `controller` = 'Config' AND `action` = 'post_importUsers'");
    }
}
