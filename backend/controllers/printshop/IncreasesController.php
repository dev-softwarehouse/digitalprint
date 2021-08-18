<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopIncrease;

/**
 * Description of IncreasesController
 *
 * @author Rafał
 */
class IncreasesController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var PrintShopIncrease
     */
    protected $PrintShopIncrease;
    /**
     * @var Price
     */
    protected $Price;

    /**
     * IncreasesController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopIncrease = PrintShopIncrease::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $formatID
     * @return array|bool
     */
    public function increases($groupID, $typeID, $formatID = null)

    {
        $this->PrintShopIncrease->setGroupID($groupID);
        $this->PrintShopIncrease->setTypeID($typeID);

        $data = $this->PrintShopIncrease->customGetAll($formatID);
        $res = array();
        if (!empty($data)) {
            foreach ($data as $i) {
                // groupID 	typeID 	amount 	value
                if ($i['unit'] == 'price' || $i['unit'] == 'price_per_unit') {
                    $i['value'] = $this->Price->getNumberToView($i['value']);
                }
                $res[$i['formatID']][] = $i;
            }
        }
        sort($res);
        $data = $res;

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    public function patch_increases($groupID, $typeID)
    {
        $this->PrintShopIncrease->setGroupID($groupID);
        $this->PrintShopIncrease->setTypeID($typeID);

        $value = $this->Data->getPost('value');
        $amount = $this->Data->getPost('amount');
        $type = $this->Data->getPost('type');
        $formatID = $this->Data->getPost('formatID');
        $remove = $this->Data->getPost('remove');

        $oneType = $this->PrintShopIncrease->getType($type);
        if ($oneType['unit'] == 'price' || $oneType['unit'] == 'price_per_unit') {
            $value = $this->Price->getPriceToDb($value);
        }

        $ID = $this->PrintShopIncrease->exist($amount, $type, $formatID);

        if ($remove) {
            $res = $this->PrintShopIncrease->delete('ID', $remove);
            return array('response' => $res, 'info' => 'remove');
        }

        if ($value && $amount && $ID > 0) {
            $up = array();
            $up[0] = intval($this->PrintShopIncrease->update($ID, 'amount', $amount));
            $up[1] = intval($this->PrintShopIncrease->update($ID, 'value', $value));
            if (array_sum($up) == 2) {
                $item = $this->PrintShopIncrease->get('ID', $ID);
                $item['unit'] = $oneType['unit'];
                if ($item['unit'] == 'price' || $item['unit'] == 'price_per_unit') {
                    $item['value'] = $this->Price->getNumberToView($item['value']);
                }
                return array('response' => true, 'info' => 'update', 'item' => $item);
            } else {
                return array('response' => false, 'info' => 'update');
            }
        }
        if ($amount && $value && $type) {
            $lastID = $this->PrintShopIncrease->customCreate($amount, $value, $type, $formatID);
            if ($lastID) {
                $result = true;
            } else {
                $result = false;
            }
            $data['response'] = $result;
            $item = $this->PrintShopIncrease->get('ID', $lastID);
            $item['unit'] = $oneType['unit'];
            if ($item['unit'] == 'price' || $item['unit'] == 'price_per_unit') {
                $item['value'] = $this->Price->getNumberToView($item['value']);
            }
            $data['item'] = $item;
            return $data;
        }

        return array('response' => false);
    }

    /**
     * @return array|bool
     */
    public function types()
    {
        $data = $this->PrintShopIncrease->getTypes();

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    //public function delete

}
