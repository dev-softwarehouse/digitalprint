<?php


use Phinx\Migration\AbstractMigration;

class CalculationAvailability extends AbstractMigration
{

    public function up()
    {
        $this->query('alter table ps_config_options add column authorizedOnlyCalculation int not null default 0');
    }
    public function down()
    {
        $this->query('alter table ps_config_options drop column authorizedOnlyCalculation');
    }
}
