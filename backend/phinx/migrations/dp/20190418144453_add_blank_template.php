<?php


use Phinx\Migration\AbstractMigration;

class AddBlankTemplate extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_templates` WHERE `name` = '404' ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $rows = [
                [
                    'name' => '404',
                    'fileName' => '404',
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
        $this->query("DELETE FROM `dp_templates` WHERE `name` = '404' ");
    }
}
