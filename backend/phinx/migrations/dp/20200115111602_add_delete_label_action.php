<?php


use Phinx\Migration\AbstractMigration;

class AddDeleteLabelAction extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_permissions` WHERE `package` = 'orders' 
            AND `controller` = 'Shipment' AND `action` = 'delete_labels' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'desc' => NULL,
                    'package' => 'orders',
                    'controller' => 'Shipment',
                    'action' => 'delete_labels',
                    'default' => 0
                ]
            ];

            $this->table('dp_permissions')->insert($rows)->save();
        }
    }


    public function down()
    {
        $this->query("DELETE FROM `dp_permissions` WHERE `package` = 'orders'  
            AND `controller` = 'Shipment' AND `action` = 'delete_labels'");
    }
}
