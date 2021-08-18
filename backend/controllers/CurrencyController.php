<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Currency\CurrencyRoot;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Core\Controller;

/**
 * Description of CurrencyController
 *
 * @author Właściciel
 */
class CurrencyController extends Controller
{

    public $useModels = array();

    /**
     * @var Currency
     */
    protected $Currency;
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
     * CurrencyController constructor.
     * @param array $parameters
     */
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->Currency = Currency::getInstance();
        $this->CurrencyRoot = CurrencyRoot::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->Price = Price::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Setting->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
    }

    /**
     * @return array
     */
    public function index()
    {
        $list = $this->Currency->getAll();
        $listRoot = $this->CurrencyRoot->getAll();
        if (!$list || !$listRoot) {
            $return = array();
            return $return;
        }

        $cArr = array();
        foreach ($list as $l) {
            if ($this->Setting->getValue('defaultCurrency') == $l['ID']) {
                $l['default'] = 1;
            } else {
                $l['default'] = 0;
            }

            $l['course'] = $this->Price->getPriceToView($l['course']);

            $cArr[$l['code']] = $l;
        }
        foreach ($listRoot as $r) {
            if (isset($cArr[$r['code']])) {
                $cArr[$r['code']]['name'] = $r['name'];
            }
        }

        $result = array();
        foreach ($cArr as $l) {
            $result[] = $l;
        }
        return $result;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $code = $this->Data->getPost('code');
        $active = $this->Data->getPost('active');

        if ($code) {
            $exist = $this->Currency->exist('code', $code);
            if ($exist) {
                $return = $this->sendFailResponse('08');
                return $return;
            }
            if ($active) {
                $lastID = $this->Currency->customCreate($code, $active);
            } else {
                $lastID = $this->Currency->customCreate($code);
            }

            if (intval($lastID) > 0) {
                $return = $this->Currency->get('code', $code);
            } else {
                $return = $this->sendFailResponse('03');
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('02', 'Set code for currency');
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $code = $this->Data->getPost('code');
        $active = $this->Data->getPost('active');
        $course = $this->Data->getPost('course');
        $default = $this->Data->getPost('default');
        $ID = $this->Data->getPost('ID');

        if (!$ID) {
            $return = $this->sendFailResponse('04');
            return $return;
        }

        $res = false;

        if ($code) {
            if ($this->Currency->update($ID, 'code', $code)) {
                $res = true;
            }
        }
        if ($active !== NULL) {
            if ($this->Currency->update($ID, 'active', $active)) {
                $res = true;
            }
        }
        if ($course) {
            $course = $this->Price->getPriceToDb($course);
            if ($this->Currency->update($ID, 'course', $course)) {
                $res = true;
            }
        }

        if ($default && intval($default) == 1) {
            $this->Setting->set('defaultCurrency', $ID);
        }

        if ($res) {
            $return['response'] = true;
            return $return;
        } else {
            $return = $this->sendFailResponse('03');
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->Currency->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            } else {
                $data = $this->sendFailResponse('05');
                return $data;
            }
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    public function getDefault()
    {
        $defaultCurrency = $this->Setting->getValue('defaultCurrency');
        $currency = $this->Currency->get('ID', $defaultCurrency);

        if( !$currency ) {
            return $this->sendFailResponse('07', 'Default currency is NULL');
        }

        return $currency;
    }

}