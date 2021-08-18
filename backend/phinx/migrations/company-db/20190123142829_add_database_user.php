<?php


use Phinx\Migration\AbstractMigration;

class AddDatabaseUser extends AbstractMigration
{
    /**
     *
     */
    public function up()
    {

        $row = $this->fetchRow('SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = \''. getenv('PRINTING_HOUSE_DB_USER') .'\') as userExist');

        if( $row['userExist'] == 0 ) {
            $this->query('
            CREATE USER \''.getenv('PRINTING_HOUSE_DB_USER').'\'@\'%\' IDENTIFIED BY \''.getenv('PRINTING_HOUSE_DB_PASSWORD').'\';
            GRANT USAGE ON *.* TO \''. getenv('PRINTING_HOUSE_DB_USER') .'\'@\'%\';
            GRANT SELECT, INSERT, UPDATE, DELETE ON `'.getenv('PRINTING_HOUSE_DB_NAME').'`.* TO \''. getenv('PRINTING_HOUSE_DB_USER') .'\'@\'%\';
            ');
        }
    }

}
