<?php


use Phinx\Migration\AbstractMigration;

class AddGenerateSitemapExpression extends AbstractMigration
{
    public function up()
    {
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `dp_langs` WHERE `key` = 'generate_sitemap' ) as rowExist");

        if ($row['rowExist'] == 0) {
            $rows = [
                [
                    'key' => 'generate_sitemap',
                    'value' => 'Generate sitemap',
                    'lang' => 'en',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'generate_sitemap',
                    'value' => 'Generuj mapę strony',
                    'lang' => 'pl',
                    'create' => date('Y-m-d H:i:s')
                ],
                [
                    'key' => 'generate_sitemap',
                    'value' => 'Создать карту сайта',
                    'lang' => 'ru',
                    'create' => date('Y-m-d H:i:s')
                ]
            ];

            $this->table('dp_langs')->insert($rows)->save();
        }
    }

    public function down()
    {
        $this->query("DELETE FROM `dp_langs` WHERE `key` = 'generate_sitemap'");
    }
}
