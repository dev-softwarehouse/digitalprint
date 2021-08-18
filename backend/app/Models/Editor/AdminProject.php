<?php

namespace DreamSoft\Models\Editor;

/**
 * Description of Editor
 *
 * @author Rafał
 */


class AdminProject extends EditorInterface
{

    private $adminProjectLayer;
    private $adminProjectObject;

    /**
     * AdminProject constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('adminProjects', $prefix);
        if ($prefix) {
            $this->adminProjectLayer = $this->prefix . 'adminProjectLayers';
            $this->adminProjectObject = $this->prefix . 'adminProjectObjects';
        }
    }

    /**
     * @param $projectID
     * @return array|bool
     */
    public function getWithChilds($projectID)
    {

        $query = 'SELECT ap.ID as adminProjectID,'
            . 'ap.name as adminProjectName, '
            . 'apl.ID as adminLayerID, '
            . 'apl.name as adminLayerName, '
            . 'apl.typeID as adminLayerTypeID, '
            . 'apl.order as adminLayerOrder, '
            . 'apl.parent as adminLayerParent, '
            . 'apl.isBlocked as adminLayerBlocked, '
            . 'apl.isHidden as adminLayerHidden, '
            . 'apl.isVisible as adminLayerVisible, '
            . 'apl.attributeName as adminLayerAttributeName, '
            . 'apl.matrix as adminLayerMatrix, '
            . 'apl.settings as adminLayerSettings, '
            . 'apoL.ID as adminObjectID, '
            . 'apoL.name as adminObjectName, '
            . 'apoL.layerID as adminObjectLayerID, '
            . 'apoL.content as adminObjectContent, '
            . 'apoL.order as adminObjectOrder, '
            . 'apoL.matrix as adminObjectMatrix,'
            . 'apoL.typeID as adminObjectTypeID, '
            . 'apoL.settings as adminObjectSettings, '
            . 'apoL.inHistory as adminObjectInHistory '
            . ' FROM `' . $this->getTableName() . '` as ap '
            . 'LEFT JOIN `' . $this->adminProjectLayer . '` as apl ON apl.adminProjectID = ap.ID '
            . 'LEFT JOIN `' . $this->adminProjectObject . '` as apoL ON apoL.layerID = apl.ID '
            . ' WHERE ap.ID = :projectID AND apl.inHistory = 0 ';
        $binds['projectID'] = $projectID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

}
