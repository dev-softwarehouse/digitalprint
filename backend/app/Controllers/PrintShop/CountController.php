<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 12-04-2018
 * Time: 13:21
 */

namespace DreamSoft\Controllers\PrintShop;

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\CalculatorCollect;
use DreamSoft\Models\Price\BasePrice;

class CountController extends Controller
{
    public $useModels = array();
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var BasePrice
     */
    protected $BasePrice;
    /**
     * @var CalculatorCollect
     */
    protected $Calculator;

    /**
     * CountController constructor.
     * @param array $parameters
     */
    public function __construct(array $parameters = array())
    {
        parent::__construct($parameters);
        $this->Price = Price::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->Calculator = new CalculatorCollect();
    }

    /**
     * @return array|null
     */
    public function patch_index()
    {
        $post = $this->Data->getAllPost();

        return $post;
    }

    /**
     * @return array
     */
    public function patch_cartReCalculate()
    {

        $post = $this->Data->getAllPost();

        $products = $post['products'];

        $aggregatePrices = array();
        foreach ($products as $product) {
            $aggregatePrices[] = $product['priceID'];
        }

        $reCount = $this->Calculator->calculate($products);

        if ($reCount) {
            return array('response' => true);
        }

        return array('response' => false);
    }

    /**
     * @return array
     */
    public function patch_cartRestorePrices()
    {
        $post = $this->Data->getAllPost();

        $products = $post['products'];

        $restore = $this->Calculator->restorePrices($products);

        if( $restore ) {
            return array('response' => true);
        }

        return array('response' => false);
    }
}