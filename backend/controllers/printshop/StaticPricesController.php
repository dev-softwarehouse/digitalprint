<?php

/**
 * Description of StaticPricesController
 *
 */

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigExclusion;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShopProduct\PrintShopStaticPrice;
use DreamSoft\Models\PrintShopProduct\PrintShopVolume;
use DreamSoft\Controllers\Components\Standard;

include_once BASE_DIR . 'libs/PHPExcel.php';
include_once BASE_DIR . 'libs/PHPExcel/IOFactory.php';


class StaticPricesController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopStaticPrice
     */
    protected $PrintShopStaticPrice;
    /**
     * @var PrintShopConfigExclusion
     */
    protected $PrintShopConfigExclusion;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var PrintShopVolume
     */
    protected $PrintShopVolume;
    /**
     * @var PrintShopOption
     */
    protected $PrintShopOption;
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var Standard
     */
    private $Standard;
    protected $ExcelReader;
    protected $ExcelWriter;
    protected $ExcelFile;
    public $sheetIndex = 0;
    protected $filename;
    /**
     * @var string
     */
    protected $path;
    /**
     * @var int
     */
    private $limit = 15000;
    /**
     * @var int
     */
    private $actualIndex = 0;

    /**
     * StaticPricesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopStaticPrice = PrintShopStaticPrice::getInstance();
        $this->PrintShopConfigExclusion = PrintShopConfigExclusion::getInstance();

        $this->PrintShopVolume = PrintShopVolume::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->Standard = Standard::getInstance();

        $this->Price = Price::getInstance();
        $this->path = STATIC_PATH . companyID . '/tmp/export/export.xls';
    }

    /**
     * @return int
     */
    public function getLimit()
    {
        return $this->limit;
    }

    /**
     * @param int $limit
     */
    public function setLimit($limit)
    {
        $this->limit = $limit;
    }

    /**
     * @return int
     */
    public function getActualIndex()
    {
        return $this->actualIndex;
    }

    /**
     * @param int $actualIndex
     */
    public function setActualIndex($actualIndex)
    {
        $this->actualIndex = $actualIndex;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return array|bool
     */
    public function staticprices($groupID, $typeID, $formatID)
    {
        $this->PrintShopStaticPrice->setGroupID($groupID);
        $this->PrintShopStaticPrice->setTypeID($typeID);
        $this->PrintShopStaticPrice->setFormatID($formatID);

        $data = $this->PrintShopStaticPrice->getAll();

        if (empty($data)) {
            $data = array();
        } else {
            foreach ($data as $key => $value) {
                $data[$key]['price'] = $this->Price->getNumberToView($value['price']);
                if ($value['expense']) {
                    $data[$key]['expense'] = $this->Price->getNumberToView($value['expense']);
                }
            }
            unset($value);
        }

        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return mixed
     */
    public function patch_staticprices($groupID, $typeID, $formatID)
    {

        $data['response'] = false;
        $options = $this->Data->getPost('options');
        $price = $this->Data->getPost('price');
        $expense = $this->Data->getPost('expense');

        $this->PrintShopStaticPrice->setGroupID($groupID);
        $this->PrintShopStaticPrice->setTypeID($typeID);
        $this->PrintShopStaticPrice->setFormatID($formatID);


        $options = json_decode($options);
        $sorted = array();
        foreach ($options as $key => $each) {
            $sorted[$key] = $each;
        }
        uksort($sorted, array($this->Standard, 'sortLikeJs'));
        $options = json_encode($sorted);

        if (!strlen($price) && $expense === null) {
            if ($this->PrintShopStaticPrice->customDelete($options)) {
                $data['response'] = true;
                $data['info'] = 'Deleted';
            }
            return $data;
        }

        if ($price !== null) {
            $price = $this->Price->getPriceToDb($price);
        }
        if ($expense !== null) {
            $expense = $this->Price->getPriceToDb($expense);
        }

        $response = $this->PrintShopStaticPrice->getByOptions($options);
        if ($response) {
            if ($expense !== null) {
                $key = 'expense';
                $value = $expense;
                if ($expense == 0) {
                    $value = null;
                }
            } else {
                $key = 'price';
                $value = $price;
            }
            if ($this->PrintShopStaticPrice->update($options, $key, $value)) {
                $data['response'] = true;
                $data['info'] = 'Updated';
            }
        } else {
            if ($lastID = $this->PrintShopStaticPrice->create($options, $price, $expense)) {
                $data['response'] = true;
                $data['info'] = 'Created';
            }
        }

        return $data;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return array
     */
    public function export($groupID, $typeID, $formatID)
    {
        ini_set('max_execution_time', 300);

        $this->PrintShopStaticPrice->setGroupID($groupID);
        $this->PrintShopStaticPrice->setTypeID($typeID);
        $this->PrintShopStaticPrice->setFormatID($formatID);


        $this->PrintShopOption->setGroupID($groupID);
        $this->PrintShopOption->setTypeID($typeID);
        $options = $this->PrintShopOption->getAll();

        $attributes = array();
        $aggregateOptions = array();
        foreach ($options as $option) {
            $aggregateOptions[$option['optID']] = $option;
            $option['ID'] = $option['optID'];
            $attributes[$option['attrSort']]['name'] = $option['attrName'];
            $attributes[$option['attrSort']]['ID'] = $option['attrID'];
            $attributes[$option['attrSort']]['name'] = $option['attrName'];
            $attributes[$option['attrSort']]['options'][] = $option;
        }

        $this->PrintShopPage->setGroupID($groupID);
        $this->PrintShopPage->setTypeID($typeID);
        $pages = $this->PrintShopPage->getAll();
        if (empty($pages)) {
            $pages = array(array('pages' => 2));
        }
        $pagesAsAttr = array();
        $pagesAsAttr[0] = array('ID' => 'pages', 'name' => 'pages', 'options' => null);
        foreach ($pages as $page) {
            $pagesAsAttr[0]['options'][] = array('ID' => $page['pages'], 'name' => $page['pages']);
        }
        $attributes = array_merge($pagesAsAttr, $attributes);

        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);

        $volumes = $this->PrintShopVolume->getAllByFormat($formatID);

        if (empty($volumes)) {
            $volumes[] = array('volume' => '1');
        }

        $volumesAsAttr = array('ID' => 'volumes', 'name' => 'volumes', 'options' => null);
        foreach ($volumes as $each) {
            if (!empty($each['formatID']) && $each['formatID'] != $formatID) {
                continue;
            }
            $volumesAsAttr['options'][] = array('ID' => $each['volume'], 'name' => $each['volume']);
        }
        $attributes[] = $volumesAsAttr;

        $matrix = array();
        reset($attributes);
        $first = current($attributes);
        $matrix[0] = $first['options'];

        $numberOfCombinations = 0;

        foreach ($attributes as $each) {
            if ($numberOfCombinations === 0) {
                $numberOfCombinations = count($each['options']);
            } else {
                $numberOfCombinations *= count($each['options']);
            }
        }
        $parts = ceil($numberOfCombinations / $this->getLimit());

        $prices = $this->PrintShopStaticPrice->getAll();

        $urls = [];

        foreach ($attributes as $each) {
            if ($each === $first) {
                continue;
            }
            $matrix = $this->matrix($matrix, $each['options']);
        }

        for ($i = 0; $i < $parts; $i++) {

            $filename = $groupID . '_' . $typeID . '_' . $formatID;
            $sheetName = 'Format ' . $formatID;

            try {
                $newFileName = $this->makeFile($filename, $sheetName, $attributes, $matrix, $prices, $i);
            } catch(PHPExcel_Reader_Exception $exception) {
                return array(
                    'response' => false,
                    'info' => $exception->getMessage()
                );
            }

            $urls[] = STATIC_URL . companyID . '/export/' . $newFileName;

        }

        return array('response' => true, 'urls' => $urls);
    }

    /**
     * @param $extractOptions
     * @param $exclusions
     * @param $aggregateOptions
     * @return array
     */
    private function checkOptionExclusions($extractOptions, $exclusions, $aggregateOptions)
    {
        if (!is_array($exclusions)) {
            return array();
        }

        $excludedOptions = array();
        foreach ($extractOptions as $attrID => $optID) {

            $tmpExclusions = $exclusions;
            $pos = array_search($attrID, array_keys($exclusions));
            if ($pos > 0) {
                array_splice($tmpExclusions, $pos - 1);
            }

            foreach ($tmpExclusions as $tmpExclusion) {
                $explode = explode(',', $tmpExclusion['excList']);
                if (in_array($optID, $explode)) {
                    $option = $aggregateOptions[$optID];
                    $excludedOptions[$option['attrID']] = $optID;
                }
            }
        }

        return $excludedOptions;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @param null $path
     * @return mixed
     * @throws PHPExcel_Reader_Exception
     */
    private function import($groupID, $typeID, $formatID, $path = null)
    {
        ini_set('max_execution_time', 720);

        $this->PrintShopStaticPrice->setGroupID($groupID);
        $this->PrintShopStaticPrice->setTypeID($typeID);
        $this->PrintShopStaticPrice->setFormatID($formatID);

        $data['response'] = true;

        if (!$this->openFile($path)) {
            $data['response'] = false;
            return $data;
        }

        $changes = 0;
        $sheetArray = $this->sheetToArray();

        $actualModel = $this->PrintShopStaticPrice->getDb();

        if( $actualModel->getPdo() === NULL ) {
            $this->PrintShopStaticPrice = new PrintShopStaticPrice();

            $this->PrintShopStaticPrice->setGroupID($groupID);
            $this->PrintShopStaticPrice->setTypeID($typeID);
            $this->PrintShopStaticPrice->setFormatID($formatID);
        }

        foreach ($sheetArray as $key => $row) {
            if ($key == 1) {
                continue;
            }
            $options = $row['A'];

            if (empty($row['B'])) {
                if (!$this->PrintShopStaticPrice->customDelete($options)) {
                    $data['response'] = false;
                    $data['info'][] = 'Cannot delete price ' . $options;
                }
            } else {
                $response = $this->PrintShopStaticPrice->getByOptions($options);
                if ($response) {

                    $price = $this->Price->getPriceToDb($row['B']);
                    if (!empty($row['C'])) {
                        $expense = $this->Price->getPriceToDb($row['C']);
                    } else {
                        $expense = null;
                    }
                    if (!$this->PrintShopStaticPrice->update($options, 'price', $price)
                    ) {
                        $data['response'] = false;
                        $data['info'][] = 'Cannot edit price ' . $options;
                    } else {
                        $changes++;
                    }

                    if (!$this->PrintShopStaticPrice->update($options, 'expense', $expense)) {
                        $data['response'] = false;
                        $data['info'][] = 'Cannot edit expense ' . $options;
                    } else {
                        $changes++;
                    }
                } else {
                    $price = $this->Price->getPriceToDb($row['B']);
                    $expense = $this->Price->getPriceToDb($row['C']);

                    if (!$this->PrintShopStaticPrice->create($options, $price, $expense)) {
                        $data['response'] = false;
                        $data['info'][] = 'Cannot add new price ' . $options;
                    } else {
                        $changes++;
                    }
                }
            }
        }
        $data['changes'] = $changes;
        return $data;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @return mixed
     * @throws PHPExcel_Reader_Exception
     */
    public function post_import($groupID, $typeID, $formatID)
    {
        $data['response'] = true;

        if (isset($_FILES)) {
            $data['files'] = $_FILES;
            $file = $_FILES['file'];
            $dir = STATIC_PATH . companyID . '/export/tmp/';
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            $filename = $groupID . '_' . $typeID . '_' . $formatID . '.xls';
            $path = $dir . $filename;
            $data['path'] = $path;
            if (move_uploaded_file($file['tmp_name'], $path)) {
                $data = $this->import($groupID, $typeID, $formatID, $path);
                $data['uploadSuccess'] = true;
            } else {
                $data['response'] = false;
                $data['info'] = 'Upload failed';
            }


        } else {
            $data['response'] = false;
        }

        return $data;

    }

    /**
     * @param string $sheetName
     * @return bool
     * @throws PHPExcel_Reader_Exception
     */
    public function newFile($sheetName = 'format')
    {
        $this->ExcelFile = new PHPExcel();

        $this->ExcelWriter = PHPExcel_IOFactory::createWriter($this->ExcelFile, 'Excel5');
        $objSheet = $this->ExcelFile->getActiveSheet();
        $objSheet->setTitle($sheetName);
        return true;

    }

    /**
     * @param null $path
     * @return bool
     * @throws PHPExcel_Reader_Exception
     */
    private function openFile($path = null)
    {
        if ($path == null)
            $src = $this->path;
        else
            $src = $path;
        if (!file_exists($src)) {
            return false;
        }
        $inputFileType = PHPExcel_IOFactory::identify($src);
        $this->ExcelReader = PHPExcel_IOFactory::createReader($inputFileType);

        $this->ExcelFile = new PHPExcel();
        $this->ExcelFile = $this->ExcelReader->load($src);

        if ($this->sheetIndex !== null)
            $this->ExcelFile->setActiveSheetIndex($this->sheetIndex);
        return true;
    }

    /**
     * @param $cell
     * @param $value
     * @return bool
     */
    private function setCellValue($cell, $value)
    {
        $cell = strtoupper($cell);
        $this->ExcelFile->getActiveSheet()->setCellValue($cell, $value);
        return true;
    }

    /**
     * @param $cell
     * @return mixed
     */
    private function getCellValue($cell)
    {
        $cell = strtoupper($cell);
        return $this->ExcelFile->getActiveSheet()->getCell($cell)->getCalculatedValue();
    }

    /**
     * @param $cell
     * @return mixed
     */
    private function getCellContent($cell)
    {
        $cell = strtoupper($cell);
        return $this->ExcelFile->getActiveSheet()->getCell($cell)->getValue();
    }

    /**
     * @param $index
     * @return bool
     */
    private function setActiveSheet($index)
    {
        $this->ExcelFile->setActiveSheetIndex($index);
        return true;
    }

    /**
     * @return mixed
     */
    private function sheetToArray()
    {
        return $this->ExcelFile->getActiveSheet()->toArray(null, true, true, true);
    }

    /**
     * @return bool
     */
    private function saveFile()
    {
        $this->ExcelWriter->save($this->path);
        chmod($this->path, 0777);
        return true;
    }

    /**
     * @param $matrix
     * @param $array
     * @return mixed
     */
    private function matrix($matrix, $array)
    {

        $newIndex = count($matrix);

        $countMatrix = count($matrix);

        for ($i = 0; $i < $countMatrix; $i++) {

            $countMatrixI = count($matrix[$i]);
            for ($j = 0; $j < $countMatrixI; $j++) {

                for ($k = 0; $k < count($array); $k++) {

                    if ($k == 0) {
                        $matrix[$newIndex][$j] = $array[$k];
                    } else {
                        $matrix[$newIndex][count($matrix[$i])] = $array[$k];
                        $matrix[$i][] = $matrix[$i][$j];
                    }

                }
            }

        }

        return $matrix;
    }

    /**
     * @param $filename
     * @param $sheetName
     * @param $attributes
     * @param $matrix
     * @param $prices
     * @param $part
     * @return string
     * @throws PHPExcel_Reader_Exception
     */
    private function makeFile($filename, $sheetName, $attributes, $matrix, $prices, $part)
    {
        $dir = STATIC_PATH . companyID . '/export/';
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        $filename .= '-part-' . $part . '.xls';

        $this->path = $dir . $filename;


        $this->newFile($sheetName);

        $header = array('Klucz', 'Cena', 'Koszt');
        foreach ($attributes as $each) {
            $header[] = $each['name'];
        }

        $alphas = range('A', 'Z');
        foreach ($header as $i => $each) {
            $cell = $alphas[$i] . '1';
            $this->setCellValue($cell, $each);
        }

        if (empty($prices)) {
            $prices = array();
        }

        $startIndex = $part * $this->getLimit();
        $endIndex = (($part + 1) * $this->getLimit()) - 1;

        for ($i = $startIndex; $i < count($matrix[0]); $i++) {

            if ($i < $startIndex || $i > $endIndex) {
                continue;
            }

            $options = array();
            $optNames = array();
            $row = array();
            for ($j = 0; $j < count($matrix); $j++) {
                $options[$attributes[$j]['ID']] = intval($matrix[$j][$i]['ID']);
                $optNames[] = $matrix[$j][$i]['name'];
            }

            uksort($options, array($this->Standard, 'sortLikeJs'));

            $row['key'] = json_encode($options);

            $row['price'] = '';
            $row['expense'] = '';
            foreach ($prices as $key => $price) {
                if ($price['options'] == $row['key']) {
                    $row['price'] = $this->Price->getNumberToView($price['price']);
                    if ($price['expense'] != null)
                        $row['expense'] = $this->Price->getNumberToView($price['expense']);
                    unset($prices[$key]);
                    break;
                }
            }
            $row = array_merge($row, $optNames);

            $sheetRow = ($i - $startIndex) + 2;
            $j = 0;
            foreach ($row as $value) {
                $sheetCol = $alphas[$j];
                $cell = $sheetCol . $sheetRow;
                if ($value === false) {
                    $value = '';
                }
                $this->setCellValue($cell, $value);
                $j++;
            }

        }

        $this->saveFile();


        return $filename;
    }



}