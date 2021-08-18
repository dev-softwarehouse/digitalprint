<?php

use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\Editor\AdminProject;
use DreamSoft\Models\Editor\AdminProjectLayer;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Editor\AdminProjectObject;
use DreamSoft\Models\Editor\AdminProjectLayerAttribute;
use DreamSoft\Controllers\Components\Standard;

/**
 * This is the description for my class.
 *
 * @class AdminProjectsController
 * @package editor
 */
class AdminProjectsController extends Controller
{

    public $useModels = array();

    /**
     * @var AdminProject
     */
    protected $AdminProject;
    /**
     * @var AdminProjectLayer
     */
    protected $AdminProjectLayer;
    /**
     * @var AdminProjectObject
     */
    protected $AdminProjectObject;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var AdminProjectLayerAttribute
     */
    protected $AdminProjectLayerAttribute;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var Standard
     */
    private $Standard;

    /**
     *
     *
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->AdminProject = AdminProject::getInstance();
        $this->AdminProjectLayer = AdminProjectLayer::getInstance();
        $this->AdminProjectObject = AdminProjectObject::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->AdminProjectLayerAttribute = AdminProjectLayerAttribute::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function adminProjects($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->AdminProject->get('ID', $ID);
        } else {
            $data = $this->AdminProject->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function post_adminProjects()
    {

        $name = $this->Data->getPost('name');
        $typeID = $this->Data->getPost('typeID');
        if ($name && $typeID) {
            $params['name'] = $name;
            $lastID = $this->AdminProject->create($params);
            if ($lastID > 0) {
                $this->PrintShopType->update($typeID, 'adminProjectID', $lastID);
            }
            $row = $this->AdminProject->get('ID', $lastID);
            $return['response'] = true;
            $return['item'] = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function put_adminProjects($ID)
    {
        $name = $this->Data->getPost('name');

        if (intval($ID) == 0) {
            $data['response'] = false;
            return $data;
        }

        if ($name) {
            $this->AdminProject->update($ID, 'name', $name);
        }

        $data['response'] = true;
        return $data;
    }

    public function delete_adminProjects($ID)
    {
        if (strlen($ID) == 0) {
            $data['response'] = false;
            return $data;
        }
        $this->AdminProject->delete('ID', $ID);
        $data['response'] = true;
        return $data;
    }

    /**
     * @param null $params
     * @return array
     */
    public function extended($params = NULL)
    {

        $projectID = $params['projectID'];
        $res = $this->AdminProject->getWithChilds($projectID);

        $result = array();
        $objects = $this->AdminProjectObject->getByProjectID($projectID);
        if ($res && is_array($res)) {

            $layerList = array();
            foreach ($res as $row) {
                if (!empty($row['adminLayerID']) && strlen($row['adminLayerID']) > 0) {
                    $layerList[] = $row['adminLayerID'];
                }
            }


            $attrs = $this->AdminProjectLayerAttribute->getByLayerID($layerList);
            $attrsFP = $this->AdminProjectLayerAttribute->getByLayerID($layerList, 2);


            $formatList = array();
            $pageList = array();
            if (!empty($attrsFP)) {
                foreach ($attrsFP as $key => $value) {
                    if ($value['attrType'] == 2) {
                        $formatList[] = $value['optID'];
                    }
                    if ($value['attrType'] == 3) {
                        $pageList[] = $value['optID'];
                    }
                }
            }

            if (!empty($formatList)) {
                $formats = $this->PrintShopFormat->getByIDs($formatList);
            }

            if (!empty($formats)) {
                $formatsArr = array();
                foreach ($formats as $key => $f) {
                    $formatsArr[$f['ID']] = $f['name'];
                }

                foreach ($attrs as $key => $value) {
                    if ($value['attrType'] == 2) {
                        $attrs[$key]['attrID'] = -1;
                        $attrs[$key]['attrName'] = 'Format';
                        $attrs[$key]['optName'] = $formatsArr[$value['optID']];
                    }
                }

            }

            if (!empty($pageList)) {
                $pages = $this->PrintShopPage->getByIDs($pageList);
            }
            if (!empty($pages)) {
                $pagesArr = array();
                foreach ($pages as $key => $p) {
                    if (!empty($p['pages'])) {
                        $pagesArr[$p['ID']] = $p['pages'];
                    } else {
                        // minPages 	maxPages 	step
                        $pagesArr[$p['ID']] = $p['minPages'] . '-' . $p['maxPages'] . '/' . $p['step'];
                    }
                }

                foreach ($attrs as $key => $value) {
                    if ($value['attrType'] == 3) {
                        $attrs[$key]['attrID'] = -2;
                        $attrs[$key]['attrName'] = 'Strony';
                        $attrs[$key]['optName'] = $pagesArr[$value['optID']];
                    }
                }
            }

            foreach ($res as $row) {

                if (empty($result)) {
                    $result = array('name' => $row['adminProjectName'], 'ID' => $row['adminProjectID']);
                }

                if (!empty($row['adminObjectID']) && strlen($row['adminObjectID']) > 0 && $row['adminObjectInHistory'] == 0) {
                    $result['layers'][$row['adminObjectLayerID']]['objects'][] = array(
                        'ID' => $row['adminObjectID'],
                        'name' => $row['adminObjectName'],
                        'content' => $row['adminObjectContent'],
                        'matrix' => $row['adminObjectMatrix'],
                        'order' => $row['adminObjectOrder'],
                        'type' => 'object',
                        'parent' => $row['adminObjectLayerID'],
                        'typeID' => $row['adminObjectTypeID'],
                        'base64' => $this->AdminProjectObject->getBase64($row['adminObjectID']),
                        'url' => $this->AdminProjectObject->getUrl($row['adminObjectID'], $row['adminProjectID'], $row['adminObjectName']),
                        'settings' => $row['adminObjectSettings'],
                    );
                }
                if (!empty($row['adminLayerID']) &&
                    intval($row['adminLayerID']) > 0 &&
                    !empty($row['adminLayerTypeID'])) {
                    $actObjects = array();
                    if (isset($result['layers'][$row['adminLayerID']]['objects'])) {
                        $actObjects = $result['layers'][$row['adminLayerID']]['objects'];
                    }

                    $result['layers'][$row['adminLayerID']] = array('ID' => $row['adminLayerID'],
                        'name' => $row['adminLayerName'],
                        'typeID' => $row['adminLayerTypeID'],
                        'order' => $row['adminLayerOrder'],
                        'parent' => $row['adminLayerParent'],
                        'isBlocked' => $row['adminLayerBlocked'],
                        'isHidden' => $row['adminLayerHidden'],
                        'isVisible' => $row['adminLayerVisible'],
                        'attributeName' => $row['adminLayerAttributeName'],
                        'type' => 'layer',
                        'objects' => $actObjects,
                        'matrix' => $row['adminLayerMatrix'],
                        'settings' => $row['adminLayerSettings'],
                    );

                    $lastID = $row['adminLayerID'];

                    if (isset($attrs[$row['adminLayerID']]) && !empty($attrs[$row['adminLayerID']])) {
                        $result['layers'][$lastID]['attr'] = $attrs[$row['adminLayerID']];
                    } else {
                        $result['layers'][$lastID]['attr'] = array();
                    }
                }

            }
            if (!isset($result['layers'])) {
                $result['layers'] = array();
            }
            $result['objects'] = array();
        }
        if (!empty($objects)) {
            $result['objects'] = $objects;
        } else {
            $result['objects'] = array();
        }
        if (!empty($result['layers'])) {
            sort($result['layers']);
        } else {
            $result['layers'] = array();
        }

        return $result;

    }

    public function layers($projectID, $ID)
    {
        if (intval($ID) > 0) {
            $data = $this->AdminProjectLayer->get('ID', $ID);
        } else {
            $data = $this->AdminProjectLayer->getAll($projectID);
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $adminProjectID
     * @return mixed
     */
    public function post_layers($adminProjectID)
    {

        $name = $this->Data->getPost('name');
        $typeID = $this->Data->getPost('typeID');
        $parent = $this->Data->getPost('parent');
        $matrix = $this->Data->getPost('matrix');
        if (!$parent) {
            $parent = 0;
        }
        $attributeName = $this->Data->getPost('attributeName');
        $order = $this->Data->getPost('order');
        if ($name && $adminProjectID && $typeID) {
            $lastID = $this->AdminProjectLayer->create(compact('name', 'typeID', 'adminProjectID', 'parent', 'order', 'attributeName', 'matrix'));
            $row = $this->AdminProjectLayer->get('ID', $lastID);
            $return['response'] = true;
            $return['item'] = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    private function _patch_layers($ID)
    {
        $goodFields = array('name',
            'typeID',
            'isVisible',
            'isHidden',
            'isBlocked',
            'order',
            'parent',
            'attributeName',
            'matrix',
            'inHistory',
            'settings');
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    if ($key == 'matrix' && is_array($value)) {
                        $value = json_encode($value);
                    }
                    if ($key == 'settings' && is_array($value)) {
                        $value = json_encode($value);
                    }
                    $saved += intval($this->AdminProjectLayer->update($ID, $key, $value));
                }
            }
            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pól.';
            } else {
                $data['info'] = 'Brak zapisanych pól';
            }
        } else {
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }

    /**
     * @param $projectID
     * @param $ID
     * @return mixed
     */
    public function patch_layers($projectID, $ID)
    {
        return $this->_patch_layers($ID);
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function patch_onlyLayers($ID)
    {
        return $this->_patch_layers($ID);
    }

    /**
     * @param $projectID
     * @param $ID
     * @return mixed
     */
    public function delete_layers($projectID, $ID)
    {

        if (strlen($ID) == 0) {
            $data['response'] = false;
            return $data;
        }
        $this->AdminProjectLayer->delete('ID', $ID);
        $data['response'] = true;
        return $data;
    }

    /**
     * @return array
     */
    public function patch_sortLayer()
    {
        $post = $this->Data->getAllPost();
        $count = 0;
        $this->Standard->setModel($this->AdminProjectLayer);
        $count += intval($this->Standard->sort($post['layers'], $func = 'sort'));
        $this->Standard->setModel($this->AdminProjectObject);
        $count += intval($this->Standard->sort($post['objects'], $func = 'sort'));
        if ($count == 2) {
            return array('response' => true);
        } else {
            return array('response' => false);
        }
    }

    /**
     * @param $projectID
     * @param $layerID
     * @return array
     */
    public function extendedLayer($projectID, $layerID)
    {

        $res = $this->AdminProjectLayer->getWithChilds($layerID);

        $result = array();

        if ($res && is_array($res)) {
            foreach ($res as $row) {

                if (!isset($result[$row['adminLayerID']])) {
                    $result[$row['adminLayerID']] = array('ID' => $row['adminLayerID']);
                }
                $result[$row['adminLayerID']]['objects'][] = array(
                    'ID' => $row['adminObjectID'],
                    'name' => $row['adminObjectName'],
                    'content' => $row['adminObjectContent']
                );

            }
        }

        return $result;

    }

    /**
     * @param $ID
     * @return array|bool|mixed
     */
    private function _baseObject($ID)
    {
        if (intval($ID) > 0) {
            $data = $this->AdminProject->get('ID', $ID);
        } else {
            $data = $this->AdminProject->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $projectID
     * @param $layerID
     * @param null $ID
     * @return array|bool|mixed
     */
    public function objects($projectID, $layerID, $ID = NULL)
    {
        return $this->_baseObject($ID);
    }

    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function onlyObjects($ID = NULL)
    {
        return $this->_baseObject($ID);
    }

    /**
     * @param $projectID
     * @param $layerID
     * @return mixed
     */
    public function post_objects($projectID, $layerID)
    {

        $name = $this->Data->getPost('name');
        $typeID = $this->Data->getPost('typeID');
        if ($name && ($layerID || $projectID) && $typeID) {
            $params['name'] = $this->AdminProjectObject->permalink($name);
            $params['layerID'] = $layerID;
            $params['typeID'] = $typeID;
            $params['projectID'] = $projectID;
            $lastID = $this->AdminProjectObject->create($params);
            $row = $this->AdminProjectObject->get('ID', $lastID);
            $return['response'] = true;
            $return['item'] = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    private function _basePatchObjects($ID)
    {
        $goodFields = array('layerID',
            'name',
            'content',
            'typeID',
            'isVisible',
            'isHidden',
            'isBlocked',
            'order',
            'matrix',
            'settings',
            'inHistory'
        );
        $post = $this->Data->getAllPost();
        if (isset($post['matrix']) && is_array($post['matrix'])) {
            $post['matrix'] = json_encode($post['matrix']);
        }
        if (isset($post['content']) && is_array($post['content'])) {
            $post['content'] = json_encode($post['content']);
        }
        if (isset($post['settings']) && is_array($post['settings'])) {
            $post['settings'] = json_encode($post['settings']);
        }
        $data['response'] = false;

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    if ($key == 'name') {
                        $value = $this->AdminProjectObject->permalink($value);
                    }
                    $saved += intval($this->AdminProjectObject->update($ID, $key, $value));
                }
            }
            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pól.';
            } else {
                $data['info'] = 'Brak zapisanych pól';
            }
        } else {
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }

    /**
     * @param $projectID
     * @param $layerID
     * @param $ID
     * @return mixed
     */
    public function patch_objects($projectID, $layerID, $ID)
    {
        return $this->_basePatchObjects($ID);
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function patch_onlyObjects($ID)
    {
        return $this->_basePatchObjects($ID);
    }

    /**
     * @param $ID
     * @return mixed
     */
    private function _deleteObjects($ID)
    {
        if (strlen($ID) == 0) {
            $data['response'] = false;
            return $data;
        }
        $this->AdminProjectObject->delete('ID', $ID);
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $projectID
     * @param $layerID
     * @param $ID
     * @return mixed
     */
    public function delete_objects($projectID, $layerID, $ID)
    {
        return $this->_deleteObjects($ID);
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_onlyObjects($ID)
    {
        return $this->_deleteObjects($ID);
    }

    /**
     * @param $projectID
     * @param $layerID
     * @param null $ID
     * @return array|bool|mixed
     */
    public function attributes($projectID, $layerID, $ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->AdminProjectLayerAttribute->get('ID', $ID);
        } else {
            $data = $this->AdminProjectLayerAttribute->getAll($layerID);
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @param $projectID
     * @param $layerID
     * @return mixed
     */
    public function post_attributes($projectID, $layerID)
    {
        $post = $this->Data->getAllPost();
        $optID = $this->Data->getPost('optID');
        $attrType = $this->Data->getPost('attrType');
        if (!$attrType) {
            $attrType = 1;
        }
        if ($optID && $layerID) {
            $lastID = $this->AdminProjectLayerAttribute->create(compact('optID', 'layerID', 'attrType'));
            $row = $this->AdminProjectLayerAttribute->get('ID', $lastID);
            $return['response'] = true;
            $return['item'] = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_attributes($ID)
    {
        if (strlen($ID) == 0) {
            $data['response'] = false;
            return $data;
        }
        $this->AdminProjectLayerAttribute->delete('ID', $ID);
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $projectID
     * @return mixed
     */
    public function delete_deleteChilds($projectID)
    {
        $data['response'] = false;
        if ($projectID) {
            $count = 0;
            $count += intval($this->AdminProjectObject->delete('projectID', $projectID));
            $count += intval($this->AdminProjectLayer->delete('projectID', $projectID));
            if ($count > 0) {
                $data['response'] = true;
            }
        }
        return $data;
    }
}
