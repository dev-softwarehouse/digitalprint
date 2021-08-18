<?php


use Phinx\Migration\AbstractMigration;

class AddGenerateRoutesFile extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` IS NULL 
            AND `controller` = 'Routes' AND `action` = 'index' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => NULL,
                    'controller' => 'Routes',
                    'action' => 'generateRoutesFile',
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
        $this->query("DELETE FROM `dp_permissions` WHERE `package` IS NULL  
            AND `controller` = 'Routes' AND `action` = 'generateRoutesFile'");
    }
}
