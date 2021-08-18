<?php

use DreamSoft\Controllers\Components\Calculation;
use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopUser\UserCalcProductAttribute;

/**
 * Description of CalculationController
 *
 */
class CalculationController extends Controller
{

    public $useModels = array();

    /**
     * @var Calculation
     */
    protected $Calculation;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var UserCalcProduct
     */
    protected $UserCalcProduct;
    /**
     * @var UserCalcProductAttribute
     */
    protected $UserCalcProductAttribute;

    public function __construct($params)
    {
        parent::__construct($params);

        $this->Calculation = Calculation::getInstance();
        $this->Price = Price::getInstance();

        $this->UserCalc = UserCalc::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->UserCalcProductAttribute = UserCalcProductAttribute::getInstance();
    }

    public function setDomainID($domainID)
    {
        $this->Price->setDomainID($domainID);
    }

    public function index($calculationID)
    {
        if ($calculationID) {
            $result = $this->UserCalc->customGet($calculationID);
            $output = $this->Calculation->getCalcData(array($result));
            $result = $output[0];
        } else {
            $user = $this->Auth->getLoggedUser();
            $result = $this->UserCalc->getAllforUser($user['ID']);

            $result = $this->Calculation->getCalcData($result);
        }

        return $result;
    }

    public function history($baseID)
    {
        if (!$baseID) {
            return $this->sendFailResponse('04');
        }
        $result = $this->UserCalc->getHistory($baseID);

        $result = $this->Calculation->getCalcData($result);

        return $result;
    }

}