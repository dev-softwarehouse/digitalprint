<?php


use Phinx\Migration\AbstractMigration;

class AddConfirmEmailAction extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'config' 
            AND `controller` = 'Settings' AND `action` = 'post_confirmNewsletter' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'config',
                    'controller' => 'Settings',
                    'action' => 'post_confirmNewsletter',
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
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'config' 
            AND `controller` = 'Settings' AND `action` = 'post_confirmNewsletter'");
    }

}
