<?php


use Phinx\Migration\AbstractMigration;

class AddUseVariables extends AbstractMigration
{

    public function up()
    {
        $this->query('alter table dp_templates add column useVariables int not null default 0;');
    }
    public function down()
    {
        $this->query('alter table dp_templates drop column useVariables;');
    }
}
