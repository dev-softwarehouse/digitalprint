<?php


use Phinx\Migration\AbstractMigration;

class ActiveGroupsPublicAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'printshop' 
            AND `controller` = 'ProductGroups' AND `action` = 'getActiveGroupsPublic' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'printshop',
                    'controller' => 'ProductGroups',
                    'action' => 'getActiveGroupsPublic',
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
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'printshop' 
            AND `controller` = 'ProductGroups' AND `action` = 'getActiveGroupsPublic'");
    }
}
