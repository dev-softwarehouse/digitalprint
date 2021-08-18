<?php


use Phinx\Migration\AbstractMigration;

class AddNameConfigPaymentContents extends AbstractMigration
{
    public function up()
    {
        $this->query("alter table dp_config_paymentContents add column name varchar(255) after ID");
    }


    public function down()
    {
        $this->query("alter table dp_config_paymentContents drop column name");
    }
}
