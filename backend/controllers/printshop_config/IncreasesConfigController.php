<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigIncrease;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttribute;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintType;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPriceList;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigWorkspace;

/**
 * Description of IncreasesController
 * @class Increases
 * @author Rafał
 */
class IncreasesConfigController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopConfigIncrease
     */
    protected $PrintShopConfigIncrease;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var PrintShopConfigAttribute
     */
    private $PrintShopConfigAttribute;
    /**
     * @var PrintShopConfigOption
     */
    private $PrintShopConfigOption;
    /**
     * @var PrintShopConfigPrintType
     */
    private $PrintShopConfigPrintType;
/**
     * @var PrintShopConfigPriceList
     */
    private $PrintShopConfigPriceList;
    /**
     * @var PrintShopConfigWorkspace
     */
    private $PrintShopConfigWorkspace;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigIncrease = PrintShopConfigIncrease::getInstance();
        $this->Price = Price::getInstance();
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->PrintShopConfigPrintType = PrintShopConfigPrintType::getInstance();
        $this->PrintShopConfigPriceList = PrintShopConfigPriceList::getInstance();
        $this->PrintShopConfigWorkspace = PrintShopConfigWorkspace::getInstance();
    }

    /**
     * @param $attrID
     * @param $optID
     * @param $controllerID
     * @return array
     */
    public function increases($attrID, $optID, $controllerID)
    {

        $this->PrintShopConfigIncrease->setAttrID($attrID);
        $this->PrintShopConfigIncrease->setOptID($optID);
        $this->PrintShopConfigIncrease->setControllerID($controllerID);

        $result = $this->PrintShopConfigIncrease->getAll();
        if (!$result) {
            $result = array();
        } else {
            $res = array();
            if (!empty($result)) {
                foreach ($result as $r) {
                    $res[$r['increaseType']][] = array(
                        'increaseType' => $r['increaseType'],
                        'amount' => $r['amount'],
                        'value' => $r['value'],
                        'ID' => $r['ID']
                    );
                }
            }
            sort($res);
            $result = $res;
        }
        return $result;
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @return array
     */
    public function patch_increases($attributeID, $optionID, $controllerID)
    {

        $this->PrintShopConfigIncrease->setControllerID($controllerID);
        $this->PrintShopConfigIncrease->setAttrID($attributeID);
        $this->PrintShopConfigIncrease->setOptID($optionID);

        $amount = $this->Data->getPost('amount');
        $value = $this->Data->getPost('value');
        $increaseType = $this->Data->getPost('increaseType');
        $remove = $this->Data->getPost('remove');

        if ($remove) {
            $res = $this->PrintShopConfigIncrease->delete('ID', $remove);
            return array('response' => $res, 'info' => 'remove');
        }
        if ($amount !== NULL && $value && $increaseType) {
            $ID = $this->PrintShopConfigIncrease->exist($amount, $increaseType);
            if (intval($ID) > 0) {
                $this->PrintShopConfigIncrease->update($ID, 'value', $value);
                $data['response'] = true;
                $data['info'] = 'update';
                $data['item'] = $this->PrintShopConfigIncrease->getOne($ID);
                return $data;
            } else {
                $attrID = $attributeID;
                $optID = $optionID;
                $params = compact('controllerID', 'attrID', 'optID', 'amount', 'value', 'increaseType');
                $ID = $this->PrintShopConfigIncrease->create($params);
            }

            if ($ID > 0) {
                $data = $this->PrintShopConfigIncrease->getOne($ID);
            } else {
                $data['response'] = false;
            }
        } else {
            $data['response'] = false;
        }
        return $data;
    }

    public function increasesList($attrIDCurrent)
    {
        $data = $this->PrintShopConfigAttribute->getAll();
        $data=array_values(array_filter($data, function ($attr) use ($attrIDCurrent) {
            return $attr['ID'] != $attrIDCurrent;
        }));
        foreach ($data as &$attribute) {
            $this->PrintShopConfigOption->setAttrID($attribute['ID']);
            $attribute['attributeOptions'] = $this->PrintShopConfigOption->getAll();
            foreach ($attribute['attributeOptions'] as &$option) {
                if ($attribute['type'] == 1) {
                    $controllers = $this->PrintShopConfigPriceList->getAll();
                } else if ($attribute['type'] == 2) {
                    $controllers = $this->PrintShopConfigPrintType->getAll();
                } else if ($attribute['type'] == 3) {
                    $controllers = $this->PrintShopConfigWorkspace->getAll();
                }else{
                    throw new Exception('wrong attribute type');
                }
                $option['controllers'] = $controllers;
            }
        }

        return $data;
    }

    public function relatedIncreasesCount($attrID, $optID, $controllerID)
    {
        $this->PrintShopConfigIncrease->setAttrID($attrID);
        $this->PrintShopConfigIncrease->setOptID($optID);
        $this->PrintShopConfigIncrease->setControllerID($controllerID);
        return $this->PrintShopConfigIncrease->getRelatedIncreasesCount();
    }

    public function relatedIncreasesList($attrID, $optID, $controllerID)
    {

        $this->PrintShopConfigIncrease->setAttrID($attrID);
        $this->PrintShopConfigIncrease->setOptID($optID);
        $this->PrintShopConfigIncrease->setControllerID($controllerID);
        return $this->PrintShopConfigIncrease->getRelatedIncreasesIds();
    }
    public function patch_relatedIncreasesList($attrID, $optID, $controllerID)
    {
        $this->PrintShopConfigIncrease->setAttrID($attrID);
        $this->PrintShopConfigIncrease->setOptID($optID);
        $this->PrintShopConfigIncrease->setControllerID($controllerID);
        return array('response' => $this->PrintShopConfigIncrease->saveRelatedIncreases($this->Data->getAllPost()));
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function increaseTypes($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigIncrease->getIncreaseType($ID);
        } else {
            $data = $this->PrintShopConfigIncrease->getIncreaseTypes();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @param $attrID
     * @param $optID
     * @return array|bool
     */
    public function countIncreases($attrID, $optID)
    {

        $this->PrintShopConfigIncrease->setAttrID($attrID);
        $this->PrintShopConfigIncrease->setOptID($optID);
        $counts = $this->PrintShopConfigIncrease->countByController();
        if (empty($counts)) {
            $counts = array();
        }
        return $counts;
    }

}
