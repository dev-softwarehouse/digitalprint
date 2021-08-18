<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrice;

/**
 * Description of DetailPricesController
 *
 * @author Rafał
 */
class DetailPricesController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var
     */
    protected $Price;

    /**
     * DetailPricesController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param $attrID
     * @param $optionID
     * @param $controllerID
     * @return array|bool
     */
    public function detailPrices($attrID, $optionID, $controllerID)
    {

        $this->PrintShopConfigPrice->setControllerID($controllerID);
        $this->PrintShopConfigPrice->setAttrID($attrID);
        $this->PrintShopConfigPrice->setOptID($optionID);

        $result = $this->PrintShopConfigPrice->getDetailPrices();
        if (empty($result)) {
            $result = array();
        } else {
            $result['minPrice'] = $this->Price->getPriceToView($result['minPrice']);
            $result['basePrice'] = $this->Price->getPriceToView($result['basePrice']);
            $result['startUp'] = $this->Price->getPriceToView($result['startUp']);
            // $result['excluded'] też pobiera :)
        }
        return $result;
    }

    /**
     * @param $attrID
     * @param $optionID
     * @param $controllerID
     * @return array
     */
    public function patch_detailPrices($attrID, $optionID, $controllerID)
    {

        $minPrice = $this->Data->getPost('minPrice');
        $basePrice = $this->Data->getPost('basePrice');
        $startUp = $this->Data->getPost('startUp');
        $excluded = $this->Data->getPost('excluded');
        $printRotated = $this->Data->getPost('printRotated');

        if ($attrID > 0) {
            $this->PrintShopConfigPrice->setAttrID($attrID);
        } else {
            $return['response'] = false;
            return $return;
        }
        if ($optionID > 0) {
            $this->PrintShopConfigPrice->setOptID($optionID);
        } else {
            $return['response'] = false;
            return $return;
        }
        if ($controllerID > 0) {
            $this->PrintShopConfigPrice->setControllerID($controllerID);
        } else {
            $return['response'] = false;
            return $return;
        }

        $sum = 0;

        if (empty($minPrice)) {
            $minPrice = NULL;
        } else {
            $minPrice = $this->Price->getPriceToDb($minPrice);
        }
        if (empty($basePrice)) {
            $basePrice = NULL;
        } else {
            $basePrice = $this->Price->getPriceToDb($basePrice);
        }
        if (empty($startUp)) {
            $startUp = NULL;
        } else {
            $startUp = $this->Price->getPriceToDb($startUp);
        }

        if (empty($excluded)) {
            $excluded = NULL;
        }
        if (empty($printRotated)) {
            $printRotated = NULL;
        }


        $ID = $this->PrintShopConfigPrice->isDetailPrices();

        if ($minPrice === NULL && $basePrice === NULL && $startUp === NULL && $excluded === NULL && $printRotated === NULL) {
            if (intval($ID) > 0) {
                $this->PrintShopConfigPrice->deleteDetailPrices($ID);
            }
            return array('response' => true);
        }

        $sum += intval($this->PrintShopConfigPrice->setDetailPrices('minPrice', $minPrice));
        $sum += intval($this->PrintShopConfigPrice->setDetailPrices('basePrice', $basePrice));
        $sum += intval($this->PrintShopConfigPrice->setDetailPrices('startUp', $startUp));
        $sum += intval($this->PrintShopConfigPrice->setDetailPrices('excluded', $excluded));
        $sum += intval($this->PrintShopConfigPrice->setDetailPrices('printRotated', $printRotated));

        if ($sum > 0) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
            $return['error'] = 'Nic nie zaktualizowano!';
        }
        return $return;

    }

}
