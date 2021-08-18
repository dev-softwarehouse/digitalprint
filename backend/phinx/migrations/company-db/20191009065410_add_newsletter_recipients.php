<?php


use Phinx\Migration\AbstractMigration;

class AddNewsletterRecipients extends AbstractMigration
{
    public function up()
    {
        $exists = $this->hasTable('dp_newsletterRecipients');
        if (!$exists) {
            $result = $this->query("CREATE TABLE IF NOT EXISTS `dp_newsletterRecipients` (
                          `ID` int(11) NOT NULL AUTO_INCREMENT,
                          `email` varchar(255) NOT NULL,
                          `agreement` tinyint(1) NOT NULL DEFAULT '0',
                          `domainID` int(11) NOT NULL,
                          `created` datetime NOT NULL,
                          `modified` datetime NOT NULL,
                          PRIMARY KEY (`ID`),
                          UNIQUE KEY `email` (`email`,`domainID`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
                        ");
            if($result) {
                echo ' == Wykonano dodanie tabeli';
            }
        }
    }

    public function down()
    {
        $exists = $this->hasTable('dp_newsletterRecipients');
        if($exists) {
            $this->query("DROP TABLE `dp_newsletterRecipients`;");
        }
    }

}
