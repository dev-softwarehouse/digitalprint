<?php

namespace DreamSoft\Models\Editor;

/**
 * Description of AdminProjectObject
 *
 * @author Rafał
 */

class AdminProjectObject extends EditorInterface
{

    /**
     * AdminProjectObject constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('adminProjectObjects', true);
    }

    /**
     * @param $projectID
     * @return array|bool
     */
    public function getByProjectID($projectID)
    {

        $query = ' SELECT object.ID, object.content, object.order,object.name,object.matrix, '
            . 'object.layerID as parent, object.typeID, object.settings FROM `' . $this->getTableName() . '` object '
            . ' WHERE object.`projectID` = :projectID AND object.`inHistory` = 0 ';

        $binds['projectID'] = $projectID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (empty($res)) {
            return false;
        }
        foreach ($res as $key => $value) {
            $res[$key]['type'] = 'object';
            $res[$key]['base64'] = $this->getBase64($value['ID']);
            $res[$key]['url'] = $this->getUrl($value['ID'], $projectID, $value['name']);
        }

        return $res;
    }

    /**
     * @param $objects
     * @return bool
     */
    public function sort($objects)
    {
        $result = true;
        foreach ($objects as $objectID => $row) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index, `layerID` = :layerID WHERE `ID` = :objectID ';

            $binds['objectID'] = array($objectID, 'int');
            $binds['layerID'] = array($row['layerID'], 'int');
            $binds['index'] = $row['order'];
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param $objectID
     * @return string|null
     */
    public function getBase64($objectID)
    {
        $object = $this->get('ID', $objectID);
        $file = BASE_DIR . $this->destination . '/' . $object['projectID'] . '/' . $objectID . '/' . 'min-' . $object['name'];
        if (!is_file($file)) {
            return NULL;
        }
        $type = pathinfo($file, PATHINFO_EXTENSION);
        $data = file_get_contents($file);
        $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        if (empty($base64)) {
            return NULL;
        }
        return $base64;
    }

    /**
     * @param $objectID
     * @param null $projectID
     * @param null $objectName
     * @return string|string[]|null
     */
    public function getUrl($objectID, $projectID = NULL, $objectName = NULL)
    {
        if (!$projectID) {
            $object = $this->get('ID', $objectID);
            $projectID = $object['projectID'];
            $objectName = $object['name'];
        }
        $file = BASE_DIR . $this->destination . '/' . $projectID . '/' . $objectID . '/' . 'min-' . $objectName;
        if (!is_file($file)) {
            return NULL;
        }
        return str_replace(BASE_DIR, $this->domain, $file);
    }

    /**
     * @param $value
     * @return string|string[]
     */
    public function permalink($value)
    {
        $result = strtr($value, 'ĄĆĘŁŃÓŚŹŻąćęłńóśźż', 'ACELNOSZZacelnoszz');

        $result = strtolower($result);

        $result = preg_replace("/[^a-zA-Z0-9\_\- .\(\)]/", "", $result);

        return str_replace(" ", "_", $result);
    }

}
