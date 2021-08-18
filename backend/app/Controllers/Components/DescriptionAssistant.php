<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescription;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescriptionFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopTypePattern;
use DreamSoft\Models\PrintShopProduct\PrintShopType;

/**
 * Class DescriptionAssistant
 * @package DreamSoft\Controllers\Components
 */
class DescriptionAssistant extends Component
{
    /**
     * @var PrintShopTypeDescription
     */
    private $PrintShopTypeDescription;
    /**
     * @var PrintShopTypePattern
     */
    private $PrintShopTypePattern;
    /**
     * @var PrintShopTypeDescriptionFormat
     */
    private $PrintShopTypeDescriptionFormat;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var string
     */
    private $fileFolder;
    /**
     * @var string
     */
    private $thumbFolder;
    /**
     * @var string
     */
    private $croppedFolder;

    /**
     * DescriptionAssistant constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->PrintShopTypeDescription = PrintShopTypeDescription::getInstance();
        $this->PrintShopTypePattern = PrintShopTypePattern::getInstance();
        $this->PrintShopTypeDescriptionFormat = PrintShopTypeDescriptionFormat::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->fileFolder = 'uploadedFiles/';
        $this->thumbFolder = 'uploadedFiles/' . companyID . '/thumbs/';
        $this->croppedFolder = 'uploadedFiles/' . companyID . '/cropped/';
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array|mixed
     */
    public function getTypeDescriptions($groupID, $typeID)
    {
        $this->PrintShopType->setGroupID($groupID);
        $data_resp = $this->PrintShopTypeDescription->customGetAll($typeID);
        $data = $this->prepareData($data_resp);

        $descriptions = array();
        $descPatternArr = array();
        foreach ($data as $row) {
            $descriptions[] = $row['descID'];
            if ($row['descType'] == 7) {
                $descPatternArr[] = $row['descID'];
            }
        }

        $patterns = array();

        if (!empty($descPatternArr)) {
            $patterns = $this->PrintShopTypePattern->getByList($typeID, $descPatternArr, lang);
        }

        $files = $this->PrintShopTypeDescription->getFilesByList($descriptions);
        if (!empty($files)) {
            foreach ($files as $descID => $fls) {
                foreach ($fls as $kf => $f) {
                    $files[$descID][$kf]['url'] = STATIC_URL . $this->fileFolder . companyID . '/' . $f['path'];
                    $files[$descID][$kf]['urlCrop'] = STATIC_URL . $this->thumbFolder . $f['path'];
                }
            }
        }

        $formats = $this->PrintShopTypeDescriptionFormat->getForDescList($descriptions);
        foreach ($data as $key => $row) {
            if (isset($formats[$row['descID']])) {
                $data[$key]['formats'] = $formats[$row['descID']];
            } else {
                $data[$key]['formats'] = array();
            }
            if (isset($files[$row['descID']])) {
                $data[$key]['files'] = $files[$row['descID']];
            }

            if ($row['descType'] == 7) {
                $data[$key]['patterns'] = $patterns[$row['descID']];
            }

        }


        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $data_resp
     * @return mixed
     */
    private function prepareData($data_resp)
    {
        $data = array();
        foreach ($data_resp as $key => $gd) {
            $descID = $gd['descID'];
            $curLang = $gd['lang'];
            $data[$descID]['ID'] = $gd['ID'];
            $data[$descID]['typeID'] = $gd['typeID'];
            $data[$descID]['descID'] = $gd['descID'];
            $data[$descID]['order'] = $gd['order'];
            $data[$descID]['langs'][$curLang]['name'] = $gd['name'];
            $data[$descID]['langs'][$curLang]['description'] = $gd['description'];
            $data[$descID]['descType'] = $gd['descType'];
            $data[$descID]['isOpen'] = intval($gd['visible']) === 1 ? true : false;
            $data[$descID]['visible'] = $gd['visible'];
            $countFormats = $this->PrintShopTypeDescription->countFormats($descID);
            $data[$descID]['countFormats'] = $countFormats;
        }
        $data = array_values($data);

        return $data;
    }
}