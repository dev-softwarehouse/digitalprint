<?php


use Phinx\Migration\AbstractMigration;

class SubscriptionAgreementInfoExpression extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'subscription_to_newsletter_agreement_info' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'key' => 'subscription_to_newsletter_agreement_info',
                    'value' => 'Subscription to the newsletter requires the consent to data processing',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'subscription_to_newsletter_agreement_info',
                    'value' => 'Zapis do newslettera wymaga zgody na przetwarzanie danych',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'subscription_to_newsletter_agreement_info',
                    'value' => 'Подписка на рассылку требует согласия на обработку данных',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'subscription_to_newsletter_agreement_info'");
    }
}
