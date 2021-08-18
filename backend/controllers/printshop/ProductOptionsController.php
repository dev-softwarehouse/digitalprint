<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigExclusion;
use DreamSoft\Models\PrintShopProduct\PrintShopAttributeName;
use DreamSoft\Models\PrintShopProduct\PrintShopProductAttributeSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopOptionDelivery;
use DreamSoft\Models\PrintShop\PrintShopComplex;

/**
 * Description of OptionsController
 * @class ProductOptions
 * @author Rafał
 */
class ProductOptionsController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopOption
     */
    protected $PrintShopOption;
    /**
     * @var PrintShopAttributeName
     */
    protected $PrintShopAttributeName;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var PrintShopConfigExclusion
     */
    protected $PrintShopConfigExclusion;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopComplex
     */
    protected $PrintShopComplex;
    /**
     * @var PrintShopProductAttributeSetting
     */
    protected $PrintShopProductAttributeSetting;
    /**
     * @var PrintShopOptionDelivery
     */
    private $PrintShopOptionDelivery;

    /**
     * ProductOptionsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->PrintShopConfigExclusion = PrintShopConfigExclusion::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopComplex = PrintShopComplex::getInstance();
        $this->PrintShopAttributeName = PrintShopAttributeName::getInstance();
        $this->PrintShopProductAttributeSetting = PrintShopProductAttributeSetting::getInstance();
        $this->PrintShopOptionDelivery = PrintShopOptionDelivery::getInstance();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $attrID
     * @return array|bool
     */
    public function options($groupID, $typeID, $attrID = NULL)
    {

        $this->PrintShopOption->setGroupID($groupID);
        $this->PrintShopOption->setTypeID($typeID);

        if (intval($attrID) > 0) {
            $all = $this->PrintShopOption->getAll($attrID);
        } else {
            $all = $this->PrintShopOption->getAll();
        }

        $productOptionAggregate = array();
        if (!empty($all)) {
            foreach ($all as $key => $opt) {
                $productOptionAggregate[] = $opt['ID'];
                if (!empty($opt['formats'])) {
                    $all[$key]['formats'] = explode(';', $opt['formats']);
                } else {
                    $all[$key]['formats'] = array();
                }

            }

            $excludedDeliveries = $this->PrintShopOptionDelivery->getByListOptions($typeID, $productOptionAggregate);

            foreach ($all as $key => $option) {

                if( array_key_exists($option['ID'], $excludedDeliveries) ) {
                    $all[$key]['excludedDeliveries'] = $excludedDeliveries[$option['ID']];
                }

            }

        }


        $data = $all;

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function patch_options($groupID, $typeID)
    {
        $this->PrintShopOption->setGroupID($groupID);
        $this->PrintShopOption->setTypeID($typeID);

        $attrID = $this->Data->getPost('attrID');
        $optID = $this->Data->getPost('optID');
        $action = $this->Data->getPost('action');
        $formats = $this->Data->getPost('formats');
        $deliveries = $this->Data->getPost('deliveries');

        $return['response'] = false;

        if ($action == 'import') {

            $list = $this->PrintShopOption->getAllOptions();

            if (!empty($list)) {
                $formatsSet = 0;
                foreach ($list as $row) {
                    if (strlen($row['formatID']) > 0) {
                        $exp = explode(';', $row['formatID']);
                        if (!empty($exp)) {
                            foreach ($exp as $e) {
                                $productOptionID = $this->PrintShopOption->exist($row['attrID'], $row['optID']);
                                if (!$productOptionID) {
                                    $lastID = $this->PrintShopOption->setFormat($e, $row['ID']);
                                    if ($lastID > 0) {
                                        $formatsSet++;
                                    }
                                }
                            }
                        }
                    }
                }
                $return['info'] = 'Set ' . $formatsSet . ' of formats ';
                $return['response'] = true;
            } else {
                $return['response'] = false;
            }
            return $return;
        }

        if ($attrID && $optID) {
            if ($action == 'add') {
                $exist = $this->PrintShopOption->exist($attrID, $optID);
                if (!$exist) {
                    $lastID = $this->PrintShopOption->customCreate($attrID, $optID);
                    if ($lastID > 0) {
                        $return['response'] = true;
                    } else {
                        $return['response'] = false;
                    }
                } else {
                    $return['response'] = false;
                    $return['info'] = 'exist';
                }
            } elseif ($action == 'remove') {

                $return['attrID'] = $attrID;
                $return['optID'] = $optID;

                $productOptionID = $this->PrintShopOption->exist($attrID, $optID);
                $return['productOptionID'] = $productOptionID;

                $res = $this->PrintShopOption->delete($attrID, $optID);
                $return['response'] = $res;

                $deleted = $this->PrintShopOption->deleteFormats($productOptionID);
                $return['deleteFormats'] = $deleted;

            } elseif ($action == 'formats') {
                $productOptionID = $this->PrintShopOption->exist($attrID, $optID);
                $deleted = $this->PrintShopOption->deleteFormats($productOptionID);
                $this->PrintShopOption->update($productOptionID, 'formatID', NULL);

                if (is_array($formats) && !empty($formats)) {
                    $oldFormats = array();
                    foreach ($formats as $formatID) {
                        $lastID = $this->PrintShopOption->setFormat($formatID, $productOptionID);
                        $oldFormats[] = $formatID;
                    }
                    $oldFormatsStr = implode(';', $oldFormats);
                    $this->PrintShopOption->update($productOptionID, 'formatID', $oldFormatsStr);
                    if ($lastID > 0) {
                        $return['response'] = TRUE;
                    }
                } else {
                    $return['response'] = $deleted;
                }
            } elseif ($action == 'setInvisible') {
                $invisible = $this->Data->getPost('invisible');
                if ($invisible !== NULL) {
                    $productOptionID = $this->PrintShopOption->exist($attrID, $optID);
                    if ($this->PrintShopOption->update($productOptionID, 'invisible', $invisible)) {
                        $return['response'] = true;
                    } else {
                        $return['response'] = false;
                    }
                }
            } elseif ($action == 'setDefault') {

                $this->PrintShopOption->removeDefaults($attrID);

                $defaultValue = $this->Data->getPost('default');

                $productOptionID = $this->PrintShopOption->exist($attrID, $optID);
                $return['attributeID'] = $attrID;
                $return['optionID'] = $optID;
                if ($this->PrintShopOption->update($productOptionID, 'default', $defaultValue)) {
                    $return['response'] = true;
                } else {
                    $return['response'] = false;
                }

            } elseif ( $action == 'deliveries' ) {

                $productOptionID = $this->PrintShopOption->exist($attrID, $optID);
                $deleted = $this->PrintShopOptionDelivery->deleteBy($productOptionID, $typeID);
                $saved = 0;

                if (is_array($deliveries) && !empty($deliveries)) {

                    foreach ($deliveries as $deliveryID) {

                        $lastID = $this->PrintShopOptionDelivery->create(
                            compact('productOptionID', 'deliveryID', 'typeID')
                        );
                        if( $lastID > 0 ) {
                            $saved++;
                        }

                    }

                    if( $saved > 0 ) {
                        $return['saved'] = $saved;
                        $return['response'] = true;
                    } else {
                        $return['response'] = false;
                    }

                } else {
                    $return['response'] = $deleted;
                }

            } else {
                $return['response'] = false;
            }
            return $return;
        } else if ($action && $attrID) {

            if ($action == 'setCustomNames') {

                $post = $this->Data->getAllPost();

                if (!$post['names']) {
                    $return = $this->sendFailResponse('02');
                }

                $updated = $saved = $deleted = 0;
                foreach ($post['names'] as $lang => $name) {
                    $existAttributeNameID = $this->PrintShopAttributeName->nameExist($typeID, $attrID, $lang);
                    if ($existAttributeNameID) {
                        if (strlen($name) == 0) {
                            $deleted += $this->PrintShopAttributeName->delete('ID', $existAttributeNameID);
                        } else {
                            $updated += $this->PrintShopAttributeName->update($existAttributeNameID, 'name', $name);
                        }
                    } else {
                        $params['lang'] = $lang;
                        $params['name'] = $name;
                        $params['typeID'] = $typeID;
                        $params['attrID'] = $attrID;
                        $lastID = $this->PrintShopAttributeName->create($params);
                        if ($lastID > 0) {
                            $saved++;
                        }
                        unset($params);
                    }
                }

                if (($updated + $saved + $deleted) > 0) {
                    $return['response'] = true;
                    $return['saved'] = $saved;
                    $return['updated'] = $updated;
                    $return['deleted'] = $deleted;
                } else {
                    $return['response'] = false;
                }

            } else if ($action == 'setSelectByPicture') {


                $existID = $this->PrintShopProductAttributeSetting->exist($typeID, $attrID);
                $selectByPicture = $this->Data->getPost('selectByPicture');

                $saved = false;
                if ($existID > 0) {
                    $saved = $this->PrintShopProductAttributeSetting->update($existID, 'selectByPicture', $selectByPicture);
                } else {
                    $params = array();
                    $params['typeID'] = $typeID;
                    $params['attrID'] = $attrID;
                    $params['selectByPicture'] = $selectByPicture;
                    $lastID = $this->PrintShopProductAttributeSetting->create($params);
                    if ($lastID > 0) {
                        $saved = true;
                    }
                }

                if ($saved) {
                    $return['response'] = true;
                }
            }

            return $return;

        } else {

            $return['response'] = false;
            return $return;
        }
    }

    public function delete_options($groupID, $typeID)
    {
        $this->PrintShopOption->setGroupID($groupID);
        $this->PrintShopOption->setTypeID($typeID);

        $attrID = $this->Data->getPost('attrID');
        $optID = $this->Data->getPost('optID');
        if ($attrID && $optID) {
            $result = $this->PrintShopOption->delete($attrID, $optID);
            $productOptionID = $this->PrintShopOption->exist($attrID, $optID);
            if ($result) {
                $this->PrintShopOption->deleteFormats($productOptionID);
            }
            $data['response'] = $result;
        } else {
            $data['response'] = false;
        }
        return $data;
    }

    /**
     * @param $typeID
     * @return array
     */
    public function forEditor($typeID)
    {
        $this->PrintShopType->setTypeID($typeID);

        $type = $this->PrintShopType->get('ID', $typeID);

        if ($type['complex'] == 1) {
            $this->PrintShopComplex->setTypeID($typeID);
            $data = $this->PrintShopComplex->getAll();
            foreach ($data as $key => $value) {
                foreach ($value['products'] as $productKey => $p) {
                    $actType = array('ID' => $p['typeID'], 'groupID' => $p['groupID']);
                    $data[$key]['products'][$productKey]['formats'] = $this->_getFormats($actType);
                }
            }
        } else {
            $data = $this->PrintShopType->getTypeForEditor();
            foreach ($data as $key => $value) {
                foreach ($value['products'] as $productKey => $p) {
                    $actType = array('ID' => $p['typeID'], 'groupID' => $p['groupID']);
                    $data[$key]['products'][$productKey]['formats'] = $this->_getFormats($actType);
                }
            }
        }

        if (empty($data)) {
            return $this->sendFailResponse('16');
        }

        return $data;
    }

    /**
     * @param $type
     * @return array
     */
    private function _getFormats($type)
    {

        $this->PrintShopFormat->setGroupID($type['groupID']);
        $this->PrintShopFormat->setTypeID($type['ID']);

        $allFormats = $this->PrintShopFormat->getAll();

        $formatsArr = array();
        foreach ($allFormats as $af) {
            if ($af['active'] == 1) {
                $formatsArr[$af['ID']] = array('name' => $af['name'],
                    'width' => $af['width'],
                    'height' => $af['height'],
                    'slope' => $af['slope'],
                    'ID' => $af['ID']
                );
            }
        }

        $this->PrintShopOption->setGroupID($type['groupID']);
        $this->PrintShopOption->setTypeID($type['ID']);
        $all = $this->PrintShopOption->getAll();

        $formats = array();
        if (!empty($all)) {

            $allOpt = array();
            foreach ($all as $key => $opt) {
                $allOpt[] = $opt['optID'];
            }
            $allExl = $this->PrintShopConfigExclusion->getForOptions($allOpt);

            if (!empty($allExl)) {
                $excludesArr = array();
                foreach ($allExl as $ae) {
                    $excludesArr[$ae['attrID']][$ae['optID']][] = $ae['excOptID'];
                }
            }

            foreach ($all as $key => $opt) {

                if (!empty($opt['formats'])) {

                    $tmp = explode(';', $opt['formats']);
                    foreach ($tmp as $row) {
                        if (in_array($row, array_keys($formatsArr))) {
                            if ($opt['active'] == 1) {

                                if (!isset($excludesArr[intval($opt['attrID'])][intval($opt['optID'])]) ||
                                    empty($excludesArr[intval($opt['attrID'])][intval($opt['optID'])])
                                ) {
                                    $excludesArr[intval($opt['attrID'])][intval($opt['optID'])] = array();
                                }

                                $formats[$row]['name'] = $formatsArr[$row]['name'];
                                $formats[$row]['width'] = $formatsArr[$row]['width'];
                                $formats[$row]['height'] = $formatsArr[$row]['height'];
                                $formats[$row]['slope'] = $formatsArr[$row]['slope'];
                                $formats[$row]['ID'] = $formatsArr[$row]['ID'];
                                $formats[$row]['attributes'][$opt['attrID']]['name'] = $opt['attrName'];
                                $formats[$row]['attributes'][$opt['attrID']]['sort'] = $opt['attrSort'];
                                if (!isset($opt['adminName'])) {
                                    $adminName = NULL;
                                } else {
                                    $adminName = $opt['adminName'];
                                }
                                $formats[$row]['attributes'][$opt['attrID']]['options'][$opt['optID']] = array(
                                    //'ID' => $opt['optID'], 
                                    'name' => $opt['name'],
                                    'excludes' => $excludesArr[intval($opt['attrID'])][intval($opt['optID'])],
                                    'opis' => $opt['adminName']
                                );
                                unset($adminName);
                            }
                        }
                    }
                    unset($tmp);
                } else {

                    foreach (array_keys($formatsArr) as $fa) {
                        if ($opt['active'] == 1) {
                            if (!isset($excludesArr[intval($opt['attrID'])][intval($opt['optID'])]) ||
                                empty($excludesArr[intval($opt['attrID'])][intval($opt['optID'])])
                            ) {
                                $excludesArr[intval($opt['attrID'])][intval($opt['optID'])] = array();
                            }
                            $formats[$fa]['name'] = $formatsArr[$fa]['name'];
                            $formats[$fa]['width'] = $formatsArr[$fa]['width'];
                            $formats[$fa]['height'] = $formatsArr[$fa]['height'];
                            $formats[$fa]['slope'] = $formatsArr[$fa]['slope'];
                            $formats[$fa]['ID'] = $formatsArr[$fa]['ID'];
                            $formats[$fa]['attributes'][$opt['attrID']]['name'] = $opt['attrName'];
                            $formats[$fa]['attributes'][$opt['attrID']]['sort'] = $opt['attrSort'];
                            if (!isset($opt['adminName'])) {
                                $adminName = NULL;
                            } else {
                                $adminName = $opt['adminName'];
                            }
                            $formats[$fa]['attributes'][$opt['attrID']]['options'][$opt['optID']] = array(
                                //'ID' => $opt['optID'], 
                                'name' => $opt['name'],
                                'excludes' => $excludesArr[intval($opt['attrID'])][intval($opt['optID'])],
                                'opis' => $adminName
                            );
                            unset($adminName);
                        }

                    }
                }

            }
        }
        if (empty($formats)) {
            $formats = new stdClass();
        }

        return $formats;
    }

    /**
     * @param $typeID
     * @return array
     */
    public function attrList($typeID)
    {

        $type = $this->PrintShopType->get('ID', $typeID);

        $this->PrintShopOption->setGroupID($type['groupID']);
        $this->PrintShopOption->setTypeID($typeID);

        $all = $this->PrintShopOption->getAll();
        $result = array();
        if (!empty($all)) {
            foreach ($all as $key => $opt) {
                if ($opt['active'] == 1) {
                    $result[$opt['attrName']]['ID'] = $opt['attrID'];
                    $result[$opt['attrName']]['options'][] = array('name' => $opt['name'], 'ID' => $opt['optID']);
                }
            }
        }

        $this->PrintShopFormat->setGroupID($type['groupID']);
        $this->PrintShopFormat->setTypeID($typeID);
        $allFormats = $this->PrintShopFormat->getAll();

        $this->PrintShopFormat->setGroupID($type['groupID']);
        $this->PrintShopFormat->setTypeID($typeID);
        $pages = $this->PrintShopPage->getPages();

        if ($pages) {
            $result[$pages['name']]['ID'] = -1;

            if (!empty($pages['pages'])) {
                $result[$pages['name']]['options'][] = array('pages' => $pages['pages']);
            }
            if (!empty($pages['minPages']) && !empty($pages['maxPages'])) {
                $result[$pages['name']]['options'][] = array(
                    'minPages' => $pages['minPages'],
                    'maxPages' => $pages['maxPages'],
                    'step' => $pages['step']
                );
            }

        }


        if (!empty($allFormats)) {
            foreach ($allFormats as $af) {
                if ($af['active'] == 1) {
                    // Format ma ID 0
                    $result['Format']['ID'] = -1;
                    $result['Format']['options'][] = array('name' => $af['name'], 'ID' => $af['ID']);
                }
            }
        }

        return $result;

    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function loadProducts($typeID)
    {
        if (!$typeID) {
            $data['response'] = false;
            $data['info'] = 'Nie ma ID typeID';
            return $data;
        }

        $this->PrintShopComplex->setTypeID($typeID);

        $complexProducts = $this->PrintShopComplex->getAll();

        if (!empty($complexProducts)) {
            return $complexProducts;
        }

        $type = $this->PrintShopType->get('ID', $typeID);
        $result = array();
        if ($type) {
            $result = array('name' => $type['name'], 'ID' => $type['ID']);
        } else {
            $data['response'] = false;
            $data['info'] = 'Nie ma w tabeli danych';
            return $data;
        }
        return $result;
    }

    /**
     * @return array
     */
    public function count()
    {
        $attrs = $this->PrintShopOption->countAttrs();
        $opts = $this->PrintShopOption->countOpts();
        return array('attrs' => $attrs, 'opts' => $opts);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $attrID
     * @return array
     */
    public function getAttributeNames($groupID, $typeID, $attrID)
    {

        $list = $this->PrintShopAttributeName->getForAttribute($attrID, $typeID);

        if (!$list) {
            return array();
        }

        $result = array();
        foreach ($list as $row) {
            $result[$row['lang']] = $row['name'];
        }

        return $result;
    }
}
