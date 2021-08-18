<?php


use Phinx\Migration\AbstractMigration;

class AddPriceTypes extends AbstractMigration
{
    protected $priceTypes = [
        'amount_patterns_sum' => 'Ilość wzorów (suma)',
        'amount_patterns_value' => 'Ilość wzorów (wartość)',
    ];

    public function up()
    {
        foreach($this->priceTypes as $function => $priceType) {

            $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `ps_config_priceTypes` WHERE `function` = '$function' ) as rowExist");

            if( $row['rowExist'] == 0 ) {
                $rows = [
                    [
                        'name' => $priceType,
                        'function' => $function
                    ]
                ];

                $this->table('ps_config_priceTypes')->insert($rows)->save();
            }

        }
    }

    public function down()
    {
        foreach($this->priceTypes as $function => $priceType) {
            $this->query("DELETE FROM `ps_config_priceTypes` WHERE `function` = '$function'");
        }
    }
}
