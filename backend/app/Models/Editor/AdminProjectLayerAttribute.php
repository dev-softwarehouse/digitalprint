<?php

namespace DreamSoft\Models\Editor;

/**
 * Description of AdminProjectLayerAttribute
 *
 * @author Rafał
 */

class AdminProjectLayerAttribute extends EditorInterface
{

    private $configOptions = 'ps_config_options';
    private $configAttributes = 'ps_config_attributes';

    /**
     * AdminProjectLayerAttribute constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('adminProjectLayerAttributes', $prefix);
    }

    /**
     * @param $layerID
     * @return array|bool
     */
    public function getAll($layerID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `layerID` = :layerID ';

        $binds['layerID'] = $layerID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $layers
     * @param int $type
     * @return array|bool
     */
    public function getByLayerID($layers, $type = 1)
    {
        if (empty($layers)) {
            return false;
        }
        if ($type == 1) {
            $query = 'SELECT editorAttr.ID as eID, editorAttr.`layerID` as layerID,attr.name as attrName, opt.name as optName,'
                . ' opt.ID as optID, attr.ID as attrID, editorAttr.attrType as attrType FROM `' . $this->getTableName() . '` editorAttr '
                . 'LEFT JOIN `' . $this->configOptions . '` as opt ON opt.ID = editorAttr.optID '
                . 'LEFT JOIN `' . $this->configAttributes . '` as attr ON opt.attrID = attr.ID '
                . ' WHERE editorAttr.`layerID` IN (' . implode(',', $layers) . ') AND editorAttr.attrType = 1 ';
        } else {
            $query = 'SELECT editorAttr.ID as eID, editorAttr.`layerID` as layerID, editorAttr.attrType as attrType, editorAttr.optID as optID FROM `' . $this->getTableName() . '` editorAttr '
                . ' WHERE editorAttr.`layerID` IN (' . implode(',', $layers) . ') AND editorAttr.attrType != 1 '; // AND editorAttr.attrType = 1
        }


        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (empty($res)) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['layerID']][] = array('attrID' => $row['attrID'],
                'attrName' => $row['attrName'],
                'optID' => $row['optID'],
                'optName' => $row['optName'],
                'ID' => $row['eID'],
                'attrType' => $row['attrType']);
        }

        return $result;
    }

    /**
     * @param $layers
     * @return array|bool
     */
    public function getFormatByLayers($layers)
    {

        $query = 'SELECT editorAttr.ID as eID,editorAttr.`layerID` as layerID,attr.name as attrName, opt.name as optName,'
            . ' opt.ID as optID, attr.ID as attrID FROM `' . $this->getTableName() . '` editorAttr '
            . 'LEFT JOIN `' . $this->configOptions . '` as opt ON opt.ID = editorAttr.optID '
            . 'LEFT JOIN `' . $this->configAttributes . '` as attr ON opt.attrID = attr.ID '
            . ' WHERE editorAttr.`layerID` IN (' . implode(',', $layers) . ') AND editorAttr.attrType = 2 ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (empty($res)) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['layerID']][] = array('attrID' => $row['attrID'],
                'attrName' => $row['attrName'],
                'optID' => $row['optID'],
                'optName' => $row['optName'],
                'ID' => $row['eID']);
        }

        return $result;

    }

}
