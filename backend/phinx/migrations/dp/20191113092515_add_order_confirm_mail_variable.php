<?php


use Phinx\Migration\AbstractMigration;

class AddOrderConfirmMailVariable extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_mail_variables` WHERE `variable` = 'payment_info' ) as rowExist");

        $mailType = $this->fetchRow("SELECT `ID` FROM `dp_mail_types` WHERE `key` = 'orderConfirm'");

        if ($row['rowExist'] == 0 && $mailType['ID'] > 0) {

            $builder = $this->getQueryBuilder();
            $st = $builder
                ->insert(['variable', 'mailTypeID'])
                ->into('dp_mail_variables')
                ->values([
                    'variable' => 'payment_info',
                    'mailTypeID' => $mailType['ID'],
                ])
                ->execute();

            $lastInsertVariableID = $st->lastInsertId('dp_mail_types', 'ID');

            if( $lastInsertVariableID > 0 ) {

                if( $row['rowExist'] == 0 ) {
                    $rows = [
                        [
                            'variableID' => $lastInsertVariableID,
                            'desc' => 'Informacja o płatności',
                            'lang' => 'pl'
                        ],
                        [
                            'variableID' => $lastInsertVariableID,
                            'desc' => 'Payment info',
                            'lang' => 'en'
                        ],
                        [
                            'variableID' => $lastInsertVariableID,
                            'desc' => 'Информация об оплате',
                            'lang' => 'ru'
                        ]
                    ];

                    $this->table('dp_mail_variableLangs')->insert($rows)->save();
                }
            }
        }

    }

    public function down()
    {
        $row = $this->fetchRow("SELECT * FROM `dp_mail_types` WHERE `key` = 'orderConfirm' ");

        if($row) {
            $rowVariable = $this->fetchRow("SELECT `ID` FROM `dp_mail_variables` WHERE `variable` = 'payment_info' ");

            if( $rowVariable ) {
                $this->query("DELETE FROM `dp_mail_variables` WHERE `ID` = ". $rowVariable['ID'] ." ");
                $this->query("DELETE FROM `dp_mail_variableLangs` WHERE `variableID` = ". $rowVariable['ID'] ." ");
            }
        }
    }
}
