<?php


use Phinx\Migration\AbstractMigration;

class ChangeProductFormat extends AbstractMigration
{

    public function up()
    {
        $this->query('alter table ps_products_formats
add column netWidth int null,
add column netHeight int null,
add column slopeExternalFront int null,
add column slopeExternalBack int null,
add column slopeExternalTop int null,
add column slopeExternalBottom int null,
add column addRidgeThickness tinyint(1) default 0 not null,
add column wingtipFront int null,
add column wingtipFrontMin int null,
add column wingtipBack int null,
add column wingtipBackMin int null,
add column maximumTotalGrossWidth int null;');
    }
    public function down()
    {
        $this->query('alter table ps_products_formats
    drop column netWidth,
    drop column netHeight,
    drop column slopeExternalFront,
    drop column slopeExternalBack,
    drop column slopeExternalTop,
    drop column slopeExternalBottom,
    drop column addRidgeThickness,
    drop column wingtipFront,
    drop column wingtipFrontMin,
    drop column wingtipBack,
    drop column wingtipBackMin,
    drop column maximumTotalGrossWidth;');
    }
}
