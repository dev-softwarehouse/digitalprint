<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttribute;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttributeLang;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttributeRange;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttributeType;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDetailPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigExclusion;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigIncrease;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOptionLang;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPaperPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigRealizationTime;
use DreamSoft\Models\PrintShopProduct\PrintShopAttributeName;
use DreamSoft\Models\PrintShopProduct\PrintShopProductAttributeSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\ProductionPath\OperationOption;

/**
 * Description of AttributesController
 *
 * @class AttributesController
 * @author Rafał
 */
class AttributesController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopConfigAttribute
     */
    protected $PrintShopConfigAttribute;
    /**
     * @var PrintShopConfigAttributeLang
     */
    protected $PrintShopConfigAttributeLang;
    /**
     * @var PrintShopConfigAttributeRange
     */
    protected $PrintShopConfigAttributeRange;
    /**
     * @var PrintShopConfigOption
     */
    protected $PrintShopConfigOption;
    /**
     * @var PrintShopConfigOptionLang
     */
    protected $PrintShopConfigOptionLang;
    /**
     * @var PrintShopOption
     */
    protected $PrintShopOption;
    /**
     * @var PrintShopConfigAttributeType
     */
    protected $PrintShopConfigAttributeType;
    /**
     * @var PrintShopConfigRealizationTime
     */
    protected $PrintShopConfigRealizationTime;
    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var PrintShopConfigDetailPrice
     */
    protected $PrintShopConfigDetailPrice;
    /**
     * @var PrintShopConfigExclusion
     */
    protected $PrintShopConfigExclusion;
    /**
     * @var OperationOption
     */
    protected $OperationOption;
    /**
     * @var PrintShopConfigIncrease
     */
    protected $PrintShopConfigIncrease;
    /**
     * @var PrintShopConfigPaperPrice
     */
    protected $PrintShopConfigPaperPrice;
    /**
     * @var PrintShopAttributeName
     */
    protected $PrintShopAttributeName;
    /**
     * @var PrintShopProductAttributeSetting
     */
    protected $PrintShopProductAttributeSetting;

    /**
     * AttributesController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
        $this->PrintShopConfigAttributeLang = PrintShopConfigAttributeLang::getInstance();
        $this->PrintShopConfigAttributeRange = PrintShopConfigAttributeRange::getInstance();
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->PrintShopConfigOptionLang = PrintShopConfigOptionLang::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopConfigAttributeType = PrintShopConfigAttributeType::getInstance();
        $this->PrintShopConfigRealizationTime = PrintShopConfigRealizationTime::getInstance();
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->PrintShopConfigDetailPrice = PrintShopConfigDetailPrice::getInstance();
        $this->PrintShopConfigExclusion = PrintShopConfigExclusion::getInstance();
        $this->OperationOption = OperationOption::getInstance();
        $this->PrintShopConfigIncrease = PrintShopConfigIncrease::getInstance();
        $this->PrintShopConfigPaperPrice = PrintShopConfigPaperPrice::getInstance();
        $this->PrintShopAttributeName = PrintShopAttributeName::getInstance();
        $this->PrintShopProductAttributeSetting = PrintShopProductAttributeSetting::getInstance();
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function attribute($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigAttribute->customGet($ID);
        } else {
            $data = $this->PrintShopConfigAttribute->getAll();
        }
        if (empty($data)) {
            $data = array();
        }

        return $data;

    }

    /**
     * @return array|bool
     */
    public function post_attribute()
    {
        $name = $this->Data->getPost('name');
        $type = $this->Data->getPost('type');

        $minPages = $this->Data->getPost('minPages');
        $step = $this->Data->getPost('step');
        $maxPages = $this->Data->getPost('maxPages');

        $adminName = $this->Data->getPost('adminName');

        $names = $this->Data->getPost('names');

        if (($name || $names) && $type) {
            if ($minPages && $step) {
                $params['step'] = $step;
                $params['maxPages'] = (intval($maxPages) > 0) ? $maxPages : NULL;
                $params['minPages'] = $minPages;
                $rangeID = $this->PrintShopConfigAttributeRange->create($params);
            } else {
                $rangeID = NULL;
            }
            $lastID = $this->PrintShopConfigAttribute->customCreate($name, $type, $rangeID, $adminName);

            if (!empty($names)) {
                foreach ($names as $lang => $name) {
                    $res = $this->PrintShopConfigAttributeLang->set($lang, $name, $lastID);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                }
            }

            $return = $this->PrintShopConfigAttribute->customGet($lastID);
            if (!$return) {
                $return['response'] = false;
            }
            $languages = $this->PrintShopConfigAttributeLang->get('attributeID', $lastID, true);
            if (!empty($languages)) {
                $return['names'] = array();
                foreach ($languages as $each) {
                    $return['names'][$each['lang']] = $each['name'];
                }
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }

    /**
     * @return array
     */
    public function put_attribute()
    {

        $post = $this->Data->getAllPost();

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }

        $currentAttr = $this->PrintShopConfigAttribute->customGet($ID);

        if (isset($post['minPages']) && $post['minPages'] !== NULL &&
            isset($post['step']) && !empty($post['step'])) {
            if ($currentAttr['rangeID'] == NULL) {
                $params['step'] = $post['step'];
                $params['maxPages'] = (intval($post['maxPages']) > 0) ? $post['maxPages'] : NULL;
                $params['minPages'] = $post['minPages'];
                $rangeID = $this->PrintShopConfigAttributeRange->create($params);
                $this->PrintShopConfigAttribute->setRangeID($ID, $rangeID);
            } else {
                if (isset($post['step'])) {
                    $this->PrintShopConfigAttributeRange->update($currentAttr['rangeID'], 'step', $post['step']);
                }
                if (isset($post['minPages'])) {
                    $this->PrintShopConfigAttributeRange->update($currentAttr['rangeID'], 'minPages', $post['minPages']);
                }
                if (isset($post['maxPages'])) {
                    $this->PrintShopConfigAttributeRange->update($currentAttr['rangeID'], 'maxPages', $post['maxPages']);
                }
            }
        } else {
            if ($currentAttr['rangeID'] != NULL) {
                $this->PrintShopConfigAttributeRange->delete('ID', $currentAttr['rangeID']);
                $this->PrintShopConfigAttribute->setRangeID($ID, NULL);
            }
        }
        $res = $this->PrintShopConfigAttribute->customUpdate($ID, $post['name'], $post['type'], $post['adminName']);
        if ($res) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
            return $return;
        }

        if (!empty($post['names'])) {
            foreach ($post['names'] as $lang => $name) {
                $res = $this->PrintShopConfigAttributeLang->set($lang, $name, $ID);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }

        return $return;

    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_attribute($ID)
    {
        if (intval($ID) > 0) {
            $attr = $this->PrintShopConfigAttribute->customGet($ID);
            if ($attr['rangeID'] != null) {
                $this->PrintShopConfigAttributeRange->delete('ID', $attr['rangeID']);
            }
            $deleted = $this->PrintShopConfigAttribute->delete('ID', $ID);
            if ($deleted) {
                $data['infoAttr'] = 'Remove Attribute';
                $this->PrintShopConfigOption->setAttrID($ID);
                $allOptions = $this->PrintShopConfigOption->getAll();
                if (!empty($allOptions) && is_array($allOptions)) {
                    $count = count($allOptions);
                    $data['infoOpt'] = 'Count option: ' . $count . '.';
                    $i = 0;
                    $iOpt = 0;
                    $iPrices = 0;
                    $iDetailPrices = 0;
                    $iRealizationTimes = 0;
                    $iExclusions = 0;
                    $iOperations = 0;
                    $iIncreases = 0;
                    $data['attrID'] = $ID;
                    foreach ($allOptions as $ao) {
                        if ($this->PrintShopConfigOption->delete('ID', $ao['ID'])) {
                            $i++;
                            $data['optID'] = $ao['ID'];
                            $allProductOptions = $this->PrintShopOption->getAllInProduct($ID, $ao['ID']);
                            $data['dumpAll'] = $allProductOptions;
                            if (!empty($allProductOptions) && is_array($allProductOptions)) {
                                foreach ($allProductOptions as $apo) {
                                    $data['productOption'] = $apo;
                                    $this->PrintShopOption->setGroupID($apo['groupID']);
                                    $this->PrintShopOption->setTypeID($apo['typeID']);
                                    $deletedFotmats = $this->PrintShopOption->deleteFormats($apo['ID']);
                                    if ($deletedFotmats) {
                                        $data['infoPrdOptFormats'] = 'Remove formats for options in products.';
                                    }
                                    $iOpt += intval($this->PrintShopOption->delete($ID, $ao['ID']));
                                }
                            }

                            $oldRealizationTimes = $this->PrintShopConfigRealizationTime->customGetAll($ao['ID']);
                            foreach ($oldRealizationTimes as $or) {
                                $iRealizationTimes += intval($this->PrintShopConfigRealizationTime->delete('ID', $or['ID']));
                            }

                            $this->PrintShopConfigPrice->setAttrID($ao['attrID']);
                            $this->PrintShopConfigPrice->setOptID($ao['ID']);

                            $controllers = $this->PrintShopConfigPrice->countByController();
                            if (!empty($controllers)) {
                                foreach ($controllers as $co) {
                                    $this->PrintShopConfigPrice->setControllerID($co['controllerID']);

                                    $prices = $this->PrintShopConfigPrice->getAll();
                                    foreach ($prices as $op) {
                                        $iPrices += intval($this->PrintShopConfigPrice->delete('ID', $op['ID']));
                                    }
                                }
                            }

                            $this->PrintShopConfigDetailPrice->setAttrID($ao['attrID']);
                            $this->PrintShopConfigDetailPrice->setOptID($ao['ID']);
                            $details = $this->PrintShopConfigDetailPrice->getAll();
                            if (!empty($details)) {
                                foreach ($details as $d) {
                                    $iDetailPrices += intval($this->PrintShopConfigDetailPrice->delete('ID', $d['ID']));
                                }
                            }

                            $this->PrintShopConfigExclusion->setAttrID($ao['attrID']);
                            $this->PrintShopConfigExclusion->setOptID($ao['ID']);
                            $iExclusions += intval($this->PrintShopConfigExclusion->customDelete());

                            $iOperations += intval($this->OperationOption->delete('optionID', $ao['ID']));

                            $this->PrintShopConfigIncrease->setAttrID($ao['attrID']);
                            $this->PrintShopConfigIncrease->setOptID($ao['ID']);
                            $iIncreases += intval($this->PrintShopConfigIncrease->deleteBy());

                            if (!$this->PrintShopConfigOptionLang->delete('optionID', $ao['ID'])) {
                                $data = $this->sendFailResponse('09');
                                return $data;
                            }

                            $this->PrintShopAttributeName->delete('attrID', $ID);
                        }
                    }
                    $data['infoOpt'] .= ' Remove: ' . $i;
                    $data['infoPrdOpt'] = 'Remove: ' . $iOpt . ' options for products.';
                    $data['inforealizationTimes'] = 'Remove: ' . $iRealizationTimes . ' realizationTimes for options.';
                    $data['infoPrices'] = 'Remove: ' . $iPrices . ' prices for options.';
                    $data['infoDetailPrices'] = 'Remove: ' . $iDetailPrices . ' detail prices for options.';
                    $data['infoExclusions'] = 'Remove: ' . $iExclusions . ' exclusions.';
                    $data['infoExclusions'] = 'Remove: ' . $iOperations . ' operations.';
                    $data['infoIncreases'] = 'Remove: ' . $iIncreases . ' increases.';
                }

                if (!$this->PrintShopConfigAttributeLang->delete('attributeID', $ID)) {
                    $data = $this->sendFailResponse('09');
                    return $data;
                }
            }
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return mixed
     */
    public function patch_sortAttr()
    {
        $post = $this->Data->getAllPost();
        $response = $this->PrintShopConfigAttribute->sort($post);
        $return['response'] = $response;
        return $return;
    }

    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function attributeType($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigAttributeType->get('ID', $ID);
        } else {
            $data = $this->PrintShopConfigAttributeType->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * Copy attribute
     *
     * @param int
     * @return array
     */
    public function copy($attrID)
    {
        if (intval($attrID) < 1) {
            return $this->sendFailResponse('06');
        }

        $attr = $this->PrintShopConfigAttribute->customGet($attrID);

        $attr['name'] = $attr['name'] . ' - ' . 'KOPIA';
        unset($attr['ID']);
        $newAttrID = $this->PrintShopConfigAttribute->customCreate($attr['name'], $attr['type'], $attr['rangeID'], $attr['adminName']);

        $attrsList = $this->PrintShopConfigAttribute->getAll();
        $sortArr = array();
        $i = 0;
        $gapIndex = null;
        foreach ($attrsList as $al) {
            if ($al['ID'] == $attrID) {
                $i++;
                $gapIndex = $i;
            }
            if ($al['ID'] == $newAttrID) {
                $i = $gapIndex;
            }
            $sortArr[$i] = $al['ID'];
            $i++;
        }
        $this->PrintShopConfigAttribute->sort($sortArr);

        $this->PrintShopConfigOption->setAttrID($attrID);
        $allOptions = $this->PrintShopConfigOption->getAll();

        $newOptionIDs = array();
        $oldRealizationTimes = array();
        foreach ($allOptions as $o) {
            $oldOptionID = $o['ID'];
            unset($o['ID']);
            $o['attrID'] = $newAttrID;
            $this->PrintShopConfigOption->setAttrID($newAttrID);
            $newOptionIDs[$oldOptionID] = $this->PrintShopConfigOption->customCreate($o['name'], $o['adminName'], $o['oneSide']);

            $fields = array('adminName', 'minPages', 'maxPages', 'weight', 'sizePage', 'active',
                'sort', 'oneSide', 'special', 'minVolume', 'rollLength', 'printRotated',
                'itemWeight', 'maxFolds', 'minThickness', 'maxThickness');
            foreach ($fields as $f) {
                $this->PrintShopConfigOption->update($newOptionIDs[$oldOptionID], $f, $o[$f]);
            }

            $oldRealizationTimes[$oldOptionID] = $this->PrintShopConfigRealizationTime->customGetAll($oldOptionID);
        }

        $setRealizations = array();
        foreach ($allOptions as $o) {
            foreach ($oldRealizationTimes[$o['ID']] as $or) {
                $optionID = $newOptionIDs[$o['ID']];
                $volume = $or['volume'];
                $days = $or['days'];
                $setRealizations[] = $this->PrintShopConfigRealizationTime->set($optionID, $volume, $days);
            }
        }

        $newPrices = array();
        foreach ($allOptions as $o) {
            $oldOptionID = $o['ID'];
            $this->PrintShopConfigPrice->setAttrID($attrID);
            $this->PrintShopConfigPrice->setOptID($o['ID']);

            $controllers = $this->PrintShopConfigPrice->countByController();
            if (empty($controllers)) {
                continue;
            }
            foreach ($controllers as $co) {
                $this->PrintShopConfigPrice->setControllerID($co['controllerID']);

                $this->PrintShopConfigPrice->setAttrID($attrID);
                $this->PrintShopConfigPrice->setOptID($o['ID']);
                $oldPrices = $this->PrintShopConfigPrice->getAll();

                $this->PrintShopConfigPrice->setAttrID($newAttrID);
                $this->PrintShopConfigPrice->setOptID($newOptionIDs[$o['ID']]);
                foreach ($oldPrices as $op) {
                    $newPrices[$oldOptionID] = $this->PrintShopConfigPrice->customCreate(
                        $op['amount'],
                        $op['value'],
                        $op['priceType'],
                        $op['expense']
                    );
                }
            }
        }

        $newDetailPrices = array();
        foreach ($allOptions as $o) {
            $this->PrintShopConfigDetailPrice->setAttrID($attrID);
            $this->PrintShopConfigDetailPrice->setOptID($o['ID']);
            $details = $this->PrintShopConfigDetailPrice->getAll();
            if (empty($details)) {
                continue;
            }
            foreach ($details as $d) {
                $this->PrintShopConfigDetailPrice->setAttrID($newAttrID);
                $this->PrintShopConfigDetailPrice->setOptID($newOptionIDs[$o['ID']]);
                $this->PrintShopConfigDetailPrice->setControllerID($d['controllerID']);
                $newDetailPrices[$d['ID']] = $this->PrintShopConfigDetailPrice->createAll($d['minPrice'], $d['basePrice'], $d['startUp']);
            }
        }

        $newExclusions = array();

        foreach ($allOptions as $o) {
            $this->PrintShopConfigExclusion->setAttrID($attrID);
            $this->PrintShopConfigExclusion->setOptID($o['ID']);
            $exclusions = $this->PrintShopConfigExclusion->getAll();
            foreach ($exclusions as $ex) {
                $this->PrintShopConfigExclusion->setAttrID($newAttrID);
                $this->PrintShopConfigExclusion->setOptID($newOptionIDs[$o['ID']]);
                $newExclusions[] = $this->PrintShopConfigExclusion->customCreate($ex['excAttrID'], $ex['excOptID']);
            }
        }

        $newIncreases = array();
        foreach ($allOptions as $o) {
            $this->PrintShopConfigIncrease->setAttrID($attrID);
            $this->PrintShopConfigIncrease->setOptID($o['ID']);

            $increaseControllers = $this->PrintShopConfigIncrease->countByController();

            if (!empty($increaseControllers)) {
                foreach ($increaseControllers as $co) {

                    $this->PrintShopConfigIncrease->setControllerID($co['controllerID']);
                    $this->PrintShopConfigIncrease->setAttrID($attrID);
                    $this->PrintShopConfigIncrease->setOptID($o['ID']);
                    $oldIncreases = $this->PrintShopConfigIncrease->getAll();

                    $this->PrintShopConfigIncrease->setAttrID($newAttrID);
                    $this->PrintShopConfigIncrease->setOptID($newOptionIDs[$o['ID']]);
                    foreach ($oldIncreases as $oi) {
                        $newIncreases[] = $this->PrintShopConfigIncrease->customCreate(
                            $oi['amount'],
                            $oi['value'],
                            $oi['increaseType']
                        );
                    }
                }
            }
        }

        /**
         * @TODO this should be in loop - to fix
         */
        $this->PrintShopConfigPaperPrice->setOptID($o['ID']);

        $paperPrices = $this->PrintShopConfigPaperPrice->getAll();
        $this->PrintShopConfigPaperPrice->setOptID($newOptionIDs[$o['ID']]);
        $newPaperPrices = array();

        if (!empty($paperPrices)) {
            foreach ($paperPrices as $pp) {
                $newPaperPrices[] = $this->PrintShopConfigPaperPrice->customCreate($pp['price'], $pp['expense'], $pp['amount']);
            }
        }

        $newOperations = array();
        foreach ($allOptions as $o) {
            $operations = $this->OperationOption->getSelectedOperations($o['ID']);
            foreach ($operations as $op) {
                $params['optionID'] = $newOptionIDs[$o['ID']];
                $params['operationID'] = $op['operationID'];
                $newOperations[] = $this->OperationOption->create($params);
            }
        }

        $names = $this->PrintShopConfigAttributeLang->get('attributeID', $attrID);
        foreach ($names as $name) {
            $this->PrintShopConfigAttributeLang->set($name['lang'], $name['name'], $newAttrID);
        }

        foreach ($allOptions as $o) {
            $names = $this->PrintShopConfigOptionLang->get('optionID', $o['ID']);
            foreach ($names as $name) {
                $this->PrintShopConfigOptionLang->set($name['lang'], $name['name'], $newOptionIDs[$o['ID']]);
            }
        }

        $data['info'] = 'End copy!';
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function checkCustomNames($typeID)
    {
        $count = $this->PrintShopAttributeName->countByType($typeID);
        if (!$count) {
            $count = array();
        }
        return $count;
    }

    /**
     * @param $typeID
     * @return array
     */
    public function getAttributeSettings($typeID)
    {
        $list = $this->PrintShopProductAttributeSetting->get('typeID', $typeID, true);

        if (!$list) {
            return array();
        }

        $result = array();
        foreach ($list as $row) {
            $result[$row['attrID']] = $row;
        }

        return $result;
    }

}
