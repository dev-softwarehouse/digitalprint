<?php


use Phinx\Migration\AbstractMigration;

class AddRootTemplate extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_templates` WHERE `name` = 'copy-product-modal' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'name' => 'copy-product-modal',
                    'fileName' => 'copy-product-modal',
                    'created' => date(getenv('DATE_FORMAT'))
                ]
            ];

            $this->table('dp_templates')->insert($rows)->save();
        }
    }

    /**
     *
     */
    public function down()
    {
        $this->query("DELETE FROM `dp_templates` WHERE `name` = 'copy-product-modal' ");
    }
}
