<?php


use Phinx\Migration\AbstractMigration;

class AddPriceTypeSingleSheetCount extends AbstractMigration
{
    public function up()
    {

        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `ps_config_priceTypes` WHERE `function` = 'every_sheet_separate' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'name' => 'Przeloty (każdy arkusz osobno)',
                    'function' => 'every_sheet_separate'
                ]
            ];

            $this->table('ps_config_priceTypes')->insert($rows)->save();
        }


    }

    public function down()
    {

        $this->query("DELETE FROM `ps_config_priceTypes` WHERE `function` = 'every_sheet_separate'");

    }
}
