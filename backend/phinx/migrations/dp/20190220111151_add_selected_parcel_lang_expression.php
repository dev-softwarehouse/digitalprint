<?php


use Phinx\Migration\AbstractMigration;

class AddSelectedParcelLangExpression extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'selected_parcel_shop' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'selected_parcel_shop',
                    'value' => 'Selected parcel shop',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'selected_parcel_shop',
                    'value' => 'Wybrany paczkomat',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'selected_parcel_shop',
                    'value' => 'выбранный пункт обработки отправлений',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'selected_parcel_shop'");
    }

}
