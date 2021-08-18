<?php


use Phinx\Migration\AbstractMigration;

class AddMailType extends AbstractMigration
{

    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_mail_types` WHERE `key` = 'newsletterConfirm' ) as rowExist");

        if ($row['rowExist'] == 0) {

            $builder = $this->getQueryBuilder();
            $st = $builder
                ->insert(['key', 'hidden'])
                ->into('dp_mail_types')
                ->values(['key' => 'newsletterConfirm', 'hidden' => 0])
                ->execute();

            $lastMailTypeID = $st->lastInsertId('dp_mail_types', 'ID');

            $rowLanguages = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_mail_typeLangs` WHERE `mailTypeID` = ". $lastMailTypeID ." ) as rowExist");

            if($rowLanguages['rowExist'] == 0) {
                $rows = [
                    [
                        'name' => 'Mail z potwierdzeniem newslettera',
                        'mailTypeID' => $lastMailTypeID,
                        'lang' => 'pl'
                    ],
                    [
                        'name' => 'Newsletter confirmation email',
                        'mailTypeID' => $lastMailTypeID,
                        'lang' => 'en'
                    ],
                ];

                $this->table('dp_mail_typeLangs')->insert($rows)->save();

            }

            $rowVariables = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_mail_variables` WHERE `mailTypeID` = ". $lastMailTypeID ." ) as rowExist");

            $lastMailVariableID = false;

            if( $rowVariables['rowExist'] == 0 ) {

                $builderVariable = $this->getQueryBuilder();
                $stVariable = $builderVariable
                    ->insert(['mailTypeID', 'variable'])
                    ->into('dp_mail_variables')
                    ->values(['mailTypeID' => $lastMailTypeID, 'variable' => 'confirm_url'])
                    ->execute();

                $lastMailVariableID = $stVariable->lastInsertId('dp_mail_variables', 'ID');

            }

            $rowVariableLanguages = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_mail_variableLangs` WHERE `variableID` = ". $lastMailVariableID ." ) as rowExist");

            if( $rowVariableLanguages['rowExist'] == 0 && $lastMailVariableID ) {

                $rows = [
                    [
                        'desc' => 'Link do potwierdzenia',
                        'variableID' => $lastMailVariableID,
                        'lang' => 'pl'
                    ],
                    [
                        'desc' => 'Link to confirm',
                        'variableID' => $lastMailVariableID,
                        'lang' => 'en'
                    ],
                ];

                $this->table('dp_mail_variableLangs')->insert($rows)->save();

            }
        }
    }

    public function down()
    {
        $row = $this->fetchRow("SELECT * FROM `dp_mail_types` WHERE `key` = 'newsletterConfirm' ");

        $this->query("DELETE FROM `dp_mail_types` WHERE `key` = 'newsletterConfirm' ");

        if($row) {
            $this->query("DELETE FROM `dp_mail_typeLangs` WHERE `mailTypeID` = ". $row['ID'] ." ");

            $rowVariable = $this->fetchRow("SELECT * FROM `dp_mail_variables` WHERE `mailTypeID` = ". $row['ID'] ." ");

            if( $rowVariable ) {
                $this->query("DELETE FROM `dp_mail_variables` WHERE `mailTypeID` = ". $row['ID'] ." ");

                $this->query("DELETE FROM `dp_mail_variableLangs` WHERE `variableID` = ". $rowVariable['ID'] ." ");
            }
        }


    }
}
