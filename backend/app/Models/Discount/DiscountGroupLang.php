<?php
/**
 * Description of DiscountGroupLang
 *
 * @author Rafał
 */

namespace DreamSoft\Models\Discount;
use DreamSoft\Core\Model;

/**
 * Class DiscountGroupLang
 * @package DreamSoft\Models\Discount
 */
class DiscountGroupLang extends Model
{

    /**
     * DiscountGroupLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('discountGroupLangs', true);
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getNames($list)
    {
        if (empty($list)) {
            return false;
        }
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `groupID` IN (' . implode(',', $list) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $r) {
            $result[$r['groupID']][$r['lang']] = $r['name'];
        }
        return $result;
    }

    /**
     * @param $groupID
     * @return array|bool
     */
    public function getNamesForOne($groupID)
    {
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `groupID` = :groupID ';

        $binds['groupID'] = $groupID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $r) {
            $result[$r['lang']] = $r['name'];
        }
        return $result;
    }

    /**
     * @param $groupID
     * @param $lang
     * @return bool
     */
    public function getOne($groupID, $lang)
    {
        $query = ' SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `groupID` = :groupID AND `lang` = :lang ';

        $binds['groupID'] = $groupID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}
