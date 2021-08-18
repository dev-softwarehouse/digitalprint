<?php

/**
 * Description of Variable
 *
 * @author Rafał
 */

use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Core\Component;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\Template\View;

/**
 * Class Variable
 */
class Variable extends Component
{

    /**
     * @var
     */
    protected $routeID;
    /**
     * @var
     */
    protected $productID;
    /**
     * @var
     */
    protected $templateID;

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var
     */
    protected $TV;
    /**
     * @var mixed
     */
    protected $PrintShopType;
    /**
     * @var mixed
     */
    protected $PrintShopTypeLanguage;
    /**
     * @var Route
     */
    private $Route;
    /**
     * @var View
     */
    private $View;

    /**
     * Variable constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->View = View::getInstance();
        $this->Route = Route::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
    }

    /**
     * @param $routeID
     */
    public function setRouteID($routeID)
    {
        $this->routeID = $routeID;
    }

    /**
     * @param $productID
     */
    public function setProductID($productID)
    {
        $this->productID = $productID;
    }

    /**
     * @return mixed
     */
    public function getProductID()
    {
        return $this->productID;
    }

    /**
     * @return mixed
     */
    public function getRouteID()
    {
        return $this->routeID;
    }

    /**
     * @param array $products
     * @return mixed
     */
    public function products($products = array())
    {

        $routeID = $this->getRouteID();
        if (!$products) {
            $productArr = array();
            if (!empty($productList)) {
                foreach ($productList as $key => $value) {
                    $productArr[] = $value['productID'];
                }
            }

        } else {
            $productArr = $products;
        }

        $result = $this->PrintShopType->getByList($productArr);

        return $result;
    }

    /**
     * @param $groupID
     * @return mixed
     */
    public function productsByGroup($groupID)
    {
        $this->PrintShopType->setGroupID($groupID);

        $result = $this->PrintShopType->getAll();

        return $result;
    }

    /**
     * @return array
     */
    public function menu()
    {
        $menus = array(0 => array('url' => '/', 'name' => 'Strona główna'));
        return $menus;
    }

}
