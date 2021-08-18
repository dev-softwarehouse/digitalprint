<?php


use Phinx\Migration\AbstractMigration;

class AddOptionDescriptions extends AbstractMigration
{

    public function up()
    {
        $this->query("create table ps_config_option_description_type
(
    `ID`  int auto_increment primary key ,
    `name`  char(40),
    `group` enum ('standard', 'paper', 'print'),
    `editor` enum ('default', 'textarea'),
    unique key (`name`, `group`)
);");
        $this->query('create table ps_config_option_description
(
    `optionDescriptionTypeID`      int references ps_config_option_description_type (`ID`),
    `value`    text,
    `attributeID`    int references ps_config_attributes(ID),
    `optionID`   int references ps_config_options(ID),
    `domainID` int not null references dp_domains (ID)
);');
        $this->query("insert into ps_config_option_description_type (`name`,`group`,`editor`) values
('manufacturer','standard', 'default'),
('producentCode','standard', 'default'),
('supplier','standard', 'default'),
('supplierCode','standard', 'default'),
('theContractor','standard', 'default'),
('contractorCode','standard', 'default'),
('printingHouseCode','standard', 'default'),
('colour','standard', 'default'),
('minimumSizeOfTheGraphic','standard', 'default'),
('maximumSizeOfTheGraphic','standard', 'default'),
('minimumDistanceOfTheLinesInTheGraphic','standard', 'default'),
('type','standard', 'default'),
('minimumDistanceBetweenItemsInTheGraphic','standard', 'default'),
('deviationsFromTheNorm','standard', 'default'),
('materials','standard', 'default'),
('minimumPurchaseQuantity','standard', 'default'),
('maximumSheetSize','standard', 'default'),
('minimumSheetFormat','standard', 'default'),
('maximumMachiningArea','standard', 'default'),
('matrixType','standard', 'default'),
('maximumBasisWeight','standard', 'default'),
('minimumMasisWeightOfTheSubstrate','standard', 'default'),
('finishingAndProcessing','standard', 'textarea'),
('recommendations','standard', 'textarea'),
('properties','standard', 'textarea'),
('characteristic','standard', 'textarea'),
('application','standard', 'textarea'),
('certificates','standard', 'default'),
('notes_1','standard', 'default'),
('notes_2','standard', 'default'),
('manufacturer','paper', 'default'),
('producentCode','paper', 'default'),
('category','paper', 'default'),
('group','paper', 'default'),
('supplier','paper', 'default'),
('supplierCode','paper', 'default'),
('minimumPurchase','paper', 'default'),
('printingHouseCode','paper', 'default'),
('type','paper', 'default'),
('surface','paper', 'default'),
('whiteness','paper', 'default'),
('stiffness','paper', 'default'),
('roughness','paper', 'default'),
('colorOfThePaper','paper', 'default'),
('opacity','paper', 'default'),
('strength','paper', 'default'),
('dimensionalStability','paper', 'default'),
('degreeOfGluing','paper', 'default'),
('tendencyToDust','paper', 'default'),
('glossOfPaper','paper', 'default'),
('smoothnessRoughness','paper', 'default'),
('volume','paper', 'default'),
('Printability','paper', 'default'),
('Printability1','paper', 'default'),
('printingTechniques','paper', 'default'),
('finishingAndProcessing','paper', 'textarea'),
('recommendations','paper', 'textarea'),
('properties','paper', 'textarea'),
('characteristic','paper', 'textarea'),
('application','paper', 'textarea'),
('certificates','paper', 'default'),
('Notes1','paper', 'default'),
('Notes2','paper', 'default'),
('recommendations','print', 'textarea'),
('properties','print', 'textarea'),
('characteristic','print', 'textarea'),
('application','print', 'textarea'),
('certificates','print', 'default'),
('Notes1','print', 'default'),
('Notes2','print', 'default');");
    }
    public function down()
    {
        $this->query('drop table if exists ps_config_option_description;');
        $this->query('drop table if exists ps_config_option_description_type;');
    }
}
