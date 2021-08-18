<?php

namespace DreamSoft\Controllers\Price;

use DreamSoft\Core\Controller;
use DreamSoft\Models\Price\BasePrice;

/**
 * Description of BasePricesController
 * @class BasePricesController
 * @author Rafał
 */
class BasePricesController extends Controller
{

    public $useModels = array('BasePrice');

    /**
     * @var BasePrice
     */
    protected $BasePrice;


    public function __construct($params)
    {
        parent::__construct($params);
        $this->BasePrice = BasePrice::getInstance();
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $price = $this->Data->getPost('price');
        $grossPrice = $this->Data->getPost('grossPrice');

        $currency = $this->Data->getPost('currency');
        $baseCurrency = $this->Data->getPost('baseCurrency');
        $exchangeRate = $this->Data->getPost('exchangeRate');
        $date = time();

        $required = array('price', 'grossPrice', 'currency', 'baseCurrency', 'exchangeRate', 'date', 'taxID');

        $hasEmpty = false;
        foreach ($required as $key) {
            if (empty(${$key})) {
                $hasEmpty = true;
            }
        }

        if ($hasEmpty) {
            return $this->sendFailResponse('01');
        }

        $lastID = $this->BasePrice->create(compact($required));
        $return = $this->BasePrice->get('ID', $lastID);
        if (!$return) {
            $return = $this->sendFailResponse('03');
        }
        return $return;
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();
        $goodKeys = array('price', 'grossPrice', 'currency', 'baseCurrency', 'exchangeRate', 'taxID');
        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            $this->BasePrice->update($ID, $key, $value);
        }
        $return['response'] = true;
        return $return;

    }

    /**
     * @param $ID
     * @return array
     */
    public function delete_index($ID)
    {
        $data['response'] = false;
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->BasePrice->delete('ID', $ID)) {
                $data['response'] = true;
            } else {
                $data = $this->sendFailResponse('05');
            }
            return $data;
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

}