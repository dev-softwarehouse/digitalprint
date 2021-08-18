<?php


use Phinx\Migration\AbstractMigration;

class AddConfirmChangeExpression extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'confirm_change' ) as rowExist");

        if ($row['rowExist'] == 0) {
            $rows = [
                [
                    'key' => 'confirm_change',
                    'value' => 'Confirm change',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'confirm_change',
                    'value' => 'Zatwierdź zmianę',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'confirm_change',
                    'value' => 'подтвердить изменение',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'confirm_change'");
    }
}
