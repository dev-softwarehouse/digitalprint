<?php


use Phinx\Migration\AbstractMigration;

class AddSortProcessAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'ProductionPath' 
            AND `controller` = 'Processes' AND `action` = 'patch_sort' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'ProductionPath',
                    'controller' => 'Processes',
                    'action' => 'patch_sort',
                    'default' => 0
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
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'ProductionPath' 
            AND `controller` = 'Processes' AND `action` = 'patch_sort'");
    }
}
