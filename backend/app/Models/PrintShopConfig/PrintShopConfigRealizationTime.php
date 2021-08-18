<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Description of PrintShopConfigRealizationTime
 *
 * @author Rafał
 */
class PrintShopConfigRealizationTime extends PrintShop
{

    /**
     * PrintShopConfigRealizationTime constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_optionRealizationTime', $prefix);
    }

    /**
     * @param $optionID
     * @param $volume
     * @param $days
     * @return bool|string
     */
    public function customCreate($optionID, $volume, $days)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `optionID`, `volume`, `days` ) VALUES
            ( :optionID, :volume, :days )';

        $binds[':optionID'] = $optionID;
        $binds[':volume'] = $volume;
        $binds[':days'] = $days;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $optionID
     * @param $volume
     * @return bool
     */
    public function customExists($optionID, $volume)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                    WHERE `optionID` = :optionID AND `volume` = :volume ';

        $binds[':optionID'] = $optionID;
        $binds[':volume'] = $volume;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param $optionID
     * @param $volume
     * @param $days
     * @return bool|string
     */
    public function set($optionID, $volume, $days)
    {
        if ($this->customExists($optionID, $volume)) {
            return $this->customUpdate($optionID, $volume, $days);
        }
        return $this->customCreate($optionID, $volume, $days);

    }

    /**
     * @param $optionID
     * @param $volume
     * @param $days
     * @return bool
     */
    public function customUpdate($optionID, $volume, $days)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `days` = :days
            WHERE `optionID` = :optionID
            AND `volume` = :volume ';

        $binds[':days'] = $days;
        $binds[':optionID'] = $optionID;
        $binds[':volume'] = $volume;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $optionID
     * @param $volume
     * @return bool
     */
    public function getSpecify($optionID, $volume)
    {
        $query = 'SELECT `days` FROM `' . $this->getTableName() . '` 
            WHERE `optionID` = :optionID 
            AND `volume` <= :volume
            ORDER BY `volume` DESC LIMIT 1';

        $binds[':optionID'] = $optionID;
        $binds[':volume'] = $volume;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param $optionID
     * @param $volume
     * @return bool
     */
    public function getOne($optionID, $volume)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
            WHERE `optionID` = :optionID 
            AND `volume` = :volume ';

        $binds[':optionID'] = $optionID;
        $binds[':volume'] = $volume;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow();
    }

    /**
     * @param $optionID
     * @return bool
     */
    public function customGetAll($optionID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `optionID` = :optionID 
                    ORDER BY `volume` ASC';

        $binds[':optionID'] = $optionID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll();
    }

    /**
     * @param $list
     * @param string $direction
     * @return array|bool
     */
    public function getByList($list, $direction = 'ASC')
    {
        if (empty($list)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `optionID` IN (' . implode(',', $list) . ') 
                    ORDER BY `volume` '. $direction .' ';

        if (!$this->db->exec($query)) return false;

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $row) {
            $result[$row['optionID']][] = $row;
        }
        return $result;
    }

}
