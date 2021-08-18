<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 27-06-2018
 * Time: 10:08
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\Promotion\Promotion;
use DreamSoft\Models\Upload\UploadFile;

/**
 * Class PromotionCalculation
 * @package DreamSoft\Controllers\Components
 */
class PromotionCalculation extends Component
{

    public $useModels = array();

    /**
     * @var Promotion
     */
    private $Promotion;
    /**
     * @var UploadFile
     */
    private $UploadFile;
    /**
     * @var Uploader
     */
    private $Uploader;
    /**
     * @var int
     */
    private $domainID;

    /**
     * @var array
     */
    private $promotions = false;
    /**
     * @var
     */
    private $selectedPromotions;
    /**
     * @var string
     */
    private $iconFolder;

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param int $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
        $this->Promotion->setDomainID($domainID);
    }

    /**
     * @param mixed $selectedPromotions
     */
    public function setSelectedPromotions($selectedPromotions)
    {
        $this->selectedPromotions = $selectedPromotions;
    }

    /**
     * @return mixed
     */
    public function getSelectedPromotions()
    {
        return $this->selectedPromotions;
    }

    /**
     * @return string
     */
    public function getIconFolder()
    {
        return $this->iconFolder;
    }

    /**
     * @param string $iconFolder
     */
    public function setIconFolder($iconFolder)
    {
        $this->iconFolder = $iconFolder;
    }

    /**
     * PromotionCalculation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Promotion = Promotion::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->setIconFolder('uploadedFiles/' . companyID . '/icons/');
    }

    /**
     * @param $volume
     * @param null $meters
     * @return bool|mixed
     */
    public function calculate($volume, $meters = NULL)
    {
        $bestPromotions = $this->getSelectedPromotions();

        $results['byVolume'] = $this->matchingByVolume($bestPromotions, $volume);

        $results['byMeters'] = array();
        if ($meters > 0) {
            $results['byMeters'] = $this->matchingByMeters($bestPromotions, $meters);
        }

        if (!empty($results['byMeters'])) {
            return max($results['byMeters']);
        }
        if (!empty($results['byVolume'])) {
            return max($results['byVolume']);
        }

        $results['byEmpty'] = $this->matchingEmpty($bestPromotions);

        if (!empty($results['byEmpty'])) {
            return max($results['byEmpty']);
        }

        return false;
    }


    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return bool
     */
    public function searchBestPromotions($groupID, $typeID, $formatID)
    {
        $promotions = array();

        if (!$this->promotions) {
            $promotions = $this->getMatchingPromotions($groupID, $typeID, $formatID);
            $promotions = $this->filterByTime($promotions);

            if (!$promotions) {
                return false;
            }
            $this->promotions = $promotions;
        }

        $this->setSelectedPromotions($this->selectBestPromotions($promotions));
    }

    /**
     * @param $promotions
     * @return array
     */
    private function selectBestPromotions($promotions)
    {

        $match = $this->searchBy($promotions, 'productFormatID');

        if (empty($match)) {
            $match = $this->searchBy($promotions, 'productTypeID');
        }

        if (empty($match)) {
            $match = $this->searchBy($promotions, 'productGroupID');
        }

        if (empty($match)) {
            return $promotions;
        }

        return $match;
    }

    /**
     * @param $promotions
     * @param $key
     * @return array
     */
    private function searchBy($promotions, $key)
    {
        if( !$promotions ) {
            return array();
        }
        $result = array();
        foreach ($promotions as $promotion) {
            if (intval($promotion[$key]) > 0) {
                $result[] = $promotion;
            }
        }

        return $result;
    }

    /**
     * @param $promotions
     * @param $volume
     * @return array
     */
    private function matchingByVolume($promotions, $volume)
    {
        if( !$promotions ) {
            return array();
        }

        $results = array();

        foreach ($promotions as $promotion) {

            $validRange = false;
            if ($promotion['qtyEnd'] != NULL) {
                $promotion['qtyEnd'] = intval($promotion['qtyEnd']);
            }
            if ($promotion['qtyStart'] != NULL) {
                $promotion['qtyStart'] = intval($promotion['qtyStart']);
            }
            if ($volume >= $promotion['qtyStart'] && $volume <= $promotion['qtyEnd']) {
                $validRange = true;
            } elseif ($promotion['qtyStart'] == NULL && $volume <= $promotion['qtyEnd']) {
                $validRange = true;
            } elseif ($volume >= $promotion['qtyStart'] && $promotion['qtyEnd'] == NULL
                && $promotion['qtyStart'] !== NULL) {
                $validRange = true;
            } else {
                $validRange = false;
            }

            if ($validRange) {
                $results[] = $promotion['percentage'];
            }
        }

        return $results;
    }

    /**
     * @param $promotions
     * @param $meters
     * @return array
     * @internal param $volume
     */
    private function matchingByMeters($promotions, $meters)
    {
        if( !$promotions ) {
            return array();
        }

        $results = array();

        foreach ($promotions as $promotion) {

            $validRange = false;

            if ($promotion['metersEnd'] != NULL) {
                $promotion['metersEnd'] = intval($promotion['metersEnd']);
            }
            if ($promotion['metersStart'] != NULL) {
                $promotion['metersStart'] = intval($promotion['metersStart']);
            }
            if ($meters >= $promotion['metersStart'] && $meters <= $promotion['metersEnd']) {
                $validRange = true;
            } elseif ($promotion['metersStart'] == NULL && $meters <= $promotion['metersEnd']) {
                $validRange = true;
            } elseif ($meters >= $promotion['metersStart'] && $promotion['metersEnd'] == NULL
                && $promotion['metersStart'] !== NULL) {
                $validRange = true;
            } else {
                $validRange = false;
            }

            if ($validRange) {
                $results[] = $promotion['percentage'];
            }
        }

        return $results;
    }

    /**
     * @param $promotions
     * @return array
     */
    private function matchingEmpty($promotions)
    {
        if( !$promotions ) {
            return array();
        }
        $results = array();

        foreach ($promotions as $promotion) {
            if ($promotion['metersStart'] == NULL && $promotion['metersEnd'] == NULL &&
                $promotion['qtyStart'] == NULL && $promotion['qtyEnd'] == NULL
            ) {
                $results[] = $promotion['percentage'];
            }
        }

        return $results;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return mixed
     */
    private function getMatchingPromotions($groupID, $typeID, $formatID)
    {
        $promotions = $this->Promotion->getByParams($groupID, $typeID, $formatID);

        return $promotions;
    }

    /**
     * @param $promotions
     * @return array
     */
    private function filterByTime($promotions)
    {
        if (!$promotions) {
            return array();
        }

        $filteredPromotions = array();

        foreach ($promotions as $promotion) {
            $stateValue = $this->checkPromotionState($promotion);
            if ($stateValue['state'] === PROMOTION_STATE_STARTED ||
                $stateValue['state'] === PROMOTION_STATE_PERMANENT) {
                $filteredPromotions[] = $promotion;
            }
        }

        return $filteredPromotions;
    }

    /**
     * @param $promotions
     * @return array
     */
    public function filterByTimeGlobal($promotions)
    {
        if (!$promotions) {
            return array();
        }

        $filteredPromotions = array();

        foreach ($promotions as $itemID => $itemPromotions) {

            foreach ($itemPromotions as $promotion) {
                $stateValue = $this->checkPromotionState($promotion);
                if ($stateValue['state'] === PROMOTION_STATE_STARTED ||
                    $stateValue['state'] === PROMOTION_STATE_PERMANENT) {

                    if( isset($filteredPromotions[$itemID]) && $filteredPromotions[$itemID]['percentage'] < $promotion['percentage'] ) {
                        $filteredPromotions[$itemID] = $promotion;
                    } else if(!isset($filteredPromotions[$itemID])) {
                        $filteredPromotions[$itemID] = $promotion;
                    }

                }
            }

        }

        return $filteredPromotions;
    }

    /**
     * @param $promotion
     * @return array
     */
    private function checkPromotionState($promotion)
    {
        if (!$promotion['timePromotion']) {
            return array(
                'state' => PROMOTION_STATE_PERMANENT
            );
        }

        $endTimeInSeconds = strtotime('+' . $promotion['duration'] . ' seconds', strtotime($promotion['startTime']));
        $startTimeInSeconds = strtotime($promotion['startTime']);

        $promotion['endTime'] = date('Y-m-d H:i:s', strtotime('+' . $promotion['duration'] . ' seconds', strtotime($promotion['startTime'])));

        if (!$promotion['repeat']) {
            if (time() >= $startTimeInSeconds && time() <= $endTimeInSeconds) {
                return array(
                    'state' => PROMOTION_STATE_STARTED,
                    'promotionEnd' => date('Y-m-d H:i:s', $endTimeInSeconds)
                );
            } else {
                return array(
                    'state' => PROMOTION_STATE_ENDED
                );
            }
        } else {
            if (time() >= $startTimeInSeconds && time() <= $endTimeInSeconds) {
                return array(
                    'state' => PROMOTION_STATE_STARTED,
                    'promotionEnd' => date('Y-m-d H:i:s', $endTimeInSeconds)
                );
            } else {
                return $this->checkIntervalPromotion($promotion, $startTimeInSeconds);
            }
        }
    }

    /**
     * @param $promotion
     * @param $start
     * @return array
     */
    private function checkIntervalPromotion($promotion, $start)
    {
        $endTimeInSeconds = strtotime('+' . $promotion['duration'] . ' seconds', $start);

        if (time() >= $start && time() <= $endTimeInSeconds) {
            return array(
                'state' => PROMOTION_STATE_STARTED,
                'promotionEnd' => date('Y-m-d H:i:s', $endTimeInSeconds)
            );
        } else if (time() >= $start) {
            $start = strtotime('+' . $promotion['repeatTime'] . ' seconds', $start);
            return $this->checkIntervalPromotion($promotion, $start);
        } else {
            return array(
                'state' => PROMOTION_STATE_PENDING,
                'promotionStart' => date('Y-m-d H:i:s', $start)
            );
        }
    }

    /**
     * @param $promotions
     * @return mixed
     */
    public function fillIcons($promotions)
    {
        $aggregateIcons = array();
        foreach ($promotions as $key => $promotion) {
            if ($promotion['iconID']) {
                $aggregateIcons[] = $promotion['iconID'];
            }
        }

        $icons = $this->UploadFile->getFileByList($aggregateIcons);

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $this->getIconFolder() . $icon['path'];
            }
        }

        foreach ($promotions as $key => $promotion) {
            if ($promotion['iconID']) {
                $promotions[$key]['icon'] = $icons[$promotion['iconID']];
            }
        }

        return $promotions;
    }

}