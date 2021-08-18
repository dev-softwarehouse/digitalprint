<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 16-04-2018
 * Time: 15:14
 */

namespace DreamSoft\Controllers\Components;


use DreamSoft\Core\Component;

class AttributeProcessFactory extends Component
{
    /**
     * @var int
     */
    private $attributeID;
    /**
     * @var int
     */
    private $optionID;
    /**
     * @var int
     */
    private $printTypeID;
    /**
     * @var array
     */
    private $workspace;
    /**
     * @var int
     */
    private $priceListID;
    /**
     * @var float
     */
    private $sheets;
    /**
     * @var float
     */
    private $projectSheet;
    /**
     * @var float
     */
    private $perimeter;
    /**
     * @var int
     */
    private $volume;
    /**
     * @var int
     */
    private $attributePages;
    /**
     * @var int
     */
    private $pages;
    /**
     * @var float
     */
    private $size;
    /**
     * @var int
     */
    private $copiesOnAllSheets;
    /**
     * @var float
     */
    private $totalArea;
    /**
     * @var array
     */
    private $area;
    /**
     * @var int
     */
    private $totalSheetFolds;
    /**
     * @var int
     */
    private $sheetIncrease;
    /**
     * @var int
     */
    private $setIncrease;
    /**
     * @var int
     */
    private $formatWidth;
    /**
     * @var int
     */
    private $formatHeight;
    /**
     * @var bool
     */
    private $expense;
    /**
     * @var int
     */
    private $maxFolds;
    /**
     * @var int
     */
    private $calculateID;

    /**
     * AttributeProcessFactory constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return int
     */
    public function getAttributeID()
    {
        return $this->attributeID;
    }

    /**
     * @param int $attributeID
     */
    public function setAttributeID($attributeID)
    {
        $this->attributeID = $attributeID;
    }

    /**
     * @return int
     */
    public function getOptionID()
    {
        return $this->optionID;
    }

    /**
     * @param int $optionID
     */
    public function setOptionID($optionID)
    {
        $this->optionID = $optionID;
    }

    /**
     * @return int
     */
    public function getPrintTypeID()
    {
        return $this->printTypeID;
    }

    /**
     * @param int $printTypeID
     */
    public function setPrintTypeID($printTypeID)
    {
        $this->printTypeID = $printTypeID;
    }

    /**
     * @return array
     */
    public function getWorkspace()
    {
        return $this->workspace;
    }

    /**
     * @param array $workspace
     */
    public function setWorkspace($workspace)
    {
        $this->workspace = $workspace;
    }

    /**
     * @return int
     */
    public function getPriceListID()
    {
        return $this->priceListID;
    }

    /**
     * @param int $priceListID
     */
    public function setPriceListID($priceListID)
    {
        $this->priceListID = $priceListID;
    }

    /**
     * @return float
     */
    public function getSheets()
    {
        return $this->sheets;
    }

    /**
     * @param float $sheets
     */
    public function setSheets($sheets)
    {
        $this->sheets = $sheets;
    }

    /**
     * @return float
     */
    public function getProjectSheet()
    {
        return $this->projectSheet;
    }

    /**
     * @param float $projectSheet
     */
    public function setProjectSheet($projectSheet)
    {
        $this->projectSheet = $projectSheet;
    }

    /**
     * @return float
     */
    public function getPerimeter()
    {
        return $this->perimeter;
    }

    /**
     * @param float $perimeter
     */
    public function setPerimeter($perimeter)
    {
        $this->perimeter = $perimeter;
    }

    /**
     * @return int
     */
    public function getVolume()
    {
        return $this->volume;
    }

    /**
     * @param int $volume
     */
    public function setVolume($volume)
    {
        $this->volume = $volume;
    }

    /**
     * @return int
     */
    public function getAttributePages()
    {
        return $this->attributePages;
    }

    /**
     * @param int $attributePages
     */
    public function setAttributePages($attributePages)
    {
        $this->attributePages = $attributePages;
    }

    /**
     * @return int
     */
    public function getPages()
    {
        return $this->pages;
    }

    /**
     * @param int $pages
     */
    public function setPages($pages)
    {
        $this->pages = $pages;
    }

    /**
     * @return float
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @param float $size
     */
    public function setSize($size)
    {
        $this->size = $size;
    }

    /**
     * @return int
     */
    public function getCopiesOnAllSheets()
    {
        return $this->copiesOnAllSheets;
    }

    /**
     * @param int $copiesOnAllSheets
     */
    public function setCopiesOnAllSheets($copiesOnAllSheets)
    {
        $this->copiesOnAllSheets = $copiesOnAllSheets;
    }

    /**
     * @return float
     */
    public function getTotalArea()
    {
        return $this->totalArea;
    }

    /**
     * @param float $totalArea
     */
    public function setTotalArea($totalArea)
    {
        $this->totalArea = $totalArea;
    }

    /**
     * @return int
     */
    public function getTotalSheetFolds()
    {
        return $this->totalSheetFolds;
    }

    /**
     * @param int $totalSheetFolds
     */
    public function setTotalSheetFolds($totalSheetFolds)
    {
        $this->totalSheetFolds = $totalSheetFolds;
    }

    /**
     * @return int
     */
    public function getSheetIncrease()
    {
        return $this->sheetIncrease;
    }

    /**
     * @param int $sheetIncrease
     */
    public function setSheetIncrease($sheetIncrease)
    {
        $this->sheetIncrease = $sheetIncrease;
    }

    /**
     * @return int
     */
    public function getSetIncrease()
    {
        return $this->setIncrease;
    }

    /**
     * @param int $setIncrease
     */
    public function setSetIncrease($setIncrease)
    {
        $this->setIncrease = $setIncrease;
    }

    /**
     * @return int
     */
    public function getFormatWidth()
    {
        return $this->formatWidth;
    }

    /**
     * @param int $formatWidth
     */
    public function setFormatWidth($formatWidth)
    {
        $this->formatWidth = $formatWidth;
    }

    /**
     * @return int
     */
    public function getFormatHeight()
    {
        return $this->formatHeight;
    }

    /**
     * @param int $formatHeight
     */
    public function setFormatHeight($formatHeight)
    {
        $this->formatHeight = $formatHeight;
    }

    /**
     * @return bool
     */
    public function isExpense()
    {
        return $this->expense;
    }

    /**
     * @param bool $expense
     */
    public function setExpense($expense)
    {
        $this->expense = $expense;
    }

    /**
     * @return array
     */
    public function getArea()
    {
        return $this->area;
    }

    /**
     * @param array $area
     */
    public function setArea($area)
    {
        $this->area = $area;
    }

    /**
     * @return int
     */
    public function getMaxFolds()
    {
        return $this->maxFolds;
    }

    /**
     * @param int $maxFolds
     */
    public function setMaxFolds($maxFolds)
    {
        $this->maxFolds = $maxFolds;
    }

    /**
     * @return int
     */
    public function getCalculateID()
    {
        return $this->calculateID;
    }

    /**
     * @param int $calculateID
     */
    public function setCalculateID($calculateID)
    {
        $this->calculateID = $calculateID;
    }

}