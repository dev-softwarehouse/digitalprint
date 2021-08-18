<?php

namespace DreamSoft\Models\Offer;

/**
 * Description of Auction
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;

class Auction extends Model
{

    protected $QueryFilter;

    /**
     * Auction constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->prefix = 'dp_';
        $this->setTableName('auctions', true);
        $this->QueryFilter = new QueryFilter();
    }

    /**
     * @param null $filters
     * @return array|bool
     */
    public function getAuctionsForCompany($filters = null)
    {

        $query = ' SELECT a.* FROM `' . $this->getTableName() . '` as a '
            . ' LEFT JOIN `dp_auction_companies` as ac ON ac.auctionID = a.ID ';

        if (!!$filters['inOrder']['value']) {
            $query .= ' AND a.winnerResponseID = ac.responseID ';
        }

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        $binds[':companyID'] = companyID;

        $query .= ' WHERE ac.companyID = :companyID ';
        if (!empty($where)) {
            $query .= $where;
        }
        $query .= ' GROUP BY a.ID ORDER BY a.ID DESC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @return array|bool
     */
    public function getAuctions()
    {

        $query = ' SELECT a.* FROM `' . $this->getTableName() . '` as a '
            . ' WHERE a.companyID = :companyID ';
        $binds[':companyID'] = companyID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();

    }

    /**
     * @param null $filters
     * @return array|bool
     */
    public function getAuctionsWithCompanies($filters = null)
    {

        $query = ' SELECT a.*, GROUP_CONCAT(DISTINCT ac.companyID SEPARATOR ";") as companies FROM `' . $this->getTableName() . '` as a '
            . ' LEFT JOIN `dp_auction_companies` as ac ON ac.auctionID = a.ID ';


        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        $query .= ' WHERE a.companyID = :companyID ';
        $binds[':companyID'] = companyID;

        if (!empty($where)) {
            $query .= $where;
        }

        $query .= ' GROUP BY a.ID ';
        $query .= ' ORDER BY ID DESC';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();

    }

    /**
     * @param $offers
     * @return array|bool
     */
    public function getAuctionForOffer($offers)
    {
        if (empty($offers) || !is_array($offers)) {
            return false;
        }

        $query = ' SELECT a.*, GROUP_CONCAT(DISTINCT ac.companyID SEPARATOR ";") as companies FROM `' . $this->getTableName() . '` as a '
            . ' LEFT JOIN `dp_auction_companies` as ac ON ac.auctionID = a.ID '
            . ' WHERE a.offerID IN (' . implode(',', $offers) . ') GROUP BY a.ID ';

        if (!$this->db->exec($query)) {
            return false;
        }
        $res = $this->db->getAll();
        $result = array();
        if (!$res) {
            return false;
        }

        foreach ($res as $key => $value) {
            $result[$value['offerID']] = $value;
        }
        return $result;
    }

    /**
     * @param $auctionID
     * @return bool|mixed
     */
    public function getWinner($auctionID)
    {

        $query = ' SELECT a.*, rp.ID as responseID, '
            . ' rp.realizationDate as resRealizationDate,'
            . ' rp.description as resDescription, '
            . ' rp.realizationDateFinal as resRealizationDateFinal FROM `' . $this->getTableName() . '` as a '
            . ' LEFT JOIN `dp_auction_responses` as rp ON rp.ID = a.winnerResponseID '
            . ' WHERE a.ID = :auctionID AND winnerResponseID IS NOT NULL ';
        $binds['auctionID'] = $auctionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $offerID
     * @return bool|mixed
     */
    public function findOne($offerID)
    {
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `offerID` = :offerID AND `companyID` = :companyID ';

        $binds['offerID'] = $offerID;
        $binds['companyID'] = companyID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }
}
