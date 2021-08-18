<?php

namespace DreamSoft\Models\Offer;
/**
 * Description of AuctionFile
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

class AuctionFile extends Model
{
    /**
     * @var UrlMaker
     */
    private $UrlMaker;

    /**
     * AuctionFile constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->UrlMaker = new UrlMaker();
        $this->prefix = 'dp_';
        $this->setTableName('auction_files', true);
    }

    /**
     * @param $auctionID
     * @return array|bool
     */
    public function getByAuction($auctionID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `auctionID` = :auctionID ';

        $binds['auctionID'] = $auctionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        return $res;

    }

    /**
     * @param $auctions
     * @return array|bool
     */
    public function getByAuctionList($auctions)
    {

        if (empty($auctions) || !is_array($auctions)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `auctionID` IN  (' . implode(',', $auctions) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        if (!$res) {
            return false;
        }

        foreach ($res as $key => $value) {
            $result[$value['auctionID']][] = $value;
        }
        return $result;

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
     * @return array|bool
     */
    public function getFileByList($list)
    {
        if (empty($list)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` as af '
            . ' WHERE af.auctionID IN (' . implode(',', $list) . ') ';
        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        if (!$res) {
            return false;
        } else {

            foreach ($res as $row) {
                $result[$row['auctionID']][] = $row;
            }
        }

        return $result;
    }
}
