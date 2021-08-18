<?php
/**
 * Programmer Rafał Leśniak - 31.8.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-08-2017
 * Time: 11:16
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Core\Model;
use PDO;


/**
 * Class ReclamationFault
 * @package DreamSoft\Models\Reclamation
 */
class ReclamationFault extends Model
{
    protected $reclamationFaultDescription;
    /**
     * @var LangFilter
     */
    protected $LangFilter;

    /**
     * ReclamationFault constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('reclamationFaults', true);
        $this->reclamationFaultDescription = $this->prefix . 'reclamationFaultDescriptions';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->reclamationFaultDescription . '`.lang, `' . $this->reclamationFaultDescription . '`.description) SEPARATOR "||" ) as descriptions 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->reclamationFaultDescription . '` ON `' . $this->reclamationFaultDescription . '`.faultID = `' . $this->getTableName() . '`.ID '
            . ' WHERE 1 = 1 ';

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID  ORDER BY `' . $this->getTableName() . '`.`ID` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $res = $this->LangFilter->splitArray($res, 'descriptions');
        if( !$res ) {
            return false;
        }

        return $res;
    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function getOne($ID)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, `' . $this->reclamationFaultDescription . '`.faultID ,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->reclamationFaultDescription . '`.lang, `' . $this->reclamationFaultDescription . '`.description) SEPARATOR "||" ) as descriptions 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->reclamationFaultDescription . '` ON `' . $this->reclamationFaultDescription . '`.faultID = `' . $this->getTableName() . '`.ID '
            . ' WHERE `' . $this->getTableName() . '`.ID = :ID ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getRow(PDO::FETCH_ASSOC);

        $res = $this->LangFilter->splitOne($res, 'descriptions');
        return $res;

    }
}