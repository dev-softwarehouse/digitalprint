<?php


use Phinx\Migration\AbstractMigration;

class AddGetFirstByTypeAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` IS NULL 
            AND `controller` = 'Categories' AND `action` = 'getFirstByType' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => NULL,
                    'controller' => 'Categories',
                    'action' => 'getFirstByType',
                    'default' => 1
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }

    /**
     *
     */
    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` IS NULL  
            AND `controller` = 'Categories' AND `action` = 'getFirstByType'");
    }
}
