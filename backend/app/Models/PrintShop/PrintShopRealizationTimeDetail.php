<?php

namespace DreamSoft\Models\PrintShop;

use PDO;

/**
 * Description of PrintShopConfigRealizationTimeDetail
 *
 * @author Rafał
 */
class PrintShopRealizationTimeDetail extends PrintShop
{

    /**
     * PrintShopConfigRealizationTimeDetail constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_realizationTimeDetails', $prefix);
    }

    /**
     * @param $realizationID
     * @param $days
     * @param $pricePercentage
     * @param $active
     * @return bool
     */
    public function customSet($realizationID, $days, $pricePercentage, $active)
    {
        $realization = $this->customGet($realizationID);

        $saved = 0;
        $updated = 0;

        if ($realization === false) {

            $groupID = $this->getGroupID();
            $params = compact(
                'realizationID',
                'days',
                'pricePercentage',
                'groupID',
                'active'
            );

            if( $this->getTypeID() ) {
                $params['typeID'] = $this->getTypeID();
            }
            if( $this->getVolume() ) {
                $params['volume'] = $this->getVolume();
            }

            $lastID = $this->create($params);
            if( $lastID ) {
                $saved++;
            }

        } else {

            $updated += intval(
                $this->update($realization['ID'], 'days', $days)
            );
            $updated += intval(
                $this->update($realization['ID'], 'pricePercentage', $pricePercentage)
            );
            $updated += intval(
                $this->update($realization['ID'], 'active', $active)
            );

        }

        if( $saved > 0 || $updated > 0 ) {
            return true;
        }

        return false;
    }

    /**
     * @param $realizationID
     * @return bool|mixed
     */
    public function customGet($realizationID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`WHERE 
                `realizationID` = :realizationID AND
                `groupID` = :groupID';

        if ($this->getTypeID() != null) {
            $query .= ' AND typeID = :typeID';
        } else {
            $query .= ' AND typeID IS NULL';
        }

        if ($this->getVolume() != null) {
            $query .= ' AND volume = :volume';
        } else {
            $query .= ' AND volume IS NULL';
        }

        $binds['realizationID'] = array($realizationID, 'int');
        $binds['groupID'] = array($this->getGroupID(), 'int');
        if ($this->getTypeID() != null) {
            $binds['typeID'] = $this->getTypeID();
        }
        if ($this->getVolume() != null) {
            $binds['volume'] = $this->getVolume();
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $realizationID
     * @param $params
     * @return bool|mixed
     */
    public function getByParams($realizationID, $params)
    {
        $query = 'SELECT `ID`, `realizationID`, `days`, `pricePercentage`, `active`, `groupID`, `typeID`, `volume` 
                        FROM `' . $this->getTableName() . '`
                        WHERE 
                        `realizationID` = :ID AND `groupID` = :groupID ';

        if ($params['typeID'] != null) {
            $query .= ' AND typeID = :typeID';
        } else {
            $query .= ' AND typeID IS NULL';
        }
        if ($params['volume'] != null) {
            $query .= ' AND (volume < :volume OR volume = :volume ) ORDER BY `volume` DESC';
        } else {
            $query .= ' AND volume IS NULL';
        }

        $binds = array();
        $binds['ID'] = array($realizationID, 'int');
        $binds['groupID'] = array($params['groupID'], 'int');
        if ($params['typeID'] != null){
            $binds['typeID'] = $params['typeID'];
        }
        if ($params['volume'] != null) {
            $binds['volume'] = $params['volume'];
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

}
