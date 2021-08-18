<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatName;
use DreamSoft\Models\PrintShopProduct\PrintShopPreFlight;
use DreamSoft\Models\PrintShopProduct\PrintShopPrintTypeWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintType;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Models\PrintShop\PrintShopComplex;
use DreamSoft\Models\PrintShop\PrintShopComplexRelatedFormat;

/**
 * Description of FormatsController
 *
 * @author Rafał
 */
class FormatsController extends Controller
{
    public $useModels = array(
        'LangSetting'
    );

    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var PrintShopFormatName
     */
    protected $PrintShopFormatName;
    /**
     * @var PrintShopConfigPrintType
     */
    protected $PrintShopConfigPrintType;
    /**
     * @var PrintShopPreFlight
     */
    protected $PrintShopPreFlight;
    /**
     * @var PrintShopFormatLanguage
     */
    protected $PrintShopFormatLanguage;
    /**
     * @var PrintShopComplexRelatedFormat
     */
    protected $PrintShopComplexRelatedFormat;
    /**
     * @var PrintShopComplex
     */
    protected $PrintShopComplex;
    /**
     * @var PrintShopPrintTypeWorkspace
     */
    private $PrintShopPrintTypeWorkspace;
    /**
     * @var Standard
     */
    private $Standard;

    /**
     * FormatsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopFormatLanguage = PrintShopFormatLanguage::getInstance();
        $this->PrintShopConfigPrintType = PrintShopConfigPrintType::getInstance();
        $this->PrintShopPreFlight = PrintShopPreFlight::getInstance();
        $this->PrintShopComplexRelatedFormat = PrintShopComplexRelatedFormat::getInstance();
        $this->PrintShopComplex = PrintShopComplex::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->PrintShopFormatName = PrintShopFormatName::getInstance();
        $this->PrintShopPrintTypeWorkspace = PrintShopPrintTypeWorkspace::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @param $ID
     */
    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->LangSetting->setDomainID($ID);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $complexID
     * @param null $ID
     * @param int $public
     * @return array|bool|mixed
     */
    private function _formats($groupID, $typeID, $complexID = NULL, $ID = NULL, $public = 0)
    {

        $this->PrintShopFormat->setGroupID($groupID);
        $this->PrintShopFormat->setTypeID($typeID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopFormat->getOne($ID);
        } else {
            if ($public == 1) {
                $active = 1;
            } else {
                $active = NULL;
            }
            $data = $this->PrintShopFormat->getAll($active);

            $allIDs = array();
            if (!empty($data)) {

                $data = $this->fillWithDefaultLangName($data);

                foreach ($data as $key => $val) {
                    $allIDs[] = $val['ID'];

                    $exp = explode(';', $val['printTypesList']);
                    if (!empty($exp) && is_array($exp)) {
                        foreach ($exp as $e) {
                            $minVolume = NULL;
                            $maxVolume = NULL;
                            if (strlen($e) == 0) continue;
                            $exp2 = explode(':', $e);
                            if (!empty($exp2) && is_array($exp2)) {
                                if (isset($exp2[1]) && !empty($exp2[1])) {
                                    $exp3 = explode('-', $exp2[1]);
                                    if (isset($exp3) && !empty($exp3)) {
                                        $minVolume = $exp3[0];
                                        $maxVolume = $exp3[1];
                                    }
                                }
                                $data[$key]['printTypes'][] = array(
                                    'printTypeID' => $exp2[0],
                                    'minVolume' => $minVolume,
                                    'maxVolume' => $maxVolume
                                );
                                unset($minVolume);
                                unset($maxVolume);
                            }
                        }
                    }
                    if (empty($data[$key]['printTypes'])) {
                        $data[$key]['printTypes'] = array();
                    }
                    if( $val['unit'] == 2 ) {
                        $data = $this->convertToCentimeter($data, $key, 'height');
                        $data = $this->convertToCentimeter($data, $key, 'width');
                        $data = $this->convertToCentimeter($data, $key, 'slope');

                        $data = $this->convertToCentimeter($data, $key, 'maxHeight');
                        $data = $this->convertToCentimeter($data, $key, 'maxWidth');
                        $data = $this->convertToCentimeter($data, $key, 'minHeight');
                        $data = $this->convertToCentimeter($data, $key, 'minWidth');
                    }
                    unset($data[$key]['printTypesList']);
                }

                $data = $this->checkPrintTypeWorkspacesExist($data);

                $complex = $this->PrintShopComplex->getBase($complexID);

                if ($complex) {
                    $typesComplex = $this->PrintShopComplex->getByBaseID($complex['baseID'], $complex['complexGroupID']);

                    $typesArr = array();
                    if ($typesComplex) {
                        foreach ($typesComplex as $tc) {
                            if ($tc['typeID'] != $typeID) {
                                $typesArr[] = $tc['typeID'];
                            }
                        }
                    }

                    $relatedFormats = $this->PrintShopComplexRelatedFormat->getByBaseFormatIDs($allIDs, $typesArr, $complex['ID']);
                    if (!empty($relatedFormats)) {
                        $rf = array();
                        foreach ($relatedFormats as $relatedFormat) {
                            $formatID = $relatedFormat['baseFormatID'];
                            if (!isset($rf[$formatID])) {
                                $rf[$formatID] = array();
                            }
                            $rf[$formatID][] = $relatedFormat;
                        }
                        foreach ($data as $key => $val) {
                            if (!isset($rf[$val['ID']])) continue;
                            $data[$key]['relatedFormats'] = $rf[$val['ID']];
                        }
                    }
                }
            }
        }
        return $data;
    }

    /**
     * @param $data
     * @param $key
     * @param $name
     * @return mixed
     */
    private function convertToCentimeter($data, $key, $name)
    {
        if( intval($data[$key][$name]) > 0 ) {
            $data[$key][$name] /= 10;
        }
        return $data;
    }

    /**
     * @param $data
     * @return mixed
     */
    private function checkPrintTypeWorkspacesExist($data) {

        if( !$data ) {
            return $data;
        }

        $formatsAggregate = array();
        $printTypesAggregate = array();
        foreach ($data as $row) {
            if( $row['ID'] && !in_array($row['ID'], $formatsAggregate) ) {
                $formatsAggregate[] = $row['ID'];
            }
            if( $row['printTypes'] ) {
                foreach ($row['printTypes'] as $printType) {
                    if( $printType['printTypeID'] && !in_array($printType['printTypeID'], $printTypesAggregate) ) {
                        $printTypesAggregate[] = $printType['printTypeID'];
                    }
                }
            }
        }

        $printTypeWorkspaces = $this->PrintShopPrintTypeWorkspace->getByAggregateData(
            $printTypesAggregate,
            $formatsAggregate
        );

        foreach ($data as $formatKey => $row) {
            if( $row['printTypes'] ) {
                foreach ($row['printTypes'] as $printTypeKey => $printType) {
                    $data[$formatKey]['printTypes'][$printTypeKey]['printTypeWorkspaceExist'] = false;
                    if( is_array($printTypeWorkspaces) &&
                        array_key_exists($row['ID'], $printTypeWorkspaces) &&
                        $printTypeWorkspaces[$row['ID']] &&
                        array_key_exists($printType['printTypeID'], $printTypeWorkspaces[$row['ID']]) &&
                        $printTypeWorkspaces[$row['ID']][$printType['printTypeID']]) {
                        $data[$formatKey]['printTypes'][$printTypeKey]['printTypeWorkspaceExist'] = true;
                    }
                }
            }
        }

        return $data;
    }

    /**
     * @param $formats
     * @return mixed
     */
    private function fillWithDefaultLangName($formats)
    {

        $languages = $this->LangSetting->getAll();

        if ($languages) {
            $activeLanguages = array();
            foreach ($languages as $lang) {
                if ($lang['active'] == 1) {
                    $activeLanguages[] = $lang;
                }
            }

            if (!empty($activeLanguages)) {
                foreach ($formats as $key => $format) {
                    foreach ($activeLanguages as $al) {
                        if (!isset($format['langs'][$al['code']]) || empty($format['langs'][$al['code']])) {
                            $formats[$key]['langs'][$al['code']]['name'] = $format['name'];
                        }
                    }
                }
            }
        }

        return $formats;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $ID
     * @return array|bool|mixed
     */
    public function formats($groupID, $typeID, $ID = NULL)
    {

        $data = $this->_formats($groupID, $typeID, NULL, $ID, 0);

        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $complexID
     * @param null $ID
     * @return array|bool|mixed
     */
    public function formatsPublic($groupID, $typeID, $complexID, $ID = NULL)
    {

        $data = $this->_formats($groupID, $typeID, $complexID, $ID, 1);

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
    public function post_formats($groupID, $typeID)
    {
        $this->PrintShopFormat->setGroupID($groupID);
        $this->PrintShopFormat->setTypeID($typeID);

        $name = $this->Data->getPost('name');
        $adminName = $this->Data->getPost('adminName');
        $width = $this->Data->getPost('width');
        $height = $this->Data->getPost('height');
        $slope = $this->Data->getPost('slope');
        $custom = $this->Data->getPost('custom');
        $interchangeability = $this->Data->getPost('interchangeability');
        if (!$interchangeability) {
            $interchangeability = 0;
        }

        $minWidth = $this->Data->getPost('minWidth');
        $minHeight = $this->Data->getPost('minHeight');
        $maxWidth = $this->Data->getPost('maxWidth');
        $maxHeight = $this->Data->getPost('maxHeight');
        $netWidth = $this->Data->getPost('netWidth');
        $netHeight = $this->Data->getPost('netHeight');
        $slopeExternalFront = $this->Data->getPost('slopeExternalFront');
        $slopeExternalBack = $this->Data->getPost('slopeExternalBack');
        $slopeExternalTop = $this->Data->getPost('slopeExternalTop');
        $slopeExternalBottom = $this->Data->getPost('slopeExternalBottom');
        $addRidgeThickness = $this->Data->getPost('addRidgeThickness');
        $wingtipFront = $this->Data->getPost('wingtipFront');
        $wingtipFrontMin = $this->Data->getPost('wingtipFrontMin');
        $wingtipBack = $this->Data->getPost('wingtipBack');
        $wingtipBackMin = $this->Data->getPost('wingtipBackMin');
        $maximumTotalGrossWidth = $this->Data->getPost('maximumTotalGrossWidth');

        $names = $this->Data->getPost('names');
        $unit = $this->Data->getPost('unit');

        $width = $this->Standard->normalizeLength($width, $unit);
        $height = $this->Standard->normalizeLength($height, $unit);
        $minWidth = $this->Standard->normalizeLength($minWidth, $unit);
        $minHeight = $this->Standard->normalizeLength($minHeight, $unit);
        $maxWidth = $this->Standard->normalizeLength($maxWidth, $unit);
        $maxHeight = $this->Standard->normalizeLength($maxHeight, $unit);
        $slope = $this->Standard->normalizeLength($slope, $unit);
        $netWidth = $this->Standard->normalizeLength($netWidth, $unit);
        $netHeight = $this->Standard->normalizeLength($netHeight, $unit);
        $slopeExternalFront = $this->Standard->normalizeLength($slopeExternalFront, $unit);
        $slopeExternalBack = $this->Standard->normalizeLength($slopeExternalBack, $unit);
        $slopeExternalTop = $this->Standard->normalizeLength($slopeExternalTop, $unit);
        $slopeExternalBottom = $this->Standard->normalizeLength($slopeExternalBottom, $unit);
        $wingtipFront = $this->Standard->normalizeLength($wingtipFront, $unit);
        $wingtipFrontMin = $this->Standard->normalizeLength($wingtipFrontMin, $unit);
        $wingtipBack = $this->Standard->normalizeLength($wingtipBack, $unit);
        $wingtipBackMin = $this->Standard->normalizeLength($wingtipBackMin, $unit);
        $maximumTotalGrossWidth = $this->Standard->normalizeLength($maximumTotalGrossWidth, $unit);

        if (!$custom) {
            $custom = 0;
        }
        if (!$adminName) {
            $adminName = NULL;
        }

        if (($name || $names) && $slope !== NULL) {

            $lastID = $this->PrintShopFormat->createByParams($name, $adminName, $width, $height, $slope, $netWidth,
                $netHeight, $slopeExternalFront, $slopeExternalBack, $slopeExternalTop, $slopeExternalBottom, $wingtipFront,
                $addRidgeThickness, $wingtipFrontMin, $wingtipBack, $wingtipBackMin, $maximumTotalGrossWidth, $interchangeability, $custom);
            if ($custom) {
                $this->PrintShopFormat->createCustom($lastID, $minWidth, $minHeight, $maxWidth, $maxHeight);
            }

            $return = $this->PrintShopFormat->customGet($lastID);
            if (!$return) {
                $return['response'] = false;
            }
            if (!empty($names)) {
                $return['names'] = array();
                foreach ($names as $lang => $name) {
                    $res = $this->PrintShopFormatLanguage->set($lang, $name, $lastID);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                    $return['langs'][$lang]['name'] = $name;
                }
            }
            if( $return && $unit > 1 ) {
                $this->PrintShopFormat->update($lastID, 'unit', $unit);
                $return['unit'] = $unit;
                $return = $this->convertEntityToCentimeter($return, 'width');
                $return = $this->convertEntityToCentimeter($return, 'height');
                $return = $this->convertEntityToCentimeter($return, 'maxHeight');
                $return = $this->convertEntityToCentimeter($return, 'maxWidth');
                $return = $this->convertEntityToCentimeter($return, 'minHeight');
                $return = $this->convertEntityToCentimeter($return, 'minWidth');
                $return = $this->convertEntityToCentimeter($return, 'slope');
                $return = $this->convertEntityToCentimeter($return, 'netWidth');
                $return = $this->convertEntityToCentimeter($return, 'netHeight');
                $return = $this->convertEntityToCentimeter($return, 'slopeExternalFront');
                $return = $this->convertEntityToCentimeter($return, 'slopeExternalBack');
                $return = $this->convertEntityToCentimeter($return, 'slopeExternalTop');
                $return = $this->convertEntityToCentimeter($return, 'slopeExternalBottom');
                $return = $this->convertEntityToCentimeter($return, 'wingtipFront');
                $return = $this->convertEntityToCentimeter($return, 'wingtipFrontMin');
                $return = $this->convertEntityToCentimeter($return, 'wingtipBack');
                $return = $this->convertEntityToCentimeter($return, 'wingtipBackMin');
                $return = $this->convertEntityToCentimeter($return, 'maximumTotalGrossWidth');
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }


    

    /**
     * @param $entity
     * @param $field
     * @return mixed
     */
    private function convertEntityToCentimeter($entity, $field)
    {
        if( intval($entity[$field]) > 0 ) {
            $entity[$field] /= 10;
        }
        return $entity;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function put_formats($groupID, $typeID)
    {

        $this->PrintShopFormat->setGroupID($groupID);
        $this->PrintShopFormat->setTypeID($typeID);

        $post = $this->Data->getAllPost();

        $names = $post['langs'];
        unset($post['langs']);

        $goodKeys = array(
            'name',
            'adminName',
            'width',
            'height',
            'slope',
            'custom',
            'interchangeability',
            'active',
            'unit',
            'netWidth',
            'netHeight',
            'slopeExternalFront',
            'slopeExternalBack',
            'slopeExternalTop',
            'slopeExternalBottom',
            'addRidgeThickness',
            'wingtipFront',
            'wingtipFrontMin',
            'wingtipBack',
            'wingtipBackMin',
            'maximumTotalGrossWidth'
        );
        $goodKeysCustom = array(
            'minWidth',
            'maxWidth',
            'minHeight',
            'maxHeight'
        );

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        unset($post['customID']);
        $custom = false;
        if (isset($post['custom']) && $post['custom']) {
            $custom = true;
        }

        $unit = $post['unit'];

        $res = false;
        foreach ($post as $key => $value) {
            if (in_array($key, $goodKeys)) {

                if( in_array($key, array('width',
                        'height',
                        'slope',
                        'netWidth',
                        'netHeight',
                        'slopeExternalFront',
                        'slopeExternalBack',
                        'slopeExternalTop',
                        'slopeExternalBottom',
                        'wingtipFront',
                        'wingtipFrontMin',
                        'wingtipBack',
                        'wingtipBackMin',
                        'maximumTotalGrossWidth')) && $unit == 2 ) {
                    $value *= 10;
                }
                if( $key === 'active' ) {
                    $value = intval($value);
                }

                $res = $this->PrintShopFormat->update($ID, $key, $value);
            }
            if (isset($custom) && in_array($key, $goodKeysCustom)) {

                if( in_array($key, $goodKeysCustom) && $unit == 2 ) {
                    $value *= 10;
                }

                $res = $this->PrintShopFormat->updateCustom($ID, $key, $value);
            }
        }

        if ($res) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                if (strlen($name['name']) == 0) {
                    continue;
                }
                $res = $this->PrintShopFormatLanguage->set($lang, $name['name'], $ID);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }
        return $return;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return mixed
     */
    public function patch_formats($groupID, $typeID, $formatID)
    {
        $printTypes = $this->Data->getPost('printTypes');
        $action = $this->Data->getPost('action');
        $data['response'] = false;

        $savedCounter = 0;
        if ($action == 'setPrintTypes') {

            if (!empty($printTypes)) {
                $this->PrintShopFormat->deletePrintTypes($formatID);
                foreach ($printTypes as $row) {
                    $lastID = $this->PrintShopFormat->createPrintType(
                        $formatID, $row['printTypeID'],
                        $row['minVolume'],
                        $row['maxVolume']
                    );
                    if( $lastID > 0 ) {
                        $savedCounter++;
                    }
                }
                if ($savedCounter > 0) {
                    $data['response'] = true;
                    $data['savedCounter'] = $savedCounter;
                }
            } else {
                if( $this->PrintShopFormat->deletePrintTypes($formatID) ) {
                    $data['response'] = true;
                    $data['info'] = 'removed_all';
                }
            }
        } else if ( $action == 'setPrintTypeWorkspaces' ) {

            $printTypeID = $this->Data->getPost('printTypeID');
            $workspaces = $this->Data->getPost('workspaces');

            if (!empty($workspaces)) {
                $this->PrintShopPrintTypeWorkspace->deleteByParams($printTypeID, $formatID);
                foreach ($workspaces as $row) {

                    $params = array();
                    $params['formatID'] = $formatID;
                    $params['printTypeID'] = $printTypeID;
                    $params['workspaceID'] = $row['workspaceID'];
                    $params['usePerSheet'] = $row['usePerSheet'];
                    $params['operationDuplication'] = $row['operationDuplication'];

                    $lastID = $this->PrintShopPrintTypeWorkspace->create($params);
                    if( $lastID > 0 ) {
                        $savedCounter++;
                    }
                }
                if ($savedCounter > 0) {
                    $data['response'] = true;
                    $data['savedCounter'] = $savedCounter;
                }
            } else {
                if( $this->PrintShopPrintTypeWorkspace->deleteByParams($printTypeID, $formatID) ) {
                    $data['response'] = true;
                    $data['info'] = 'removed_all';
                }
            }


        } else {
            $data['response'] = false;
        }

        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $ID
     * @return mixed
     */
    public function delete_formats($groupID, $typeID, $ID)
    {
        if (intval($ID) > 0) {
            if ($this->PrintShopFormat->customDelete($ID)) {
                $this->PrintShopFormat->deletePrintTypes($ID);
                $this->PrintShopPreFlight->delete('formatID', $ID);
                $data['response'] = true;

                if (!$this->PrintShopFormatLanguage->delete('ID', $ID)) {
                    $data = $this->sendFailResponse('09');
                    return $data;
                }
            } else {
                $data['response'] = false;
            }
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return mixed
     */
    public function patch_sortFormats()
    {
        $post = $this->Data->getAllPost();
        $this->Standard->setModel($this->PrintShopFormat);
        return $this->Standard->sort($post, $func = 'sort');
    }

    /**
     * @param $typeID
     * @return array
     */
    public function customName($typeID)
    {

        $customNames = $this->PrintShopFormatName->getByType($typeID);

        return $this->prepareCustomNames($customNames);
    }

    /**
     * @param $data
     * @return array
     */
    private function prepareCustomNames($data)
    {
        if( !$data ) {
            return array();
        }
        $list = array();
        foreach ($data as $row) {
            $list[$row['lang']] = $row['name'];
        }

        return $list;

    }

    /**
     * @param $typeID
     * @return mixed
     */
    public function patch_customName( $typeID )
    {
        $post = $this->Data->getAllPost();
        $return['response'] = false;

        if ($post['names'] === NULL) {
            $return = $this->sendFailResponse('02');
        }

        $updated = $saved = $deleted = 0;

        if( empty($post['names']) ) {
            $deleted += $this->PrintShopFormatName->delete('typeID', $typeID);
        }

        foreach ($post['names'] as $lang => $name) {
            $existFormatNameID = $this->PrintShopFormatName->nameExist($typeID, $lang);
            if ($existFormatNameID) {
                if( strlen($name) == 0 ) {
                    $deleted += $this->PrintShopFormatName->delete('ID', $existFormatNameID);
                } else {
                    $updated += $this->PrintShopFormatName->update($existFormatNameID, 'name', $name);
                }
            } else {
                $params['lang'] = $lang;
                $params['name'] = $name;
                $params['typeID'] = $typeID;
                $lastID = $this->PrintShopFormatName->create($params);
                if( $lastID > 0 ) {
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
            $customNames = $this->PrintShopFormatName->getByType($typeID);

            $return['customNames'] = $this->prepareCustomNames($customNames);
        } else {
            $return['response'] = false;
        }

        return $return;
    }


}
