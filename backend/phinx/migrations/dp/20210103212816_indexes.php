<?php


use Phinx\Migration\AbstractMigration;

class Indexes extends AbstractMigration
{
    public function up()
    {
        $this->query("alter table dp_permissions add index `action-controller-package` (`action`,`controller`,`package`)");
    }

    public function down()
    {
        $this->query("alter table dp_permissions drop index `action-controller-package`;");
    }
}
