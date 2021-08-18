<?php


use Phinx\Migration\AbstractMigration;

class AddNewPriceType extends AbstractMigration
{
    public function up()
    {

        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `ps_config_priceTypes` WHERE `function` = 'net_perimeter' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'name' => 'obwód netto w metrach',
                    'function' => 'net_perimeter'
                ]
            ];

            $this->table('ps_config_priceTypes')->insert($rows)->save();
        }


    }

    public function down()
    {

        $this->query("DELETE FROM `ps_config_priceTypes` WHERE `function` = 'net_perimeter'");

    }
}
