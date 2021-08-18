<?php


use Phinx\Migration\AbstractMigration;

class ActiveTypesPublicAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'printshop' 
            AND `controller` = 'Types' AND `action` = 'getActiveTypesPublic' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'printshop',
                    'controller' => 'Types',
                    'action' => 'getActiveTypesPublic',
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
            AND `controller` = 'Types' AND `action` = 'getActiveTypesPublic'");
    }
}
