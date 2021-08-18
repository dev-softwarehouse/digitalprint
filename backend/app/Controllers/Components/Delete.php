<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\PrintShop\PrintShopRealizationTime;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopIncrease;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShop\PrintShopRealizationTimeDetail;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopVolume;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Core\Component;
use Exception;

/**
 * Description of Delete
 *
 * @author Rafał
 */

class Delete extends Component
{

    public $useModels = array();
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var PrintShopVolume
     */
    protected $PrintShopVolume;
    /**
     * @var PrintShopOption
     */
    protected $PrintShopOption;
    /**
     * @var PrintShopIncrease
     */
    protected $PrintShopIncrease;
    /**
     * @var PrintShopRealizationTime
     */
    protected $PrintShopRealizationTime;
    /**
     * @var ProductCategory
     */
    protected $ProductCategory;
    /**
     * @var PrintShopRealizationTimeDetail
     */
    protected $PrintShopRealizationTimeDetail;

    /**
     * Delete constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopVolume = PrintShopVolume::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopIncrease = PrintShopIncrease::getInstance();
        $this->PrintShopRealizationTime = PrintShopRealizationTime::getInstance();
        $this->ProductCategory = ProductCategory::getInstance();
        $this->PrintShopRealizationTimeDetail = PrintShopRealizationTimeDetail::getInstance();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function deleteType($groupID, $typeID)
    {
        try {
            $data['response'] = $this->PrintShopType->delete('ID', $typeID);
            $deletedPages = $this->PrintShopPage->deleteByGroupType($groupID, $typeID);
            if ($deletedPages) {
                $data['infoDeletedPages'] = 'Deleted pages for group: ' . $groupID . '. and type: ' . $typeID;
            }
            $this->PrintShopFormat->setGroupID($groupID);
            $this->PrintShopFormat->setTypeID($typeID);
            $formats = $this->PrintShopFormat->getAll();
            $deletedFormatsVolume = false;
            if (!empty($formats)) {
                $deletedFormats = 0;
                foreach ($formats as $f) {
                    $deletedFormatsVolume = $this->PrintShopVolume->deleteFormatVolumes($f['ID']);
                    $deletedFormats += intval($this->PrintShopFormat->customDelete($f['ID']));
                }
                $data['infoDeletedFormats'] = 'Deleted ' . $deletedFormats . ' formats ';
                if ($deletedFormatsVolume) {
                    $data['infoDeletedFormatsVolumes'] = 'Deleted all formats volumes ';
                }
            }
            $deletedVolumes = $this->PrintShopVolume->deleteByGroupType($groupID, $typeID);
            if ($deletedVolumes) {
                $data['infoDeletedVolumes'] = 'Deleted volumes for group: ' . $groupID . '. and type: ' . $typeID;
            }
            $deletedOptions = $this->PrintShopOption->deleteByGroupType($groupID, $typeID);
            if ($deletedOptions) {
                $data['infoDeletedOptions'] = 'Deleted options for group: ' . $groupID . '. and type: ' . $typeID;
            }
            $deletedIncreases = $this->PrintShopIncrease->deleteByGroupType($groupID, $typeID);
            if ($deletedIncreases) {
                $data['infoDeletedIncreases'] = 'Deleted increases for group: ' . $groupID . '. and type: ' . $typeID;
            }

            $deletedRealisationTimeDetails = $this->PrintShopRealizationTimeDetail->delete('typeID', $typeID);

            if ($deletedRealisationTimeDetails) {
                $data['infoDeletedRealizationTimes'] = 'Deleted realization times details ';
            }

            $data['deletedProductCategoryLinks'] = $this->ProductCategory->deleteByItem($typeID, 2);

        } catch (Exception $ex) {
            $data['error'] = $ex->getMessage();
        }
        return $data;
    }

}
