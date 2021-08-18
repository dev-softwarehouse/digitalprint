<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\Currency\CurrencyRoot;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Models\Domain\DomainRoot;

/**
 * Programista Rafał Leśniak - 11.4.2017
 * @property DomainsController
 */
class DomainsController extends Controller
{

    public $useModels = array();

    /**
     * @var DomainRoot
     */
    protected $DomainRoot;
    /**
     * @var Domain
     */
    protected $Domain;
    /**
     * @var Currency
     */
    protected $Currency;
    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var CurrencyRoot
     */
    protected $CurrencyRoot;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var LangSetting
     */
    protected $LangSetting;

    /**
     * DomainsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->DomainRoot = DomainRoot::getInstance();
        $this->Domain = Domain::getInstance();
        $this->Currency = Currency::getInstance();
        $this->Tax = Tax::getInstance();
        $this->Setting = Setting::getInstance();
        $this->CurrencyRoot = CurrencyRoot::getInstance();
        $this->Setting->setModule('general');
        $this->Price = Price::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param $ID
     */
    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->Currency->setDomainID($ID);
        $this->Setting->setDomainID($ID);
        $this->LangSetting->setDomainID($ID);
    }

    /**
     * @param null $ID
     * @return mixed
     */
    public function index($ID = NULL)
    {

        $currencies = $this->Currency->getAll();
        $currencies = $this->aggregateCurrencies($currencies);

        $defaultLangID = $this->Setting->getValue('defaultLang');

        $defaultLangEntity = $this->LangSetting->getByID( $defaultLangID );


        if (intval($ID) > 0) {
            $data = $this->Domain->get('ID', $ID);
        } else {
            $data = $this->Domain->getList();
            $domainID = $this->getDomainID();
            foreach ($data as $key => $val) {
                $domainRoot = $this->DomainRoot->get('name', $val['host']);
                if (!empty($domainRoot)) {
                    $data[$key]['companyID'] = $domainRoot['companyID'];
                    $data[$key]['port'] = $domainRoot['port'];
                }
                if ($domainID == $val['ID']) {
                    $data[$key]['selected'] = 1;
                    $data[$key]['defaultLangCode'] = $defaultLangEntity ? $defaultLangEntity['code'] : '';

                    $this->Setting->setDomainID($domainID);
                    $myZoneStartPoint = $this->Setting->getValue('myZoneStartPoint');

                    if( $myZoneStartPoint ) {
                        $data[$key]['myZoneStartPoint'] = $myZoneStartPoint;
                    } else {
                        $data[$key]['myZoneStartPoint'] = DEFAULT_MY_ZONE_START_POINT;
                    }

                    $data[$key]['skinName'] = $this->getSkinName();
                    $data[$key]['webMasterVerifyTag'] = $this->getWebMasterVerifyTag();

                    $this->Setting->setModule('general');
                    $defaultTax=$this->Setting->getValue('defaultTax');
                    $this->Tax->setDomainID($val['ID']);
                    $data[$key]['taxes'] = $this->Tax->getAll(1);
                    foreach ($data[$key]['taxes'] as $taxKey => $taxValue) {
                        $data[$key]['taxes'][$taxKey]['default'] = $taxValue['ID'] == $defaultTax;
                    }
                }
                if (!empty($currencies[$val['ID']])) {
                    $data[$key]['currencies'] = $currencies[$val['ID']];
                } else {
                    $data[$key]['currencies'] = array();
                }
            }
        }

        return $data;
    }

    /**
     * @return string
     */
    private function getSkinName()
    {
        $this->Setting->setModule('general');
        $this->Setting->setLang(NULL);

        $skinName = $this->Setting->getValue('skinName');

        if (!$skinName) {
            $skinName = CUSTOM_SKIN;
        }

        return $skinName;
    }

    /**
     * @return string
     */
    private function getWebMasterVerifyTag()
    {
        $this->Setting->setModule('general');
        $this->Setting->setLang(NULL);

        $webMasterVerifyTag = $this->Setting->getValue('webMasterVerifyTag');

        if (!$webMasterVerifyTag) {
            $webMasterVerifyTag = '';
        }

        return $webMasterVerifyTag;
    }

    /**
     * @param array $currencies
     * @return array
     */
    private function aggregateCurrencies(array $currencies)
    {
        $this->Setting->setModule('general');
        $this->Setting->setLang(NULL);

        if (!$currencies) {
            return array();
        }

        $currenciesRoot = $this->CurrencyRoot->getAll();
        $currenciesRoot = $this->aggregateCurrenciesRoot($currenciesRoot);

        $result = array();
        foreach ($currencies as $currency) {
            if( trim($this->Setting->getValue('defaultCurrency')) == $currency['ID'] ){
                $currency['selected'] = true;
            } else {
                $currency['selected'] = false;
            }
            if( isset($currenciesRoot[$currency['code']]) ) {
                $currency['symbol'] = $currenciesRoot[$currency['code']]['symbol'];
            }
            $currency['course'] = $this->Price->getPriceToView($currency['course']);
            $result[$currency['domainID']][] = $currency;
        }

        return $result;
    }

    /**
     * @param array $currencies
     * @return array
     */
    private function aggregateCurrenciesRoot(array $currencies) {

        if (!$currencies) {
            return array();
        }
        $result = array();
        foreach ($currencies as $currency) {
            $result[$currency['code']] = $currency;
        }

        return $result;

    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $name = $this->Data->getPost('name');
        $host = $this->Data->getPost('host');
        $desc = $this->Data->getPost('desc');

        $domainID = $this->Domain->create(compact('name', 'host', 'desc'));
        if ($domainID > 0) {
            $data['response'] = true;
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {

        $ID = $this->Data->getPost('ID');

        if (intval($ID) == 0) {
            header("HTTP/1.0 403 Forbidden");
            $data['success'] = false;
            return $data;
        }

        $name = $this->Data->getPost('name');
        $host = $this->Data->getPost('host');
        $desc = $this->Data->getPost('desc');
        $ssl = $this->Data->getPost('ssl') ? 1 : 0;

        if ($name) {
            $this->Domain->update($ID, 'name', $name);
        }
        if ($host) {
            $this->Domain->update($ID, 'host', $host);
        }
        if ($desc) {
            $this->Domain->update($ID, 'desc', $desc);
        }

        $this->Domain->update($ID, 'ssl', $ssl);

        $data['response'] = true;
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        if (intval($ID) == 0) {
            header("HTTP/1.0 403 Forbidden");
            $data['success'] = false;
            return $data;
        }
        $this->Domain->delete('ID', $ID);
        $data['response'] = true;
        return $data;
    }
}
