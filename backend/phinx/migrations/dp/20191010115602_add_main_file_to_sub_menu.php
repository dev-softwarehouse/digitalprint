<?php


use Phinx\Migration\AbstractMigration;

class AddMainFileToSubMenu extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` IS NULL 
            AND `controller` = 'Menu' AND `action` = 'contentsStyleEdit' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => NULL,
                    'controller' => 'Menu',
                    'action' => 'contentsStyleEdit',
                    'default' => 0
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }

        $rowSubMenu = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_subMenu` WHERE `package` IS NULL 
            AND `controller` = 'Menu' AND `action` = 'contentsStyleEdit' AND `key` = 'contents-style-edit' ) as rowExist");

        if( $rowSubMenu['rowExist'] == 0 ) {
            $subMenuRows = [
                [
                    'menuID' => 7,
                    'package' => NULL,
                    'controller' => 'Menu',
                    'action' => 'contentsStyleEdit',
                    'path' => '',
                    'title' => 'contents_style_edit',
                    'active' => 1,
                    'key' => 'contents-style-edit'
                ]
            ];

            $this->table('dp_subMenu')->insert($subMenuRows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` IS NULL 
            AND `controller` = 'Menu' AND `action` = 'contentsStyleEdit' ");

        $this->query("DELETE FROM `dp_subMenu` WHERE `package` IS NULL 
            AND `controller` = 'Menu' AND `action` = 'contentsStyleEdit' AND `key` = 'contents-style-edit' ");
    }
}
