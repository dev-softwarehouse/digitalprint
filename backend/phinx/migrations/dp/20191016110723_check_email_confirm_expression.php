<?php


use Phinx\Migration\AbstractMigration;

class CheckEmailConfirmExpression extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'check_email_to_confirm_newsletter' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'check_email_to_confirm_newsletter',
                    'value' => 'Check your email to confirm your subscription to the newsletter',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'check_email_to_confirm_newsletter',
                    'value' => 'Sprawdź swoją pocztę email, aby potwierdzić zapis do newslettera',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'check_email_to_confirm_newsletter',
                    'value' => 'Проверьте свою электронную почту, чтобы подтвердить свою подписку на рассылку',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'check_email_to_confirm_newsletter'");
    }
}
