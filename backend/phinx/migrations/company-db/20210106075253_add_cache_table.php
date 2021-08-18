<?php


use Phinx\Migration\AbstractMigration;

class AddCacheTable extends AbstractMigration
{
    public function up()
    {
        $this->query('create table dp_cache(`ID` char(255) primary key, `content` longtext) ENGINE=InnoDB;');
    }

    public function down()
    {
        $this->query('drop table dp_cache;');
    }

}
