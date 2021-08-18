<?php


use Phinx\Migration\AbstractMigration;

class AddLangExpressions extends AbstractMigration
{
    public function up()
    {

        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'copy_product' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'copy_product',
                    'value' => 'Skopiuj produkt',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'copy_product',
                    'value' => 'Copy product',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }

    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'copy_product'");
    }
}
