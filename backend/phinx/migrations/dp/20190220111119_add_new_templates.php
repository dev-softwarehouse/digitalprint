<?php


use Phinx\Migration\AbstractMigration;

class AddNewTemplates extends AbstractMigration
{
    protected $templates = [
        'header-in-cart',
        'footer-in-calc',
        'footer-in-cart'
    ];
    /**
     *
     */
    public function up()
    {
        foreach($this->templates as $templateName) {

            $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_templates` WHERE `name` = '$templateName' ) as rowExist");

            if( $row['rowExist'] == 0 ) {
                $rows = [
                    [
                        'name' => $templateName,
                        'fileName' => $templateName,
                        'created' => date('Y-m-d H:i:s')
                    ]
                ];

                $this->table('dp_templates')->insert($rows)->save();
            }

        }
    }

    public function down()
    {
        foreach($this->templates as $templateName) {
            $this->query("DELETE FROM `dp_templates` WHERE `name` = '$templateName'");
        }
    }
}
