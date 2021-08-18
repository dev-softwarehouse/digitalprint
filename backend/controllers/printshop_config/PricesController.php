<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDiscountPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrice;

/**
 * Description of PricesController
 *
 * @author Rafał
 */

class PricesController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var PrintShopConfigDiscountPrice
     */
    protected $PrintShopConfigDiscountPrice;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var Spreadsheet_Excel_Writer
     */
    protected $Workbook;
    /**
     * @var string
     */
    protected $filename;

    /**
     * PricesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->PrintShopConfigDiscountPrice = PrintShopConfigDiscountPrice::getInstance();
        $this->Price = Price::getInstance();
        $this->filename = BASE_DIR . '/logs/export.xls';
        $this->Workbook = new Spreadsheet_Excel_Writer($this->filename);
    }

    /**
     * @param $attrID
     * @param $optID
     * @param $controllerID
     * @return array|bool
     */
    public function prices($attrID, $optID, $controllerID)
    {

        $this->PrintShopConfigPrice->setAttrID($attrID);
        $this->PrintShopConfigPrice->setOptID($optID);
        $this->PrintShopConfigPrice->setControllerID($controllerID);

        $result = $this->PrintShopConfigPrice->getAll();
        if (!$result) {
            $result = array();
        } else {
            $res = array();
            if (!empty($result)) {
                foreach ($result as $r) {
                    $actExpense = $r['expense'] ? $this->Price->getNumberToView($r['expense']) : NULL;
                    $res[$r['priceType']][] = array(
                        'priceType' => $r['priceType'],
                        'amount' => $r['amount'],
                        'value' => $this->Price->getNumberToView($r['value']),
                        'expense' => $actExpense,
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
     * @param $attrID
     * @param $optID
     * @param $controllerID
     * @param $discountGroupID
     * @return array|bool
     */
    public function discountPrices($attrID, $optID, $controllerID, $discountGroupID)
    {
        $this->PrintShopConfigDiscountPrice->setAttrID($attrID);
        $this->PrintShopConfigDiscountPrice->setOptID($optID);
        $this->PrintShopConfigDiscountPrice->setControllerID($controllerID);
        $this->PrintShopConfigDiscountPrice->setDiscountGroupID($discountGroupID);

        $result = $this->PrintShopConfigDiscountPrice->getAll();
        if (!$result) {
            $result = array();
        } else {
            $res = array();
            if (!empty($result)) {
                foreach ($result as $r) {
                    $actExpense = $r['expense'] ? $this->Price->getNumberToView($r['expense']) : NULL;
                    $res[$r['priceType']][] = array(
                        'priceType' => $r['priceType'],
                        'amount' => $r['amount'],
                        'value' => $this->Price->getNumberToView($r['value']),
                        'expense' => $actExpense,
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
    public function patch_prices($attributeID, $optionID, $controllerID)
    {

        $this->PrintShopConfigPrice->setControllerID($controllerID);
        $this->PrintShopConfigPrice->setAttrID($attributeID);
        $this->PrintShopConfigPrice->setOptID($optionID);

        $this->PrintShopConfigDiscountPrice->setControllerID($controllerID);
        $this->PrintShopConfigDiscountPrice->setAttrID($attributeID);
        $this->PrintShopConfigDiscountPrice->setOptID($optionID);

        $remove = $this->Data->getPost('remove');
        $discountGroupID = $this->Data->getPost('discountGroupID');

        if ($discountGroupID > 0) {
            $this->PrintShopConfigDiscountPrice->setDiscountGroupID($discountGroupID);
        }

        $post = $this->Data->getAllPost();

        if ($remove) {
            if ($discountGroupID > 0) {
                $res = $this->PrintShopConfigDiscountPrice->delete('ID', $remove);
            } else {
                $res = $this->PrintShopConfigPrice->delete('ID', $remove);
            }
            return array('response' => $res, 'info' => 'remove');
        }
        if ($post['amount'] !== NULL && $post['value'] !== NULL && $post['priceType']) {

            if( $post['amount'] > 0 ) {
                $post['amount'] = str_replace(',', '.', $post['amount']);
            }

            if ($discountGroupID > 0) {
                $data = $this->updateDiscountPrice($post);
            } else {
                $data = $this->updatePrice($post);
            }

        } else {
            $data['response'] = false;
        }
        return $data;
    }

    /**
     * @param $post
     * @return array
     */
    private function updatePrice($post)
    {
        $value = $post['value'];
        $expense = NULL;
        if( array_key_exists('expense', $post) ) {
            $expense = $post['expense'];
        }
        $amount = $post['amount'];
        $priceType = $post['priceType'];

        $value = $this->Price->getPriceToDb($value);

        $data['response'] = false;

        if ($expense !== NULL && strlen($expense) > 0) {
            $expense = $this->Price->getPriceToDb($expense);
        }

        $ID = $this->PrintShopConfigPrice->exist($amount, $priceType);
        if (intval($ID) > 0) {
            $data['response'] = $this->PrintShopConfigPrice->update($ID, $value, $expense);
            $data['info'] = 'update';
            $data['item'] = $this->PrintShopConfigPrice->getOne($ID);
            $data['item'] = $this->prepareValueToView($data['item']);
            $data['item'] = $this->prepareExpenseToView($data['item']);
            return $data;
        } else {
            $ID = $this->PrintShopConfigPrice->customCreate(
                $amount,
                $value,
                $priceType,
                $expense
            );
        }

        if ($ID > 0) {
            $data = $this->PrintShopConfigPrice->customGet($priceType, $amount);
            if (isset($data['value'])) {
                $data['value'] = $this->Price->getNumberToView($data['value']);
            }
            if (isset($data['expense'])) {
                $data['expense'] = ($data['expense'] !== NULL) ? $this->Price->getNumberToView($data['expense']) : NULL;
            }
        } else {
            $data['response'] = false;
        }

        return $data;
    }

    /**
     * @param $post
     * @return bool
     */
    private function updateDiscountPrice($post)
    {
        $value = $post['value'];
        $expense = $post['expense'];
        $amount = $post['amount'];
        $priceType = $post['priceType'];

        $value = $this->Price->getPriceToDb($value);

        $data['response'] = false;

        if ($expense !== NULL && strlen($expense) > 0) {
            $expense = $this->Price->getPriceToDb($expense);
        }

        $ID = $this->PrintShopConfigDiscountPrice->exist($amount, $priceType);
        if (intval($ID) > 0) {
            $data['response'] = $this->PrintShopConfigDiscountPrice->update($ID, $value, $expense);
            $data['info'] = 'update';
            $data['item'] = $this->PrintShopConfigDiscountPrice->getOne($ID);
            $data['item'] = $this->prepareValueToView($data['item']);
            $data['item'] = $this->prepareExpenseToView($data['item']);
            return $data;
        } else {
            $ID = $this->PrintShopConfigDiscountPrice->customCreate($amount, $value, $priceType, $expense);
        }

        if ($ID > 0) {
            $data = $this->PrintShopConfigDiscountPrice->getOne($ID);
            if (isset($data['value'])) {
                $data['value'] = $this->Price->getNumberToView($data['value']);
            }
            if (isset($data['expense'])) {
                $data['expense'] = ($data['expense'] !== NULL) ? $this->Price->getNumberToView($data['expense']) : NULL;
            }
        } else {
            $data['response'] = false;
        }

        return $data;
    }

    public function priceTypes($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigPrice->getPriceType($ID);
        } else {
            $data = $this->PrintShopConfigPrice->getPriceTypes();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @TODO remove if not in use
     * @deprecated since 11.08.2017
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param null $docType
     * @return array
     */
    public function export($attributeID, $optionID, $controllerID, $docType = NULL)
    {

        $this->PrintShopConfigPrice->setAttrID($attributeID);
        $this->PrintShopConfigPrice->setOptID($optionID);
        $this->PrintShopConfigPrice->setControllerID($controllerID);

        $result = $this->PrintShopConfigPrice->getAll();
        if (!$result) {
            $result = array();
        } else {
            $res = array();
            if (!empty($result)) {
                $res[] = array('Ilość (przedział)', 'Cena jednostkowa', 'Koszt jednostkowy');
                foreach ($result as $r) {
                    $res[] = array(
                        //'priceType' => $r['priceType'],
                        'amount' => $r['amount'],
                        'value' => $this->Price->getNumberToView($r['value']),
                        'expense' => $this->Price->getNumberToView($r['expense']),
                        //'ID' => $r['ID'] 
                    );
                }
            }
            sort($res);
            $result = $res;
        }

        if ($docType == 'csv') {
            // csv
            $fp = fopen(BASE_DIR . 'logs/export.csv', 'w');
            foreach ($res as $r) {
                fputcsv($fp, $r);
            }
            fclose($fp);
        } elseif ($docType == 'xls') {
            // xls
            $worksheet =& $this->Workbook->addWorksheet('arkusz1');
            $worksheet->setInputEncoding('utf-8');

            $i = 0;
            foreach ($res as $row) {
                if ($i == 0) {
                    $worksheet->write($i, 0, $row[0]);
                    $worksheet->write($i, 1, $row[1]);
                    $worksheet->write($i, 2, $row[2]);
                    $i++;
                    continue;
                }
                $worksheet->write($i, 0, $row['amount']);
                $worksheet->write($i, 1, $row['value']);
                $worksheet->write($i, 2, $row['expense']);
                $i++;
            }

            $this->Workbook->close();
            //$this->Workbook->send();

            //$this->Workbook->send($this->filename);

//            $handle = fopen($this->filename, "r+");
//            $data = fread($handle, filesize($this->filename));
//            fclose($handle);

            //$data = file_get_contents($this->filename);
            $finfo = finfo_open(FILEINFO_MIME_TYPE); // return mime type ala mimetype extension
            $fileInfo = finfo_file($finfo, $this->filename);
            finfo_close($finfo);
        }

        $data = null;
        $mime = null;

        return array('response' => true, 'data' => $data, 'mime' => $mime);
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @return array
     */
    public function post_importPriceList($attributeID, $optionID, $controllerID)
    {
        $priceType = $this->Data->getPost('priceType');
        $discountGroupID = $this->Data->getPost('discountGroupID');

        if ($discountGroupID > 0) {
            $items = $this->discountImport($attributeID, $optionID, $controllerID, $priceType, $discountGroupID);
        } else {
            $items = $this->import($attributeID, $optionID, $controllerID, $priceType);
        }

        $response = false;
        if ($items) {
            $response = true;
        }

        return array('response' => $response, 'items' => $items);
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param $priceType
     * @return array|bool
     */
    private function import($attributeID, $optionID, $controllerID, $priceType)
    {
        $this->PrintShopConfigPrice->setControllerID($controllerID);
        $this->PrintShopConfigPrice->setAttrID($attributeID);
        $this->PrintShopConfigPrice->setOptID($optionID);

        if (intval($priceType) == 0) {
            return array('response' => false);
        }

        $this->PrintShopConfigPrice->removeAll($priceType);

        $file = current($_FILES);

        $items = array();

        $row = 0;
        if (($handle = fopen($file['tmp_name'], "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 0, ";")) !== FALSE) {

                $num = count($data);
                $row++;
                for ($c = 0; $c < $num; $c++) {
                    $this->debug($data[$c]);
                    $expense = NULL;
                    if ($c == 0) {
                        $amount = $data[$c];
                        $ID = $this->PrintShopConfigPrice->exist($amount, $priceType);
                    }
                    if ($c == 1) {
                        $value = $this->Price->getPriceToDb($data[$c]);
                    }
                    if ($c == 2 && $data[$c] !== NULL) {
                        $expense = $this->Price->getPriceToDb($data[$c]);
                    }
                }
                if (isset($ID) && intval($ID) > 0) {
                    $this->PrintShopConfigPrice->update($ID, $value, $expense);
                    $action = 'update';
                } else {
                    $ID = $this->PrintShopConfigPrice->customCreate(
                        $amount,
                        $value,
                        $priceType,
                        $expense
                    );
                    $action = 'save';
                }
                $one['item'] = $this->PrintShopConfigPrice->getOne($ID);
                $one['info'] = $action;
                $items[] = $one;
            }
        }
        fclose($handle);

        if (!empty($items)) {
            return $items;
        }

        return false;
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param $priceType
     * @param $discountGroupID
     * @return array|bool
     */
    private function discountImport($attributeID, $optionID, $controllerID, $priceType, $discountGroupID)
    {
        $this->PrintShopConfigDiscountPrice->setControllerID($controllerID);
        $this->PrintShopConfigDiscountPrice->setAttrID($attributeID);
        $this->PrintShopConfigDiscountPrice->setOptID($optionID);
        $this->PrintShopConfigDiscountPrice->setDiscountGroupID($discountGroupID);

        if (intval($priceType) == 0) {
            return array('response' => false);
        }

        $this->PrintShopConfigDiscountPrice->removeAll($priceType);

        $file = current($_FILES);

        $items = array();

        $row = 0;
        if (($handle = fopen($file['tmp_name'], "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 0, ";")) !== FALSE) {
                $num = count($data);
                $row++;
                for ($c = 0; $c < $num; $c++) {
                    $expense = NULL;
                    if ($c == 0) {
                        $amount = $data[$c];
                        $ID = $this->PrintShopConfigDiscountPrice->exist($amount, $priceType);
                    }
                    if ($c == 1) {
                        $value = $this->Price->getPriceToDb($data[$c]);
                    }
                    if ($c == 2 && $data[$c] !== NULL) {
                        $expense = $this->Price->getPriceToDb($data[$c]);
                    }
                }
                if (intval($ID) > 0) {
                    $this->PrintShopConfigDiscountPrice->update($ID, $value, $expense);
                    $action = 'update';
                } else {
                    $ID = $this->PrintShopConfigDiscountPrice->customCreate($amount, $value, $priceType, $expense);
                    $action = 'save';
                }
                $one['item'] = $this->PrintShopConfigDiscountPrice->getOne($ID);
                $one['info'] = $action;
                $items[] = $one;
            }
        }
        fclose($handle);

        if (!empty($items)) {
            return $items;
        }

        return false;
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param $priceType
     * @return array
     */
    public function delete_removeAll($attributeID, $optionID, $controllerID, $priceType)
    {
        return $this->removeAll($attributeID, $optionID, $controllerID, $priceType);
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param $priceType
     * @param $discountGroupID
     * @return array
     */
    public function delete_allDiscount($attributeID, $optionID, $controllerID, $priceType, $discountGroupID)
    {
        return $this->removeAllDiscount($attributeID, $optionID, $controllerID, $priceType, $discountGroupID);
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param $priceType
     * @return array
     */
    private function removeAll($attributeID, $optionID, $controllerID, $priceType)
    {
        $data['response'] = false;

        $this->PrintShopConfigPrice->setControllerID($controllerID);
        $this->PrintShopConfigPrice->setAttrID($attributeID);
        $this->PrintShopConfigPrice->setOptID($optionID);


        if (intval($priceType) == 0) {
            return array('response' => false);
        }

        $response = $this->PrintShopConfigPrice->removeAll($priceType);

        return array('response' => $response);
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $controllerID
     * @param $priceType
     * @param $discountGroupID
     * @return array
     */
    private function removeAllDiscount($attributeID, $optionID, $controllerID, $priceType, $discountGroupID)
    {
        $data['response'] = false;

        $this->PrintShopConfigDiscountPrice->setControllerID($controllerID);
        $this->PrintShopConfigDiscountPrice->setAttrID($attributeID);
        $this->PrintShopConfigDiscountPrice->setOptID($optionID);
        $this->PrintShopConfigDiscountPrice->setDiscountGroupID($discountGroupID);


        if (intval($priceType) == 0) {
            return array('response' => false);
        }

        $response = $this->PrintShopConfigDiscountPrice->removeAll($priceType);

        return array('response' => $response);
    }

    /**
     * @param $item
     * @return array
     */
    private function prepareValueToView($item)
    {
        if ( array_key_exists('value', $item) ) {
            $item['value'] = $this->Price->getNumberToView($item['value']);
        }

        return $item;
    }

    /**
     * @param $item
     * @return array
     */
    private function prepareExpenseToView($item)
    {
        if ( array_key_exists('expense', $item) ) {
            $item['expense'] = ($item['expense'] !== NULL) ? $this->Price->getNumberToView($item['expense']) : NULL;
        }

        return $item;
    }
}
