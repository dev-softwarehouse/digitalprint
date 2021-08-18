<?php

namespace DreamSoft\Controllers\Payments;

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Payment\PaymentContent;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Payment\Payment;
use DreamSoft\Models\Payment\PaymentName;
use DreamSoft\Controllers\Components\Translate;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserOption;

/**
 * Class PaymentsController
 */
class PaymentsController extends Controller
{

    public $useModels = array();

    /**
     * @var Module
     */
    private $Module;
    /**
     * @var ModuleValue
     */
    private $ModuleValue;
    /**
     * @var Payment
     */
    private $Payment;
    /**
     * @var PaymentName
     */
    private $PaymentName;
    /**
     * @var PaymentContent
     */
    private $PaymentContent;
    /**
     * @var LangSetting
     */
    private $LangSetting;
    /**
     * @var DpOrder
     */
    private $DpOrder;
    /**
     * @var Price
     */
    private $Price;
    /**
     * @var User
     */
    private $User;
    /**
     * @var UserOption
     */
    private $UserOption;
    /**
     * @var UserCalc
     */
    private $UserCalc;
    /**
     * @var Setting
     */
    private $Setting;
    /**
     * @var Currency
     */
    private $Currency;
    /**
     * @var Translate
     */
    private $Translate;

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Payment->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
    }

    /**
     * PaymentsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Price = Price::getInstance();
        $this->Payment = Payment::getInstance();
        $this->PaymentName = PaymentName::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->PaymentContent = PaymentContent::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->Module = Module::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->User = User::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Currency = Currency::getInstance();
        $this->Translate = new Translate();
        $this->Setting->setModule('general');
    }

    /**
     * @param null $params
     * @return array|bool
     */
    public function payments($params = NULL)
    {

        return $this->_payments($params);

    }

    public function paymentsPublic($orderID)
    {
        $params['active'] = 1;
        $payments = $this->_payments($params);

        $loggedUser = $this->Auth->getLoggedUser();
        $userEntity = $this->User->get('ID', $loggedUser['ID']);

        $aggregateDeferredPayments = $this->searchDeferredPayment($payments);

        if( count($aggregateDeferredPayments) > 0 && $userEntity['deferredPayment'] > 0 ) {

            $userOptionEntity = $this->UserOption->get('uID', $loggedUser['ID']);

            $aggregateOrderCalculations = $this->DpOrder->getOrderCalculations($orderID);
            $aggregateCalculations = $this->DpOrder->getNotPaidCalculations($loggedUser['ID']);
            $aggregateCalculations = array_merge($aggregateCalculations, $aggregateOrderCalculations);
            $notPaidCalculations = $this->UserCalc->getByList($aggregateCalculations);

            if( !$notPaidCalculations ) {
                $notPaidCalculations = array();
            }

            $totalUnpaidValue = $this->Price->getTotalBasePrice($notPaidCalculations);
            $totalUnpaidDeliveryValue = $this->Price->getTotalDeliveryPrice($notPaidCalculations);

            $unpaidPayments = ($totalUnpaidValue + $totalUnpaidDeliveryValue);

            $this->Setting->setLang(NULL);
            $defaultCurrencyID = $this->Setting->getValue('defaultCurrency');
            $defaultCurrencyEntity = $this->Currency->getOne($defaultCurrencyID);

            if( $unpaidPayments >= (intval($userOptionEntity['creditLimit']) * 100) ) {
                foreach ($aggregateDeferredPayments as $changeKey) {
                    $payments[$changeKey]['limitExceeded'] = true;
                    $payments[$changeKey]['infoForUser'] = 'credit_limit_exceeded';
                    $payments[$changeKey]['unpaidValue'] = $this->Price->getPriceToView($unpaidPayments);
                    $payments[$changeKey]['creditLimit'] = $userOptionEntity['creditLimit'];
                    $payments[$changeKey]['baseCurrency'] = $defaultCurrencyEntity['code'];
                    $payments[$changeKey]['deferredPayment'] = true;
                }
            } else {
                foreach ($aggregateDeferredPayments as $changeKey) {
                    $payments[$changeKey]['deferredDays'] = $userEntity['deferredPayment'];
                    $payments[$changeKey]['limitExceeded'] = false;
                    $payments[$changeKey]['infoForUser'] = 'credit_limit';
                    $payments[$changeKey]['creditLimit'] = $userOptionEntity['creditLimit'];
                    $payments[$changeKey]['unpaidValue'] = $this->Price->getPriceToView($unpaidPayments);
                    $payments[$changeKey]['baseCurrency'] = $defaultCurrencyEntity['code'];
                    $payments[$changeKey]['deferredPayment'] = true;
                }
            }
        } else {

            foreach ($aggregateDeferredPayments as $changeKey) {
                unset($payments[$changeKey]);
            }

            sort($payments);

        }

        return $payments;
    }

    private function _payments($params)
    {

        $data = $this->Payment->getAll($params);

        if (empty($data)) {
            $data = array();
        }

        return $data;
    }

    /**
     * @param $payments
     * @return array
     */
    private function searchDeferredPayment($payments)
    {
        if( !$payments || !is_array($payments) ) {
            return array();
        }

        $aggregateComponents = array();
        foreach ($payments as $payment) {
            $aggregateComponents[] = $payment['componentID'];
        }

        $modules = $this->Module->getByList($aggregateComponents);

        $aggregateKeys = array();
        foreach ($payments as $key => $payment) {
            if( array_key_exists($payment['componentID'], $modules) &&
                $modules[$payment['componentID']]['key'] === 'deferred_payment' ) {
                $aggregateKeys[] = $key;
            }
        }

        return $aggregateKeys;
    }

    /**
     * @return mixed
     */
    public function post_payments()
    {
        $names = $this->Data->getPost('names');
        if(empty($names)){
            $names=$this->Data->getPost('contents');
        }
        $contents = $this->Data->getPost('contents');
        $componentID = $this->Data->getPost('componentID');
        $sellerID = $this->Data->getPost('sellerID');

        $data['response'] = false;

        $domainID = $this->Payment->getDomainID();

        if (!empty($names) && $domainID) {
            $params['domainID'] = $domainID;
            $params['active'] = 1;
            $params['componentID'] = $componentID;
            $params['sellerID'] = $sellerID;

            $paymentID = $this->Payment->create($params);
            if (!$paymentID) {
                $data = $this->sendFailResponse('03');
                return $data;
            }
            $item = $params;
            $item['ID'] = $paymentID;
            $data['item'] = $item;
            unset($params);
        } else {
            $data = $this->sendFailResponse('02', 'Brak wymaganych pól');
            return $data;
        }

        if (!empty($names) && $paymentID > 0) {
            foreach ($names as $lang => $name) {
                $params['name'] = $name;
                $params['lang'] = $lang;
                $params['paymentID'] = $paymentID;
                $lastID = $this->Payment->createName($params);
                if ($lastID > 0) {
                    $data['response'] = true;
                    $data['item']['names'][$lang] = $name;
                }
            }
        }

        if (!empty($contents) && $paymentID > 0) {
            foreach ($contents as $lang => $content) {
                $params['content'] = $content;
                $params['lang'] = $lang;
                $params['paymentID'] = $paymentID;
                $lastID = $this->PaymentContent->create($params);
                if ($lastID > 0) {
                    $data['response'] = true;
                    $data['item']['contents'][$lang] = $name;
                }
            }
        }

        return $data;
    }

    /**
     * @param $paymentID
     * @return mixed
     */
    public function put_payments($paymentID = NULL)
    {
        if (!$paymentID) {
            $paymentID = $this->Data->getPost('ID');
        }
        $res = array('names_saved' => 0, 'content_saved' => 0);

        if (!$paymentID) {
            $data = $this->sendFailResponse('07', 'Nie ma ID płatności ');
            return $data;
        }

        $sellerID = $this->Data->getPost('sellerID');

        $names = $this->Data->getPost('names');
        $contents = $this->Data->getPost('contents');

        $mainComponentID = $this->Data->getPost('mainComponentID');

        if ($sellerID) {
            $this->Payment->update($paymentID, 'sellerID', $sellerID);
        }

        if( $mainComponentID ) {
            $this->Payment->update($paymentID, 'componentID', $mainComponentID);
        }

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                $nameID = $this->Payment->existName($paymentID, $lang);
                if ($nameID > 0) {
                    $res['names_saved'] = $this->Payment->updateName($nameID, 'name', $name);
                    unset($nameID);
                } else {
                    $paramNames['name'] = $name;
                    $paramNames['lang'] = $lang;
                    $paramNames['paymentID'] = $paymentID;
                    $res['names_saved'] = $this->Payment->createName($paramNames);
                    unset($paramNames);
                }

            }
        }

        if (!empty($contents)) {
            foreach ($contents as $lang => $content) {
                $contentID = $this->PaymentContent->exist($paymentID, $lang);
                if ($contentID > 0) {
                    $res['content_saved'] = $this->PaymentContent->update($contentID, 'content', $content);
                    unset($nameID);
                } else {
                    $paramContent['content'] = $content;
                    $paramContent['lang'] = $lang;
                    $paramContent['paymentID'] = $paymentID;
                    $res['content_saved'] = $this->PaymentContent->create($paramContent);
                    unset($paramContent);
                }
            }
        }
        if (!empty($names) && intval($res['names_saved']) == 0) {
            $data = $this->sendFailResponse('03', 'Names save problem!');
            return $data;
        }
        if (!empty($contents) && intval($res['content_saved']) == 0) {
            $data = $this->sendFailResponse('03', 'Contents save problem!');
            return $data;
        }
        $paymentKeys = $this->Data->getPost('paymentKeys');
        $domainID = $this->Payment->getDomainID();
        foreach ($paymentKeys as $key => $value) {
            $this->ModuleValue->set($key, $value, $paymentID, null, $domainID);
        }
        $data['response'] = false;

        if (intval($res['content_saved']) > 0 || intval($res['names_saved'])) {
            $data['response'] = true;
        }

        return $data;

    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_payments($ID)
    {
        $data['response'] = false;
        if ($ID) {
            if ($this->Payment->delete('ID', $ID)) {
                if ($this->PaymentName->delete('paymentID', $ID)) {
                    if ($this->PaymentContent->delete('paymentID', $ID)) {
                        $data['response'] = true;
                    }
                }
                return $data;
            } else {
                return $data;
            }
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @return array
     */
    public function creditLimit()
    {
        $loggedUser = $this->Auth->getLoggedUser();

        if( !$loggedUser ) {
            return array('response' => false);
        }

        if( is_array($loggedUser) && array_key_exists('onetime', $loggedUser) && $loggedUser['onetime'] ) {
            return array('response' => false);
        }

        $userEntity = $this->User->get('ID', $loggedUser['ID']);

        if( intval($userEntity['deferredPayment']) == 0 ) {
            return array('response' => false);
        }

        $userOptionEntity = $this->UserOption->get('uID', $loggedUser['ID']);

        if( intval($userOptionEntity['creditLimit']) == 0 ) {
            return array('response' => false);
        }

        $aggregateCalculations = $this->DpOrder->getNotPaidCalculations($loggedUser['ID']);

        $notPaidCalculations = $this->UserCalc->getByList($aggregateCalculations);


        if( !$notPaidCalculations ) {
            $notPaidCalculations = array();
        }
        $totalUnpaidValue = $this->Price->getTotalBasePrice($notPaidCalculations);

        $totalUnpaidDeliveryValue = $this->Price->getTotalDeliveryPrice($notPaidCalculations);
        $unpaidPayments = ($totalUnpaidValue + $totalUnpaidDeliveryValue);

        $this->Setting->setLang(NULL);
        $defaultCurrencyID = $this->Setting->getValue('defaultCurrency');
        $defaultCurrencyEntity = $this->Currency->getOne($defaultCurrencyID);

        $data['unpaidValue'] = $this->Price->getPriceToView($unpaidPayments);
        $data['creditLimit'] = $userOptionEntity['creditLimit'];
        $data['baseCurrency'] = $defaultCurrencyEntity['code'];
        $data['deferredDays'] = $userEntity['deferredPayment'];
        $data['limitExceeded'] = false;
        if( $unpaidPayments >= (intval($userOptionEntity['creditLimit']) * 100) ) {
            $data['limitExceeded'] = true;
        }

        $data['response'] = true;

        return $data;

    }

}
