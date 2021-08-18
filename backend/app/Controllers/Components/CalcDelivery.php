<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\Tax\Tax;
use DreamSoft\Core\Component;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Price\ConfPrice;
use Exception;

/**
 * Class CalcDelivery
 */
class CalcDelivery extends Component
{
    public $useModels = array();

    /**
     * @var Delivery
     */
    protected $Delivery;
    /**
     * @var ConfPrice
     */
    protected $ConfPrice;
    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Price
     */
    protected $Price;

    /**
     * CalcDelivery constructor.
     */
    public function __construct ()
    {
        parent::__construct();
        $this->Price = new Price();
        $this->Delivery = Delivery::getInstance();
        $this->ConfPrice = ConfPrice::getInstance();
        $this->Tax = Tax::getInstance();
        $this->Setting = Setting::getInstance();
    }

    /**
     * @param $deliveryID
     * @param $packageVolume
     * @param $productVolume
     * @param $productWeight
     * @param int $amount
     * @param array $calculation
     * @return array
     * @throws Exception
     */
    public function countDeliveryPrice( $deliveryID, $packageVolume, $productVolume, $productWeight,
                                        $amount = 1, $calculation = array() )
    {
        $delivery = $this->Delivery->get('ID', $deliveryID);

        if( !$delivery ) {
            throw new Exception('Empty delivery in productAddress');
        }

        $price = $this->ConfPrice->get( 'ID', $delivery['priceID'] );
        if( !$price ) {
            throw new Exception('Brak ceny w adresach produktu');
        }

        if( $amount > 1 ) {
            $productVolume *= intval($amount);
        }

        $unitQty = intval($price['UnitQty']);

        if( $unitQty <= 0 ) {
            throw new Exception('maximal_amount_of_products_out_of_range');
        }

        if( $price['price'] > 0 ) {

            $packageMaxWeight = $price['weight'];
            $unitPrice = $price['price'];
            $packagesNumber = 0;

            $pscWeight = $productWeight/$productVolume;
            $packageWeight = $packageVolume*$pscWeight;

            $packageVolume = intval($packageVolume);
            $packageWeight = floatval($packageWeight);
            $packageMaxWeight = floatval($packageMaxWeight);

            if( $packageVolume  <= $unitQty && $packageWeight <= $packageMaxWeight) {
                $packagesNumber = 1;
            } else if ( $packageVolume  > $unitQty && $packageWeight <= $packageMaxWeight ) {
                $divUnits = floor($packageVolume /$unitQty);
                $mod = $packageVolume  % $unitQty;
                if( $mod > 0 ) {
                    $divUnits++;
                }
                $packagesNumber = $divUnits;
            } else if( $packageVolume  <= $unitQty && $packageWeight > $packageMaxWeight ) {
                $divWeight = floor($packageWeight/$packageMaxWeight);
                $mod = fmod($packageWeight, $packageMaxWeight);
                if( $mod > 0 ) {
                    $divWeight++;
                }
                $packagesNumber = $divWeight;

            } else if( $packageVolume  > $unitQty && $packageWeight > $packageMaxWeight ) {

                $divUnits = floor($packageVolume /$unitQty);
                $mod = $packageVolume  % $unitQty;
                if($mod > 0) {
                    $divUnits++;
                }

                $newWeight = $packageWeight/$divUnits;

                if ($newWeight<=$packageMaxWeight){
                    $packagesNumber = $divUnits;
                } else {
                    $divWeight = floor($packageWeight / $packageMaxWeight);
                    $mod = fmod($packageWeight, $packageMaxWeight);
                    if($mod > 0) {
                        $divWeight++;
                    }
                    $packagesNumber = $divWeight;
                }

            }

            $result['taxID'] = $price['taxID'];

            if( $this->checkWeightFreeRange(
                $productWeight,
                $price['FS_WeightStart'],
                $price['FS_WeightEnd'])
            ) {
                $result['price'] = 0;
            } else if( !empty($calculation) &&
                array_key_exists('calculation', $calculation) &&
                $this->checkPriceFreeRange(
                $calculation['calculation']['price'],
                $price['FS_ValStart'],
                $price['FS_ValEnd']
                ) ) {
                $result['price'] = 0;
            } else {
                $result['price'] = $packagesNumber*$price['price'];
            }

            $result['taxID'] = $price['taxID'];

            return $result;
        }

        return array('price' => 0, 'taxID' => NULL);

    }

    /**
     * @param $weight
     * @param $weightMin
     * @param $weightMax
     * @return bool
     */
    private function checkWeightFreeRange($weight, $weightMin, $weightMax)
    {

        if (!$weightMin && !$weightMax) {
            return false;
        }

        if ($weightMin > 0 && !$weightMax) {
            if (floatval($weightMin) <= $weight) {
                return true;
            }
        }

        if (!$weightMin && $weightMax > 0) {
            if (floatval($weightMax) >= $weight) {
                return true;
            }
        }

        if (floatval($weightMin) <= $weight &&
            floatval($weightMax) >= $weight
        ) {
            return true;
        }

        return false;
    }

    /**
     * @param $price
     * @param $priceMin
     * @param $priceMax
     * @return bool
     */
    private function checkPriceFreeRange($price, $priceMin, $priceMax)
    {
        $price = floatval($price/100);

        if (!$priceMin && !$priceMax) {
            return false;
        }

        if ($priceMin > 0 && !$priceMax) {
            if (floatval($priceMin) <= $price) {
                return true;
            }
        }

        if ($priceMin === null && $priceMax > 0) {
            if (floatval($priceMax) >= $price) {
                return true;
            }
        }

        if (floatval($priceMin) <= $price &&
            floatval($priceMax) >= $price
        ) {
            return true;
        }

        return false;
    }



}