<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 29.01.19
 * Time: 13:18
 */

namespace DreamSoft\Controllers\Components;


use DreamSoft\Core\Component;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopPrintTypeWorkspace;
use DreamSoft\Models\PrintShop\PrintShopComplex;
use DreamSoft\Models\PrintShop\PrintShopComplexRelatedFormat;

class FormatAssistant extends Component
{
    /**
     * @var PrintShopFormat
     */
    private $PrintShopFormat;
    /**
     * @var LangSetting
     */
    private $LangSetting;
    /**
     * @var Standard
     */
    private $Standard;
    /**
     * @var PrintShopPrintTypeWorkspace
     */
    private $PrintShopPrintTypeWorkspace;
    /**
     * @var PrintShopComplex
     */
    private $PrintShopComplex;
    /**
     * @var PrintShopComplexRelatedFormat
     */
    private $PrintShopComplexRelatedFormat;

    /**
     * FormatAssistant constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Standard = Standard::getInstance();
        $this->PrintShopPrintTypeWorkspace = PrintShopPrintTypeWorkspace::getInstance();
        $this->PrintShopComplex = PrintShopComplex::getInstance();
        $this->PrintShopComplexRelatedFormat = PrintShopComplexRelatedFormat::getInstance();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $complexID
     * @param null $ID
     * @param int $public
     * @return mixed
     */
    public function formats($groupID, $typeID, $complexID = NULL, $ID = NULL, $public = 0)
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
                        $data = $this->Standard->convertToCentimeter($data, $key, 'height');
                        $data = $this->Standard->convertToCentimeter($data, $key, 'width');
                        $data = $this->Standard->convertToCentimeter($data, $key, 'slope');

                        $data = $this->Standard->convertToCentimeter($data, $key, 'maxHeight');
                        $data = $this->Standard->convertToCentimeter($data, $key, 'maxWidth');
                        $data = $this->Standard->convertToCentimeter($data, $key, 'minHeight');
                        $data = $this->Standard->convertToCentimeter($data, $key, 'minWidth');
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
     * @param $formats
     * @return mixed
     */
    public function fillWithDefaultLangName($formats)
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
                    if($printTypeWorkspaces[$row['ID']][$printType['printTypeID']]) {
                        $data[$formatKey]['printTypes'][$printTypeKey]['printTypeWorkspaceExist'] = true;
                    }
                }
            }
        }

        return $data;
    }

    private function getSelectedOptions()
    {

    }
}