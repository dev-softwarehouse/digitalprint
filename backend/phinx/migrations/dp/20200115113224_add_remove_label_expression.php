<?php


use Phinx\Migration\AbstractMigration;

class AddRemoveLabelExpression extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'remove_address_label' ) as rowExist");

        if ($row['rowExist'] == 0) {
            $rows = [
                [
                    'key' => 'remove_address_label',
                    'value' => 'Remove address label',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'remove_address_label',
                    'value' => 'Usuń etykietę adresową',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'remove_address_label',
                    'value' => 'удалить метку адреса',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'remove_address_label'");
    }
}
