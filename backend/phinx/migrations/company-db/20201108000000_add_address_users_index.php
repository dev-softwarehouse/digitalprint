<?php


use Phinx\Migration\AbstractMigration;

class AddAddressUsersIndex extends AbstractMigration
{
    public function up()
    {
        $this->query("alter table address_users add index `typeDefault` (`userID`,`type`,`default`);");
    }


    public function down()
    {
        $this->query("alter table address_users drop index `typeDefault`");
    }
}
