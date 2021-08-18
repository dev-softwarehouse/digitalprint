<?php
/**
 * Description of DeliveryName
 *
 * @author Jay Momnang
 */

namespace DreamSoft\Models\Discount;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Core\Model;
use PDO;

/**
 * Class DiscountGroup
 * @package DreamSoft\Models\Discount
 * @return
 */
class DiscountGroup extends Model
{

    protected $discountGroupLangs;
    /**
     * @var int
     */
    private $domainID;

    /**
     * @var LangFilter
     */
    protected $LangFilter;

    /**
     * DiscountGroup constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('discountGroups', true);
        $this->discountGroupLangs = $this->prefix . 'discountGroupLangs';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function createName($params)
    {
        $this->setTableName($this->discountGroupLangs, false);
        return $this->create($params);
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function createObj($params)
    {
        return $this->create($params);
    }

    /**
     * @param $ID
     * @param $key
     * @param $value
     * @return bool
     */
    public function updateName($ID, $key, $value)
    {
        $this->setTableName($this->discountGroupLangs, false);
        return $this->update($ID, $key, $value);
    }

    /**
     * @param $groupID
     * @param $lang
     * @return mixed
     */
    public function existName($groupID, $lang)
    {
        $query = 'SELECT `ID` FROM ' . $this->discountGroupLangs . ' WHERE `groupID` = :groupID '
            . ' AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['groupID'] = $groupID;

        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

    /**
     * @return bool|mixed
     */
    public function getAll()
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->discountGroupLangs . '`.lang, `' . $this->discountGroupLangs . '`.name) SEPARATOR "||" ) as langs 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->discountGroupLangs . '` ON `' . $this->discountGroupLangs . '`.groupID = `' . $this->getTableName() . '`.ID '
            . ' WHERE 1 = 1 ';

        $binds['domainID'] = $this->getDomainID();

        $query .= ' AND `' . $this->getTableName() . '`.`domainID` = :domainID ';

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID  ORDER BY `' . $this->getTableName() . '`.`ID` ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $res = $this->LangFilter->splitArray($res, 'langs');
        return $res;

    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function getOne($ID)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, `' . $this->getTableName() . '`.ID as groupID,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->discountGroupLangs . '`.lang, `' . $this->discountGroupLangs . '`.name) SEPARATOR "||" ) as langs 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->discountGroupLangs . '` ON `' . $this->discountGroupLangs . '`.groupID = `' . $this->getTableName() . '`.ID '
            . ' WHERE `' . $this->getTableName() . '`.ID = :ID ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getRow(PDO::FETCH_ASSOC);

        $res = $this->LangFilter->splitOne($res, 'langs');
        return $res;

    }
}
