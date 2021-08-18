<?php

namespace DreamSoft\Models\Editor;

/**
 * Description of AdminProjectLayer
 *
 * @author Rafał
 */
class AdminProjectLayer extends EditorInterface
{

    /**
     * @var string
     */
    private $adminProjectObject;

    /**
     * AdminProjectLayer constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('adminProjectLayers', $prefix);
        if ($prefix) {
            $this->adminProjectObject = $this->prefix . 'adminProjectObjects';
        }
    }

    /**
     * @param $layerID
     * @return array|bool
     */
    public function getWithChilds($layerID)
    {

        $query = 'SELECT apl.ID as adminLayerID, '
            . 'apo.ID as adminObjectID, '
            . 'apo.name as adminObjectName, '
            . 'apo.content as adminObjectContent '
            . ' FROM `' . $this->getTableName() . '` as apl ON apl.adminProjectID = ap.ID '
            . 'LEFT JOIN `' . $this->adminProjectObject . '` as apo ON apo.layerID = apl.ID '
            . ' WHERE apl.ID = :layerID';
        $binds['layerID'] = $layerID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $layers
     * @return bool
     */
    public function sort($layers)
    {
        $result = true;
        foreach ($layers as $layerID => $row) {

            if (isset($row['type']) && $row['type'] == 'object') {
                continue;
            }

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index, `parent` = :parent WHERE `ID` = :layerID ';

            $binds[':layerID'] = array($layerID, 'int');
            $binds[':parent'] = array($row['layerID'], 'int');
            $binds[':index'] = $row['order'];
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }
}
