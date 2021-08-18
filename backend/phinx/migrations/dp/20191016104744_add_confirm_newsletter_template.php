<?php


use Phinx\Migration\AbstractMigration;

class AddConfirmNewsletterTemplate extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_templates` WHERE `name` = 'confirm-newsletter' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'name' => 'confirm-newsletter',
                    'fileName' => 'confirm-newsletter',
                    'created' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_templates')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_templates` WHERE `name` = 'confirm-newsletter'");
    }
}
