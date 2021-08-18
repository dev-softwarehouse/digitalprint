<?php


use Phinx\Migration\AbstractMigration;

class AddActionMakeMiniature extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'orders' 
            AND `controller` = 'DpProductFiles' AND `action` = 'makeMiniature' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'orders',
                    'controller' => 'DpProductFiles',
                    'action' => 'makeMiniature',
                    'default' => 1
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }


    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'orders'  
            AND `controller` = 'DpProductFiles' AND `action` = 'makeMiniature'");
    }
}
