<?php


use Phinx\Migration\AbstractMigration;

class MainFileAction extends AbstractMigration
{
    private $actions = array('mainFile', 'post_mainFile');


    public function up()
    {

        foreach($this->actions as $action) {

            $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'Contents' 
            AND `controller` = 'Styles' AND `action` = '" . $action . "' ) as rowExist");

            if( $row['rowExist'] == 0 ) {
                $rows = [
                    [
                        'desc' => NULL,
                        'package' => 'Contents',
                        'controller' => 'Styles',
                        'action' => $action,
                        'default' => ($action === 'mainFile') ? 1 : 0
                    ]
                ];

                $this->table('dp_permissions')->insert($rows)->save();
            }

        }


    }

    /**
     *
     */
    public function down()
    {
        foreach($this->actions as $action) {
            $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'Contents' 
            AND `controller` = 'Styles' AND `action` = '" . $action . "' ");
        }

    }
}
