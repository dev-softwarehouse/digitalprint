<?php


use Phinx\Migration\AbstractMigration;

class AddNewConfirmButtonExpression extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'additional_confirm_button_in_cart' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'additional_confirm_button_in_cart',
                    'value' => 'Additional confirm button in cart',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'additional_confirm_button_in_cart',
                    'value' => 'Dodatkowy przyciski zatwierdzenia w koszyku',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'additional_confirm_button_in_cart',
                    'value' => 'Дополнительная кнопка подтверждения в корзине',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'additional_confirm_button_in_cart'");
    }
}
