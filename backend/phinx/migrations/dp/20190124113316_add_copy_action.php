<?php


use Phinx\Migration\AbstractMigration;

class AddCopyAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'Orders' 
            AND `controller` = 'DpProducts' AND `action` = 'patch_copy' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'Orders',
                    'controller' => 'DpProducts',
                    'action' => 'patch_copy',
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
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'Orders' 
            AND `controller` = 'DpProducts' AND `action` = 'patch_copy'");
    }
}
