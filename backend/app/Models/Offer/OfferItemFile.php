<?php

namespace DreamSoft\Models\Offer;
/**
 * Description of AuctionResponseItemFile
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

class OfferItemFile extends Model
{

    /**
     * @var UrlMaker
     */
    private $UrlMaker;

    /**
     * OfferItemFile constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->UrlMaker = new UrlMaker();
        $this->prefix = 'dp_';
        $this->setTableName('offer_itemFiles', true);
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

    /**
     * @param $offerItemID
     * @return array|bool
     */
    public function getByItem($offerItemID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `offerItemID` = :offerItemID ';

        $binds['offerItemID'] = $offerItemID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        return $res;

    }

    /**
     * @param $params
     * @return bool|string
     */
    public function add($params)
    {

        if (empty($params)) {
            return false;
        }

        foreach ($params as $key => $value) {
            if ($key === 'name') {
                $params[$key] = $this->UrlMaker->permalink($value);
            }
        }
        return $this->create($params);
    }

    /**
     * @param $list
     * @param null $visible
     * @return array|bool
     */
    public function getFileByList($list, $visible = NULL)
    {
        if (empty($list)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` as oi '
            . ' WHERE oi.offerItemID IN (' . implode(',', $list) . ') ';

        if ($visible !== NULL) {
            $binds['visible'] = intval($visible);
            $query .= ' AND visible = :visible ';
        } else {
            $binds = array();
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        if (!$res) {
            return false;
        } else {

            foreach ($res as $row) {
                $result[$row['offerItemID']][] = $row;
            }
        }

        return $result;
    }
}