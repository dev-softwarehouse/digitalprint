<?php


use Phinx\Migration\AbstractMigration;

class AddCalculationIndexes extends AbstractMigration
{
    public function up()
    {
        $this->query("alter table ps_products_increases add index `groupID-typeID-formatID-type` (`typeID`,`groupID`,`formatID`,`type`);
                            alter table ps_config_increases add index `controllerID-attrID-optID` (`controllerID`,`attrID`,`optID`);
                            alter table ps_config_increases add index `increaseType` (`increaseType`);");
    }

    public function down()
    {
        $this->query("alter table ps_products_increases drop index `groupID-typeID-formatID-type`;
                            alter table ps_config_increases drop index `controllerID-attrID-optID`;
                            alter table ps_config_increases drop index `increaseType`;");
    }
}
