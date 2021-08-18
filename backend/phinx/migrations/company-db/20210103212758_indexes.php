<?php


use Phinx\Migration\AbstractMigration;

class Indexes extends AbstractMigration
{
    public function up()
    {
        $this->query("alter table ps_config_attributes add index `type` (`type`);
                            alter table ps_config_attributes add index `rangeID` (`rangeID`);
                            alter table ps_products_volumes add index `groupID-typeID` (`typeID`,`groupID`);
                            alter table ps_products_increases add index `groupID-typeID-formatID` (`typeID`,`groupID`,`formatID`);
                            alter table dp_settings add index `module-key-domainID-lang` (`module`,`key`,`domainID`,`lang`);
                            alter table ps_products_pages add index `groupID-typeID` (`groupID`,`typeID`);
                            alter table ps_products_realizationTimeLangs add index `realizationTimeID` (`realizationTimeID`);
                            alter table ps_products_printTypes add index `printTypeID` (`printTypeID`);
                            alter table ps_config_printTypes add index `pricelistID` (`pricelistID`);
                            alter table ps_products_formatLangs add index `lang-name` (`lang`,`name`);
                            alter table ps_products_formatLangs add index `formatID` (`formatID`);
                            alter table ps_config_printTypeWorkspaces add index `workspaceID` (`workspaceID`);
                            alter table ps_config_printTypeWorkspaces add index `printTypeID` (`printTypeID`);
                            alter table ps_config_optionRealizationTime add index `optionID` (`optionID`);
                            alter table dp.dp_permissions add index `action-controller-package` (`action`,`controller`,`package`);
                            alter table ps_products_formatVolumes add index `volumeID` (`volumeID`);
                            alter table ps_promotions add index `complex1` (`productGroupID`,`productFormatID`,`domainID`,`active`);
                            alter table ps_config_increases add index `complex1` (`increaseType`,`attrID`,`optID`);
                            alter table ps_config_increases add index `increaseType` (`increaseType`);
                            alter table ps_config_connectPrices add index `connectOptionID` (`connectOptionID`);");
    }

    public function down()
    {
        $this->query("alter table ps_config_attributes drop index `type`;
                            alter table ps_config_attributes drop index `rangeID`;
                            alter table ps_products_volumes drop index `groupID-typeID`;
                            alter table ps_products_increases drop index `groupID-typeID-formatID`;
                            alter table dp_settings drop index `module-key-domainID-lang`;
                            alter table ps_products_pages drop index `groupID-typeID`;
                            alter table ps_products_realizationTimeLangs drop index `realizationTimeID`;
                            alter table ps_products_printTypes drop index `printTypeID`;
                            alter table ps_config_printTypes drop index `pricelistID`;
                            alter table ps_products_formatLangs drop index `lang-name`;
                            alter table ps_products_formatLangs drop index `formatID`;
                            alter table ps_config_printTypeWorkspaces drop index `workspaceID`;
                            alter table ps_config_printTypeWorkspaces drop index `printTypeID`;
                            alter table ps_config_optionRealizationTime drop index `optionID`;
                            alter table dp.dp_permissions drop index `action-controller-package`;
                            alter table ps_products_formatVolumes drop index `volumeID`;
                            alter table ps_promotions drop index `complex1`;
                            alter table ps_config_increases drop index `complex1`;
                            alter table ps_config_increases drop index `increaseType`;
                            alter table ps_config_connectPrices drop index `connectOptionID`;");
    }
}
