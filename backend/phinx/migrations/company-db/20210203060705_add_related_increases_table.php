<?php


use Phinx\Migration\AbstractMigration;

class AddRelatedIncreasesTable extends AbstractMigration
{

    public function up()
    {
        $this->query('CREATE TABLE ps_config_related_increases(
            attrID INT NOT NULL,
            optID INT NULL, 
            controllerID INT NULL, 
            attrIDRelated INT NOT NULL,
            optIDRelated INT NULL,
            controllerIDRelated INT NULL,
            relatedTypeID INT NOT NULL ,
            UNIQUE INDEX(attrID,optID,controllerID),
            INDEX(attrIDRelated,optIDRelated,controllerIDRelated));');
    }
    public function down()
    {
        $this->query('DROP TABLE ps_config_related_increases;');
    }
}
