<?php
/**
 * Programista Rafał Leśniak - 31.3.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-03-2017
 * Time: 13:03
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\Discount\Discount;
use DreamSoft\Models\Discount\DiscountGroup;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\User\UserOption;

class DiscountCalculation extends Component
{
    public $useModels = array();

    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var DiscountGroup
     */
    protected $DiscountGroup;
    /**
     * @var Discount
     */
    protected $Discount;
    /**
     * @var UserDiscountGroup
     */
    protected $UserDiscountGroup;

    private $discounts = false;
    private $selectedDiscount;
    /**
     * @var int
     */
    private $domainID;
    
    /**
     * Discount constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->UserOption = UserOption::getInstance();
        $this->DiscountGroup = DiscountGroup::getInstance();
        $this->Discount = Discount::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
    }

    /**
     * @param mixed $selectedDiscount
     */
    public function setSelectedDiscount($selectedDiscount)
    {
        $this->selectedDiscount = $selectedDiscount;
    }

    /**
     * @return mixed
     */
    public function getSelectedDiscount()
    {
        return $this->selectedDiscount;
    }

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
        $this->UserDiscountGroup->setDomainID($domainID);
    }

    /**
     * @param $volume
     * @param null $meters
     * @return bool|mixed
     */
    public function calculate($volume, $meters = NULL)
    {
        $bestDiscounts = $this->getSelectedDiscount();

        $results['byVolume'] = $this->matchingByVolume($bestDiscounts, $volume);

        $results['byMeters'] = array();
        if( $meters > 0 ) {
            $results['byMeters'] = $this->matchingByMeters($bestDiscounts, $meters);
        }

        if (!empty($results['byMeters'])) {
            return max($results['byMeters']);
        }
        if (!empty($results['byVolume'])) {
            return max($results['byVolume']);
        }

        $results['byEmpty'] = $this->matchingEmpty($bestDiscounts);

        if(!empty($results['byEmpty'])) {
            return max($results['byEmpty']);
        }

        return false;
    }

    /**
     * @param $userID
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return bool
     */
    public function searchBestDiscounts( $userID, $groupID, $typeID, $formatID )
    {
        $discounts = array();

        if (!$this->discounts) {
            $discounts = $this->getMatchingDiscounts($userID, $groupID, $typeID, $formatID);

            if (!$discounts) {
                return false;
            }
            $this->discounts = $discounts;
        }

        $this->setSelectedDiscount( $this->selectBestDiscounts($discounts) );
    }

    /**
     * @param $discounts
     * @param $volume
     * @return array
     */
    private function matchingByVolume($discounts, $volume)
    {
        if( !$discounts ) {
            return array();
        }

        $results = array();

        foreach ($discounts as $discount) {
            $validRange = false;
            if ($discount['qty_end'] != NULL) {
                $discount['qty_end'] = intval($discount['qty_end']);
            }
            if ($discount['qty_start'] != NULL) {
                $discount['qty_start'] = intval($discount['qty_start']);
            }
            if ($volume >= $discount['qty_start'] && $volume <= $discount['qty_end']) {
                $validRange = true;
            } elseif ($discount['qty_start'] == NULL && $volume <= $discount['qty_end']) {
                $validRange = true;
            } elseif ($volume >= $discount['qty_start'] && $discount['qty_end'] == NULL
                && $discount['qty_start'] !== NULL) {
                $validRange = true;
            } else {
                $validRange = false;
            }

            if ($validRange) {
                $results[] = $discount['percentage'];
            }
        }

        return $results;
    }

    /**
     * @param $discounts
     * @param $meters
     * @return array
     * @internal param $volume
     */
    private function matchingByMeters($discounts, $meters)
    {
        if( !$discounts ) {
            return array();
        }
        $results = array();

        foreach ($discounts as $discount) {

            $validRange = false;

            if ($discount['meters_end'] != NULL) {
                $discount['meters_end'] = intval($discount['meters_end']);
            }
            if ($discount['meters_start'] != NULL) {
                $discount['meters_start'] = intval($discount['meters_start']);
            }
            if ($meters >= $discount['meters_start'] && $meters <= $discount['meters_end']) {
                $validRange = true;
            } elseif ($discount['meters_start'] == NULL && $meters <= $discount['meters_end']) {
                $validRange = true;
            } elseif ($meters >= $discount['meters_start'] && $discount['meters_end'] == NULL
                && $discount['meters_start'] !== NULL) {
                $validRange = true;
            } else {
                $validRange = false;
            }

            if ($validRange) {
                $results[] = $discount['percentage'];
            }
        }

        return $results;
    }

    /**
     * @param $discounts
     * @return array
     */
    private function matchingEmpty($discounts)
    {

        if( !$discounts ) {
            return array();
        }

        $results = array();

        foreach ($discounts as $discount) {
            if ($discount['meters_start'] == NULL && $discount['meters_end'] == NULL &&
                $discount['qty_start'] == NULL && $discount['qty_end'] == NULL
            ) {
                $results[] = $discount['percentage'];
            }
        }

        return $results;
    }

    /**
     * @param $discounts
     * @return array
     */
    private function selectBestDiscounts($discounts)
    {

        $match = $this->searchBy($discounts, 'productFormatID');

        if (empty($match)) {
            $match = $this->searchBy($discounts, 'productTypeID');
        }

        if (empty($match)) {
            $match = $this->searchBy($discounts, 'productGroupID');
        }

        if (empty($match)) {
            return $discounts;
        }

        return $match;
    }

    /**
     * @param $discounts
     * @param $key
     * @return array
     */
    private function searchBy($discounts, $key)
    {
        if( !$discounts ) {
            return array();
        }

        $result = array();
        foreach ($discounts as $discount) {
            if (intval($discount[$key]) > 0) {
                $result[] = $discount;
            }
        }

        return $result;
    }

    /**
     * @param $userID
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return bool
     */
    private function getMatchingDiscounts($userID, $groupID, $typeID, $formatID)
    {
        $discountGroups = $this->UserDiscountGroup->getByUser($userID);

        if (!$discountGroups) {
            return false;
        }

        $aggregateDiscountGroups = array();

        foreach ($discountGroups as $discountGroup) {
            $aggregateDiscountGroups[] = $discountGroup['discountGroupID'];
        }

        $discounts = $this->Discount->getByParams($aggregateDiscountGroups, $groupID, $typeID, $formatID);

        return $discounts;
    }
}