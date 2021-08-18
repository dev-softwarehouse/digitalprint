<?php


use Phinx\Migration\AbstractMigration;

class PrintingHouseInit extends AbstractMigration
{

    /**
     * Migrate Up.
     */
    public function up()
    {
        $printingHouseID = getenv('PRINTING_HOUSE_ID');
        $row = $this->fetchRow("SELECT EXISTS(SELECT 1 FROM `users_settings` WHERE `ID` = $printingHouseID ) as rowExist");

        if( $row['rowExist'] == 0 ) {
            $singleRow = [
                'ID' => getenv('PRINTING_HOUSE_ID'),
                'database' => getenv('PRINTING_HOUSE_DB_NAME'),
                'dbpass' => getenv('PRINTING_HOUSE_DB_PASSWORD'),
                'test' => 0
            ];

            $table = $this->table('users_settings');
            $table->insert($singleRow);
            $table->saveData();
        }
    }

    /**
     * Migrate Down.
     */
    public function down()
    {

    }
}
