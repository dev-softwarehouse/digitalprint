<?php


use Phinx\Migration\AbstractMigration;

class ChangeReclamationPackage extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $this->query("UPDATE `dp_permissions` SET `package`= 'Reclamations' WHERE `package` = 'reclamations'");
    }

    public function down()
    {
        $this->query("UPDATE `dp_permissions` SET `package`= 'reclamations' WHERE `package` = 'Reclamations'");
    }
}
