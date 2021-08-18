<?php


use Phinx\Migration\AbstractMigration;

class CalculateAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'Calculate' 
            AND `controller` = 'Calculate' AND `action` = 'index' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'Calculate',
                    'controller' => 'Calculate',
                    'action' => 'index',
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
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'Calculate' 
            AND `controller` = 'Calculate' AND `action` = 'index'");
    }
}
