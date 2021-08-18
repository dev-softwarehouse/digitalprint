<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 20-04-2018
 * Time: 13:10
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Payment\Payment;
use Voronkovich\SberbankAcquiring\Currency as SberbankCurrency;

class PaymentAssistant extends Component
{
    public $useModels = array();

    /**
     * @var Module
     */
    private $Module;
    /**
     * @var ModuleKey
     */
    private $ModuleKey;
    /**
     * @var ModuleValue
     */
    private $ModuleValue;
    /**
     * @var Payment
     */
    private $Payment;

    /**
     * @var int
     */
    private $domainID;

    /**
     * PaymentAssistant constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->Payment = Payment::getInstance();
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
        $this->ModuleValue->setDomainID($domainID);
        $this->Payment->setDomainID($domainID);
        $this->domainID = $domainID;
    }

    /**
     * @param string $paymentModule
     * @return array
     */
    public function getPaymentOptions($paymentModule = TINKOFF_NAME_IN_MODULES)
    {

        $module = $this->Module->get('key', $paymentModule);

        $this->ModuleKey->setModuleID($module['ID']);
        $keys = $this->ModuleKey->getAllByModule();

        $keysArr = array();
        $keysFunc = array();
        $keysNames = array();
        foreach ($keys as $key => $val) {
            $keysArr[] = $val['ID'];
            $keysFunc[$val['ID']] = $val['func'];
            $keysNames[$val['ID']] = $val['key'];
        }

        $payment = $this->Payment->getOne($module['ID']);

        $values = $this->ModuleValue->customGetByList($keysArr, $payment['ID']);

        $results = array();
        foreach ($values as $key => $value) {
            $results[$keysNames[$key]] = $value;
        }

        if (empty($results)) {
            return array();
        }
        return $results;

    }

    /**
     * @param $currencyCode
     * @return int|null
     */
    public function getSberbankCurrency($currencyCode) {

        $currency = NULL;

        $currencyCode = strtoupper($currencyCode);

        switch ($currencyCode) {
            case "RUB":
                $currency = SberbankCurrency::RUB;
                break;
            case "EUR":
                $currency = SberbankCurrency::EUR;
                break;
            case "UAH":
                $currency = SberbankCurrency::UAH;
                break;
            case "USD":
                $currency = SberbankCurrency::USD;
                break;
            default:
                $currency = SberbankCurrency::RUB;
                break;
        }

        return $currency;

    }

}