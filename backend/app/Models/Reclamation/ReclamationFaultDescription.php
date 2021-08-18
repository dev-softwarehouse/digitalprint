<?php
/**
 * Programmer Rafał Leśniak - 31.8.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-08-2017
 * Time: 11:18
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Core\Model;

/**
 * Class ReclamationFaultDescription
 * @package DreamSoft\Models\Reclamation
 */
class ReclamationFaultDescription extends Model
{
    /**
     * ReclamationFaultDescription constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName( 'reclamationFaultDescriptions', true );
    }

    public function checkExist($faultID, $lang)
    {
        $query = 'SELECT `ID` FROM '.$this->getTableName().' WHERE `faultID` = :faultID '
            . ' AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['faultID'] = $faultID;

        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

}