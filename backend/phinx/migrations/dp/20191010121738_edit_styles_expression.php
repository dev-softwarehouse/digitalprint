<?php


use Phinx\Migration\AbstractMigration;

class EditStylesExpression extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'edit_styles' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'edit_styles',
                    'value' => 'Edit styles',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'edit_styles',
                    'value' => 'Edytuj style',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'edit_styles',
                    'value' => 'Редактировать стили',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'edit_styles' ");
    }
}
