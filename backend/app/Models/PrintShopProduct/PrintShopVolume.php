<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Class PrintShopVolume
 */
class PrintShopVolume extends PrintShop
{

    /**
     * @var string
     */
    protected $formatVolumes;


    /**
     * PrintShopVolume constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_volumes', $prefix);
        if ($prefix) {
            $this->formatVolumes = $this->prefix . 'products_formatVolumes';
        }
    }

    /**
     * @param bool $checkInvisible
     * @return array|bool
     */
    public function getAll($checkInvisible = false)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID 
                AND `volume` IS NOT NULL ';


        if ($checkInvisible) {
            $binds['invisible'] = 0;
            $query .= ' AND  `invisible` = :invisible ';
        }

        $query .= ' ORDER BY `volume` ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param null $formatID
     * @return bool|array
     */
    public function getAllByFormat($formatID = null)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID 
                AND `volume` IS NOT NULL 
                ORDER BY `volume`
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        $result = $this->db->getAll(PDO::FETCH_ASSOC);
        if (!$formatID) {
            return $result;
        }

        $volumeIDs = array();
        foreach ($result as $volume) {
            $volumeIDs[] = $volume['ID'];
        }

        $formatVolumes = $this->getVolumesFormats($volumeIDs);

        foreach ($result as $key => $volume) {
            if (isset($formatVolumes[$volume['ID']]) && is_array($formatVolumes[$volume['ID']])) {
                foreach ($formatVolumes[$volume['ID']] as $formatVolumeID) {
                    if ($formatID == $formatVolumeID) {
                        continue 2;
                        break;
                    }
                }
                unset($result[$key]);

            }
        }

        return $result;
    }

    /**
     * @param $IDs
     * @return array|bool
     */
    public function getVolumesFormats($IDs)
    {
        $query = 'SELECT * FROM `' . $this->formatVolumes . '` as formatVolumes 
            WHERE formatVolumes.`volumeID` IN ( ' . implode(',', $IDs) . ' ) ';

        if (!$this->db->exec($query)) return false;

        $result = $this->db->getAll(PDO::FETCH_ASSOC);

        $res = array();
        foreach ($result as $formatVolume) {
            if (!isset($res[$formatVolume['volumeID']])) {
                $res[$formatVolume['volumeID']] = array();

            }
            $res[$formatVolume['volumeID']][] = $formatVolume['formatID'];
        }

        return $res;
    }

    /**
     * @return bool|array
     */
    public function getAllVolumes()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `volume` IS NOT NULL 
                ORDER BY `volume`
                ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool
     */
    public function getCustom()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT `volume`, `formatID` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID 
                AND `volume` IS NULL 
                ORDER BY `volume`
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param null $volume
     * @return bool|string
     */
    public function create($volume = null)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `typeID`, `volume` ) VALUES
            ( :groupID, :typeID, :volume )';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':volume'] = $volume;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $volume
     * @return bool
     */
    public function customExist($volume)
    {

        if ($this->groupID === false) {
            return false;
        }
        if ($this->typeID === false) {
            return false;
        }
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID ';
        if ($volume !== null) {
            $query .= ' AND `volume` = :volume ';
        } else {
            $query .= ' AND `volume` IS NULL';
        }

        $query .= ' AND `formatID` IS NULL ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        if ($volume !== null) {
            $binds[':volume'] = $volume;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param null $volumeID
     * @param null $formatID
     * @return bool
     */
    public function getFormats($volumeID = NULL, $formatID = NULL)
    {

        $query = 'SELECT * FROM `' . $this->formatVolumes . '` 
                WHERE ';

        if (!$formatID && !$volumeID) {
            return false;
        }

        if ($formatID) {
            $query .= ' `formatID` = :formatID ';
            $binds[':formatID'] = $formatID;
        }
        if ($volumeID) {
            $query .= ' `volumeID` = :volumeID ';
            $binds[':volumeID'] = $volumeID;
        }


        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }

    /**
     * @param $formatID
     * @param $volumeID
     * @return bool
     */
    public function setFormat($formatID, $volumeID)
    {

        $query = 'INSERT INTO `' . $this->formatVolumes . '` 
            ( `formatID`, `volumeID` ) VALUES
            ( :formatID, :volumeID )';

        $binds[':volumeID'] = $volumeID;
        $binds[':formatID'] = $formatID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;

    }

    /**
     * @param $formatID
     * @param $volumeID
     * @return bool
     */
    public function existFormat($formatID, $volumeID)
    {
        $query = 'SELECT `ID` FROM `' . $this->formatVolumes . '` 
                WHERE ';
        if ($formatID) {
            $query .= ' `formatID` = :formatID AND ';
            $binds[':formatID'] = $formatID;
        }
        if ($volumeID) {
            $query .= ' `volumeID` = :volumeID ';
            $binds[':volumeID'] = $volumeID;
        }


        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $ID
     * @return bool
     */
    public function deleteFormat($ID)
    {
        $query = 'DELETE FROM `' . $this->formatVolumes . '` 
                WHERE `ID` = :ID ';
        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $volumeID
     * @return bool
     */
    public function deleteVolumeFormats($volumeID)
    {
        $query = 'DELETE FROM `' . $this->formatVolumes . '` 
                WHERE `volumeID` = :volumeID ';
        $binds[':volumeID'] = $volumeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $formatID
     * @return bool
     */
    public function deleteFormatVolumes($formatID)
    {
        $query = 'DELETE FROM `' . $this->formatVolumes . '` 
                WHERE `formatID` = :formatID ';
        $binds[':formatID'] = $formatID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param null $volume
     * @return bool
     */
    public function defaultDelete($volume = null)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'DELETE FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID ';
        if ($volume !== null) $query .= ' AND `volume` = :volume';
        else $query .= ' AND `volume` IS NULL ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        if ($volume !== null) $binds[':volume'] = $volume;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @return bool|string
     */
    public function createCustom()
    {
        return $this->create(null);
    }

    /**
     * @return bool
     */
    public function deleteCustom()
    {
        return $this->defaultDelete(null);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function deleteByGroupType($groupID, $typeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID
                ';

        $binds[':groupID'] = $groupID;
        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $volumes
     * @return array|bool
     */
    public function volumesHasFormats($volumes)
    {
        if (empty($volumes)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->formatVolumes . '` 
                WHERE ';
        if ($volumes) {
            $query .= ' `volumeID` IN (' . implode(',', $volumes) . ') ';
        }

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['volumeID']][] = $row['formatID'];
        }
        return $result;
    }

}
