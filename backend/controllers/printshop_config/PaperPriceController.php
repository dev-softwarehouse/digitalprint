<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPaperPrice;

/**
 * Description of PaperPriceController
 *
 * @author Rafał
 */
class PaperPriceController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var PrintShopConfigPaperPrice
     */
    protected $PrintShopConfigPaperPrice;

    /**
     * PaperPriceController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigPaperPrice = PrintShopConfigPaperPrice::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param $attrID
     * @param $optID
     * @return array
     */
    public function paperPrice($attrID, $optID)
    {

        $this->PrintShopConfigPaperPrice->setOptID($optID);

        $data = $this->PrintShopConfigPaperPrice->getAll();
        if (empty($data)) {
            $data = array();
        } else {
            foreach ($data as $key => &$value) {
                $value['price'] = $this->Price->getNumberToView($value['price']);
                if ($value['expense']) {
                    $value['expense'] = $this->Price->getNumberToView($value['expense']);
                }
            }
        }

        return $data;
    }

    /**
     * @param $attr
     * @param $optID
     * @return mixed
     */
    public function post_paperPrice($attr, $optID)
    {
        $this->PrintShopConfigPaperPrice->setOptID($optID);

        $amount = $this->Data->getPost('amount');
        $price = $this->Price->getPriceToDb($this->Data->getPost('price'));
        $expense = $this->Price->getPriceToDb($this->Data->getPost('expense'));

        $data['response'] = false;

        $response = $this->PrintShopConfigPaperPrice->getByAmount($amount);
        if ($response) {
            $ID = $response['ID'];
            if ($this->PrintShopConfigPaperPrice->customUpdate($ID, $price, $expense, $amount)) {
                $data['response'] = true;
                $data['info'] = 'update';
            }
        } else {
            if ($lastID = $this->PrintShopConfigPaperPrice->customCreate($price, $expense, $amount)) {
                $data['response'] = true;
                $data['info'] = 'create';
            }
        }


        if ($data['response']) {
            $data['item'] = $this->PrintShopConfigPaperPrice->getByAmount($amount);
            $data['item']['price'] = $this->Price->getNumberToView($data['item']['price']);
            if ($data['item']['expense']) {
                $data['item']['expense'] = $this->Price->getNumberToView($data['item']['expense']);
            }
        }

        return $data;

    }

    /**
     * @param $attrID
     * @param $optID
     * @param $priceID
     * @return mixed
     */
    public function delete_paperPrice($attrID, $optID, $priceID)
    {
        $data['response'] = false;

        if ($this->PrintShopConfigPaperPrice->delete('ID', $priceID)) {
            $data['response'] = true;
        }

        return $data;
    }


}
