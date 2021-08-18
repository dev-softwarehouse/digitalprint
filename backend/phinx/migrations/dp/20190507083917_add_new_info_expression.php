<?php


use Phinx\Migration\AbstractMigration;

class AddNewInfoExpression extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'languages_settings_problem' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'languages_settings_problem',
                    'value' => 'Languages settings problem',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'languages_settings_problem',
                    'value' => 'Problem z ustawieniami języków',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'languages_settings_problem',
                    'value' => 'проблема настроек языка',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'languages_settings_problem'");
    }
}
